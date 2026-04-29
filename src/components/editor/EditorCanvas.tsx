'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import {
  findPortAtScreen,
  screenToCanvas,
  canvasToScreen,
  getPortScreenPos,
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

  // ── Paint ─────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
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

    for (const p of state.placed) {
      const drawer = config.drawers[p.kind];
      if (!drawer) continue;
      const selected = state.selection.kind === 'component' && state.selection.id === p.id;
      const hovered = state.hoveredId === p.id;
      drawer(ctx, p, runResult?.[p.id], selected, hovered);
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
      const fromOffset = config.portLayout[fromComp.kind]?.[conn.from.portName];
      const toOffset = config.portLayout[toComp.kind]?.[conn.to.portName];
      if (!fromOffset || !toOffset) continue;
      const fx = fromComp.anchor.x + fromOffset.dx;
      const fy = fromComp.anchor.y + fromOffset.dy;
      const tx = toComp.anchor.x + toOffset.dx;
      const ty = toComp.anchor.y + toOffset.dy;
      const selected = state.selection.kind === 'connection' && state.selection.index === i;
      ctx.save();
      if (selected) {
        ctx.strokeStyle = '#2563EB';
        ctx.lineWidth = config.connection.strokeWidth + 1;
      }
      ctx.beginPath();
      ctx.moveTo(fx, fy);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
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
      );
      if (portHit) {
        if (state.draftWire) {
          dispatch({
            type: 'finishWire',
            componentId: portHit.componentId,
            port: portHit.portName,
          });
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
    dragRef.current = null;
  }, []);

  const onMouseLeave = useCallback(() => {
    dragRef.current = null;
    if (state.hoveredId !== null) {
      dispatch({ type: 'hoverComponent', id: null });
    }
  }, [state.hoveredId, dispatch]);

  // ── Keyboard ───────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (state.draftWire) dispatch({ type: 'cancelWire' });
        else dispatch({ type: 'selectComponent', id: null });
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (state.selection.kind !== 'none') {
          // Avoid intercepting input fields
          const tag = (e.target as HTMLElement | null)?.tagName ?? '';
          if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
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
            return (
              <line
                x1={fromScreen.x}
                y1={fromScreen.y}
                x2={toScreen.x}
                y2={toScreen.y}
                stroke="#2563EB"
                strokeWidth={2}
                strokeDasharray="5,3"
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
