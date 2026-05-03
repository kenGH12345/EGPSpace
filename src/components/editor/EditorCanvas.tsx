'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  findPortAtScreen,
  screenToCanvas,
  canvasToScreen,
  getPortScreenPos,
  getPortCanvasPos,
  componentBounds,
  isPointInBounds,
  type EditorAction,
  type EditorState,
  type EditorDomainConfig,
  PORT_RADIUS_PX,
  PORT_HIT_RADIUS_PX,
} from '@/lib/editor';

export interface EditorCanvasProps {
  state: EditorState;
  config: EditorDomainConfig;
  dispatch: React.Dispatch<EditorAction>;
  runResult?: Record<string, Record<string, unknown>>;
}

/**
 * Central canvas. Renders placed components (via canvas 2D + TS drawers),
 * connection paths, draft wire and port hotspots (DOM overlay).
 *
 * Layout:
 *   <div ref=containerRef>  (relative, sized by parent)
 *     <canvas>              (absolute, z:1) — components
 *     <svg>                 (absolute, z:2, pointer-events:none) — wires
 *     <div port-overlay>    (absolute, z:3) — port hotspots (pointer-events:auto)
 *
 * Coordinate systems:
 *   - screen: client pixels (e.clientX relative to container)
 *   - canvas: logical coordinates (drawer uses these directly when we apply
 *     ctx.translate(camera.offset) + ctx.scale(camera.zoom) at the start of
 *     each frame).
 */
export function EditorCanvas({ state, config, dispatch, runResult }: EditorCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const dragRef = useRef<
    | null
    | { kind: 'pan'; startClient: { x: number; y: number }; startOffset: { x: number; y: number } }
    | { kind: 'move'; id: string; lastCanvas: { x: number; y: number } }
  >(null);

  // ── Resize observer ────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const r = el.getBoundingClientRect();
      setCanvasSize({ width: Math.max(320, Math.floor(r.width)), height: Math.max(240, Math.floor(r.height)) });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // ── Lerp State ────────────────────────────────────────────────────
  const lerpStateRef = useRef<Record<string, Record<string, number>>>({});

  // ── Paint Loop ────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let reqId: number;

    const tick = () => {
      reqId = requestAnimationFrame(tick);

      // handle HiDPI
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      if (canvas.width !== canvasSize.width * dpr || canvas.height !== canvasSize.height * dpr) {
        canvas.width = canvasSize.width * dpr;
        canvas.height = canvasSize.height * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);

      // Grid background
      drawGrid(ctx, canvasSize, state.camera);

      // Apply camera transform for component drawing
      ctx.save();
      ctx.translate(state.camera.offset.x, state.camera.offset.y);
      ctx.scale(state.camera.zoom, state.camera.zoom);

      // ── Lerp Update & Component Draw ──
      const alpha = 0.15;
      for (const p of state.placed) {
        if (!lerpStateRef.current[p.id]) {
          lerpStateRef.current[p.id] = {};
        }
        const localLerp = lerpStateRef.current[p.id];
        const target = runResult?.[p.id] as Record<string, unknown> | undefined;
        
        // 1. Target interpolation
        if (target) {
          for (const [k, v] of Object.entries(target)) {
            if (typeof v === 'number') {
              const curr = localLerp[k] ?? 0;
              localLerp[k] = curr + (v - curr) * alpha;
              if (Math.abs(localLerp[k] - v) < 0.001) localLerp[k] = v;
            }
          }
        } else {
          // Decay numeric properties to 0 if engine drops them (e.g. broken circuit -> no current)
          for (const k of Object.keys(localLerp)) {
            const curr = localLerp[k];
            localLerp[k] = curr + (0 - curr) * alpha;
            if (Math.abs(localLerp[k]) < 0.001) localLerp[k] = 0;
          }
        }

        // 2. Mix results: Lerp values overwrite target raw values
        const mixedResult: Record<string, unknown> = target ? { ...target } : {};
        for (const [k, v] of Object.entries(localLerp)) {
          mixedResult[k] = v;
        }

        const drawer = config.drawers[p.kind];
        if (!drawer) continue;
        const selected =
          (state.selection.kind === 'component' && state.selection.id === p.id) ||
          (state.selection.kind === 'multi' && state.selection.ids.includes(p.id));
        const hovered = state.hoveredId === p.id;
        
        const rotation = p.anchor.rotation || 0;
        if (rotation !== 0) {
          ctx.save();
          const entry = config.palette.find((x) => x.kind === p.kind);
          const size = entry?.hintSize ?? { width: 50, height: 40 };
          const cx = p.anchor.x + size.width / 2;
          const cy = p.anchor.y + size.height / 2;
          ctx.translate(cx, cy);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.translate(-cx, -cy);
          drawer(ctx, p, mixedResult, selected, hovered);
          ctx.restore();
        } else {
          drawer(ctx, p, mixedResult, selected, hovered);
        }
      }

      // Connections: draw in canvas coords
      ctx.strokeStyle = config.connection.stroke;
      ctx.lineWidth = config.connection.strokeWidth;
      if (config.connection.dash) ctx.setLineDash(config.connection.dash);
      for (let i = 0; i < state.connections.length; i++) {
        const conn = state.connections[i];
        const fromComp = state.placed.find((pp) => pp.id === conn.from.componentId);
        const toComp = state.placed.find((pp) => pp.id === conn.to.componentId);
        if (!fromComp || !toComp) continue;
        
        const fromPos = getPortCanvasPos(fromComp, conn.from.portName, config.portLayout, config.palette);
        const toPos = getPortCanvasPos(toComp, conn.to.portName, config.portLayout, config.palette);
        const fx = fromPos.x;
        const fy = fromPos.y;
        const tx = toPos.x;
        const ty = toPos.y;
        
        const selected = state.selection.kind === 'connection' && state.selection.index === i;
        ctx.save();
        if (selected) {
          ctx.strokeStyle = '#2563EB';
          ctx.lineWidth = config.connection.strokeWidth + 1;
        }
        ctx.beginPath();
        ctx.moveTo(fx, fy);
        const midX = (fx + tx) / 2;
        ctx.lineTo(midX, fy);
        ctx.lineTo(midX, ty);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    };

    reqId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(reqId);
  }, [state, config, canvasSize, runResult]);

  // ── Event handlers ────────────────────────────────────────────────

  const clientPointToScreen = useCallback((clientX: number, clientY: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    return {
      x: clientX - (rect?.left ?? 0),
      y: clientY - (rect?.top ?? 0),
    };
  }, []);

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const screen = clientPointToScreen(e.clientX, e.clientY);
      const canvasPt = screenToCanvas(screen, state.camera);

      // Port hit-test (screen-space)
      const portHit = findPortAtScreen(
        screen,
        state.placed,
        config.portLayout,
        state.camera,
        PORT_HIT_RADIUS_PX,
        config.palette,
      );
      if (portHit) {
        if (state.draftWire) {
          const fromComp = state.placed.find((p) => p.id === state.draftWire!.from.componentId);
          const toComp = state.placed.find((p) => p.id === portHit.componentId);
          
          if (fromComp && toComp) {
            const canConnect = config.validateConnection
              ? config.validateConnection(
                  { kind: fromComp.kind, port: state.draftWire.from.port },
                  { kind: toComp.kind, port: portHit.portName }
                )
              : true;
            
            if (canConnect) {
              dispatch({
                type: 'finishWire',
                componentId: portHit.componentId,
                port: portHit.portName,
              });
            } else {
              // 取消连线或给出反馈（这里选择取消连线）
              dispatch({ type: 'cancelWire' });
            }
          } else {
            dispatch({ type: 'cancelWire' });
          }
        } else {
          dispatch({
            type: 'startWire',
            componentId: portHit.componentId,
            port: portHit.portName,
            cursor: canvasPt,
          });
        }
        e.stopPropagation();
        e.preventDefault();
        return;
      }

      // Component body hit-test via componentBounds (D 阶段 · 替代硬编码 50×40)
      const hit = state.placed.find((p) => {
        const b = componentBounds(p, config.palette);
        return isPointInBounds(canvasPt, b);
      });
      if (hit) {
        if (e.shiftKey) {
          // Shift+Click toggles membership in multi-selection; do not start drag
          dispatch({ type: 'toggleComponentSelection', id: hit.id });
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        // Config-driven click toggle (architecture fix: eliminates hard-coded kind checking)
        const toggleCfg = config.clickToggle?.[hit.kind];
        if (toggleCfg && typeof hit.props[toggleCfg.propKey] === 'boolean') {
          dispatch({ type: 'selectComponent', id: hit.id });
          dispatch({
            type: 'updateProp',
            id: hit.id,
            key: toggleCfg.propKey,
            value: !hit.props[toggleCfg.propKey],
          });
          e.stopPropagation();
          e.preventDefault();
          return;
        }
        dispatch({ type: 'selectComponent', id: hit.id });
        dragRef.current = { kind: 'move', id: hit.id, lastCanvas: canvasPt };
        return;
      }

      // Click on empty area
      if (state.draftWire) {
        dispatch({ type: 'cancelWire' });
        return;
      }
      dispatch({ type: 'selectComponent', id: null });
      // Pan with middle-click or alt-drag
      if (e.button === 1 || e.altKey) {
        dragRef.current = {
          kind: 'pan',
          startClient: { x: e.clientX, y: e.clientY },
          startOffset: { ...state.camera.offset },
        };
      }
    },
    [state, config, dispatch, clientPointToScreen],
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const screen = clientPointToScreen(e.clientX, e.clientY);
      const canvasPt = screenToCanvas(screen, state.camera);

      if (state.draftWire) {
        dispatch({ type: 'updateWireCursor', x: canvasPt.x, y: canvasPt.y });
      }

      const drag = dragRef.current;
      if (!drag) {
        // 非拖拽非连线态 · hover 检测 (D 阶段)
        if (!state.draftWire) {
          const hovered = state.placed.find((p) => {
            const b = componentBounds(p, config.palette);
            return isPointInBounds(canvasPt, b);
          });
          const newHoveredId = hovered?.id ?? null;
          if (newHoveredId !== state.hoveredId) {
            dispatch({ type: 'hoverComponent', id: newHoveredId });
          }
        }
        return;
      }
      if (drag.kind === 'move') {
        const delta = { x: canvasPt.x - drag.lastCanvas.x, y: canvasPt.y - drag.lastCanvas.y };
        dispatch({
          type: 'moveComponent',
          id: drag.id,
          delta,
          snapGrid: config.snapGrid,
        });
        drag.lastCanvas = canvasPt;
      } else if (drag.kind === 'pan') {
        const dx = e.clientX - drag.startClient.x;
        const dy = e.clientY - drag.startClient.y;
        dispatch({
          type: 'setCamera',
          offset: { x: drag.startOffset.x + dx, y: drag.startOffset.y + dy },
        });
      }
    },
    [state, config, dispatch, clientPointToScreen],
  );

  const onMouseUp = useCallback(() => {
    if (dragRef.current && dragRef.current.kind === 'move') {
      const movedId = dragRef.current.id;
      const movedComp = state.placed.find((p) => p.id === movedId);
      const movingPorts = movedComp ? config.portLayout[movedComp.kind] : null;

      if (movedComp && movingPorts) {
        let bestSnap: {
          targetCompId: string;
          targetPort: string;
          myPort: string;
          dist: number;
          targetPos: { x: number; y: number };
          myOffset: { dx: number; dy: number };
        } | null = null;

        const SNAP_RADIUS = 20; // 磁吸侦测半径 (Canvas坐标系单位)

        for (const [myPortName] of Object.entries(movingPorts)) {
          const myPos = getPortCanvasPos(movedComp, myPortName, config.portLayout, config.palette);

          for (const other of state.placed) {
            if (other.id === movedId) continue;
            const otherPorts = config.portLayout[other.kind];
            if (!otherPorts) continue;

            for (const [otherPortName] of Object.entries(otherPorts)) {
              const otherPos = getPortCanvasPos(other, otherPortName, config.portLayout, config.palette);
              const dist = Math.hypot(myPos.x - otherPos.x, myPos.y - otherPos.y);

              if (dist < SNAP_RADIUS) {
                const canConnect = config.validateConnection
                  ? config.validateConnection(
                      { kind: movedComp.kind, port: myPortName },
                      { kind: other.kind, port: otherPortName },
                    )
                  : true;

                if (canConnect && (!bestSnap || dist < bestSnap.dist)) {
                  bestSnap = {
                    targetCompId: other.id,
                    targetPort: otherPortName,
                    myPort: myPortName,
                    dist,
                    targetPos: otherPos,
                    myOffset: { dx: myPos.x - movedComp.anchor.x, dy: myPos.y - movedComp.anchor.y }
                  };
                }
              }
            }
          }
        }

        if (bestSnap) {
          // 对齐坐标：让移动元件的端口与目标端口精确重合
          const newAnchor = {
            x: bestSnap.targetPos.x - bestSnap.myOffset.dx,
            y: bestSnap.targetPos.y - bestSnap.myOffset.dy,
          };

          // 批量派发：位置微调 + 建立连接
          dispatch({
            type: 'batch',
            actions: [
              { type: 'setComponentAnchor', id: movedId, anchor: newAnchor },
              {
                type: 'addConnection',
                from: { componentId: movedId, portName: bestSnap.myPort },
                to: { componentId: bestSnap.targetCompId, portName: bestSnap.targetPort },
              },
            ],
          });
        }
      }
    }
    dragRef.current = null;
  }, [state.placed, config.portLayout, config.palette, dispatch]);

  const onMouseLeave = useCallback(() => {
    dragRef.current = null;
    if (state.hoveredId !== null) {
      dispatch({ type: 'hoverComponent', id: null });
    }
  }, [state.hoveredId, dispatch]);

  // ── Keyboard ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Avoid intercepting input fields for any hotkey
      const tag = (e.target as HTMLElement | null)?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'Escape') {
        if (state.draftWire) dispatch({ type: 'cancelWire' });
        else dispatch({ type: 'selectComponent', id: null });
      } else if (e.key === 'r' || e.key === 'R') {
        if (state.selection.kind === 'component') {
          e.preventDefault();
          dispatch({ type: 'rotateComponent', id: state.selection.id, deltaDegrees: 90 });
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selection.kind !== 'none') {
          e.preventDefault();
          dispatch({ type: 'deleteSelection' });
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, dispatch]);

  // ── Drop handler ───────────────────────────────────────────────────
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const kind =
        e.dataTransfer.getData('application/x-egp-kind') || e.dataTransfer.getData('text/plain');
      if (!kind) return;
      const paletteEntry = config.palette.find((p) => p.kind === kind);
      if (!paletteEntry) return;
      const screen = clientPointToScreen(e.clientX, e.clientY);
      const canvasPt = screenToCanvas(screen, state.camera);
      // Center the component under the cursor
      const hint = paletteEntry.hintSize ?? { width: 50, height: 40 };
      dispatch({
        type: 'placeComponent',
        kind,
        position: { x: canvasPt.x - hint.width / 2, y: canvasPt.y - hint.height / 2 },
        defaults: { ...paletteEntry.defaultProps },
      });
    },
    [config, state.camera, dispatch, clientPointToScreen],
  );

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-white"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0"
        style={{ width: canvasSize.width, height: canvasSize.height, pointerEvents: 'none' }}
      />

      {/* Draft wire SVG overlay */}
      <svg
        className="absolute inset-0"
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ pointerEvents: 'none' }}
      >
        {state.draftWire &&
          (() => {
            const fromComp = state.placed.find((p) => p.id === state.draftWire!.from.componentId);
            if (!fromComp) return null;
            const fromScreen = getPortScreenPos(
              fromComp,
              state.draftWire.from.port,
              config.portLayout,
              state.camera,
            );
            const toScreen = canvasToScreen(state.draftWire.cursor, state.camera);
            const midX = (fromScreen.x + toScreen.x) / 2;
            const pathD = `M ${fromScreen.x} ${fromScreen.y} L ${midX} ${fromScreen.y} L ${midX} ${toScreen.y} L ${toScreen.x} ${toScreen.y}`;
            return (
              <path
                d={pathD}
                stroke="#2563EB"
                strokeWidth={2}
                strokeDasharray="5,3"
                fill="none"
              />
            );
          })()}
      </svg>

      {/* Port hotspots overlay */}
      <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
        {state.placed.map((p) => {
          const portTable = config.portLayout[p.kind];
          if (!portTable) return null;
          return Object.keys(portTable).map((portName) => {
            const pos = getPortScreenPos(p, portName, config.portLayout, state.camera);
            return (
              <div
                key={`${p.id}-${portName}`}
                className="absolute rounded-full border-2 bg-white hover:bg-blue-100 border-slate-400 hover:border-blue-500 cursor-crosshair"
                style={{
                  width: PORT_RADIUS_PX * 2,
                  height: PORT_RADIUS_PX * 2,
                  left: pos.x - PORT_RADIUS_PX,
                  top: pos.y - PORT_RADIUS_PX,
                  pointerEvents: 'auto',
                }}
                title={`${p.id}.${portName}`}
              />
            );
          });
        })}
      </div>

      {/* Zoom/pan controls */}
      <div className="absolute bottom-2 right-2 flex gap-1 bg-white/90 rounded border px-1 py-0.5 text-xs">
        <button
          className="px-2 hover:bg-slate-100"
          onClick={() =>
            dispatch({
              type: 'setCamera',
              zoom: Math.min(3, state.camera.zoom * 1.2),
            })
          }
        >
          +
        </button>
        <span className="px-2 text-slate-500">{Math.round(state.camera.zoom * 100)}%</span>
        <button
          className="px-2 hover:bg-slate-100"
          onClick={() =>
            dispatch({
              type: 'setCamera',
              zoom: Math.max(0.25, state.camera.zoom / 1.2),
            })
          }
        >
          −
        </button>
        <button
          className="px-2 hover:bg-slate-100"
          onClick={() =>
            dispatch({
              type: 'setCamera',
              offset: { x: 0, y: 0 },
              zoom: 1,
            })
          }
          title="重置"
        >
          ⟲
        </button>
      </div>
    </div>
  );
}

// ── Grid drawing helper (local) ────────────────────────────────────────

function drawGrid(
  ctx: CanvasRenderingContext2D,
  size: { width: number; height: number },
  camera: { offset: { x: number; y: number }; zoom: number },
): void {
  const gridSize = 20 * camera.zoom;
  if (gridSize < 8) return; // too small to render usefully
  const offsetX = camera.offset.x % gridSize;
  const offsetY = camera.offset.y % gridSize;
  ctx.save();
  ctx.strokeStyle = '#E5E7EB';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = offsetX; x <= size.width; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size.height);
  }
  for (let y = offsetY; y <= size.height; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(size.width, y);
  }
  ctx.stroke();
  ctx.restore();
}
