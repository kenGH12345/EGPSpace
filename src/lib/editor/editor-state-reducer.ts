/**
 * editor-state-reducer — pure (state, action) → state transformer.
 *
 * Design (B-2):
 *   - Zero React dependency (AC-B2). Runs in plain Node/jest.
 *   - No mutation: always returns a fresh state via cloneEditorState.
 *   - Each action is a discriminated union case for exhaustive type safety.
 *
 * Naming convention:
 *   - "placeComponent" adds to placed[]
 *   - "moveComponent" updates placed[i].anchor
 *   - "startWire" / "finishWire" / "cancelWire" manage draftWire + connections
 */

import type { ComponentDomain } from '@/lib/framework';
import type { AssemblyBundle } from '@/lib/framework';
import {
  type EditorState,
  type PlacedComponent,
  type EditorSelection,
  cloneEditorState,
} from './editor-state';
import { autoLayout, type LayoutAlgorithm } from './layout';
import { snapToGrid } from './port-layout';

// ── Action types ──────────────────────────────────────────────────────────

export type EditorAction =
  | {
      type: 'placeComponent';
      kind: string;
      position: { x: number; y: number };
      defaults?: Record<string, unknown>;
      id?: string; // optional explicit id (for replay/import); otherwise auto-generated
    }
  | { type: 'moveComponent'; id: string; delta: { x: number; y: number }; snapGrid?: number }
  | { type: 'setComponentAnchor'; id: string; anchor: { x: number; y: number } }
  | { type: 'selectComponent'; id: string | null }
  | { type: 'selectConnection'; index: number | null }
  | { type: 'deleteSelection' }
  | { type: 'updateProp'; id: string; key: string; value: unknown }
  | { type: 'startWire'; componentId: string; port: string; cursor: { x: number; y: number } }
  | { type: 'updateWireCursor'; x: number; y: number }
  | { type: 'finishWire'; componentId: string; port: string }
  | { type: 'cancelWire' }
  | { type: 'removeConnection'; index: number }
  | { type: 'setCamera'; offset?: { x: number; y: number }; zoom?: number }
  | { type: 'switchDomain'; domain: ComponentDomain }
  | { type: 'loadBundle'; bundle: AssemblyBundle<ComponentDomain> }
  | { type: 'autoLayout'; algorithm?: LayoutAlgorithm }
  | { type: 'hoverComponent'; id: string | null };

// ── Id generator ──────────────────────────────────────────────────────────

/** Generate a unique id within a placed list: "<kind>-1", "<kind>-2", ... */
function nextId(placed: PlacedComponent[], kind: string): string {
  const existingIds = new Set(placed.map((p) => p.id));
  let n = 1;
  while (existingIds.has(`${kind}-${n}`)) n++;
  return `${kind}-${n}`;
}

// ── Reducer ──────────────────────────────────────────────────────────────

export function applyEditorAction<D extends ComponentDomain>(
  state: EditorState<D>,
  action: EditorAction,
): EditorState<D> {
  const next = cloneEditorState(state);

  switch (action.type) {
    case 'placeComponent': {
      const id = action.id ?? nextId(next.placed, action.kind);
      next.placed.push({
        id,
        kind: action.kind,
        props: { ...(action.defaults ?? {}) },
        anchor: { x: action.position.x, y: action.position.y },
      });
      next.selection = { kind: 'component', id };
      return next;
    }

    case 'moveComponent': {
      const p = next.placed.find((x) => x.id === action.id);
      if (p) {
        const rawX = p.anchor.x + action.delta.x;
        const rawY = p.anchor.y + action.delta.y;
        const grid = action.snapGrid;
        p.anchor = {
          x: grid && grid > 0 ? snapToGrid(rawX, grid) : rawX,
          y: grid && grid > 0 ? snapToGrid(rawY, grid) : rawY,
          rotation: p.anchor.rotation,
        };
      }
      return next;
    }

    case 'setComponentAnchor': {
      const p = next.placed.find((x) => x.id === action.id);
      if (p) {
        p.anchor = { x: action.anchor.x, y: action.anchor.y, rotation: p.anchor.rotation };
      }
      return next;
    }

    case 'selectComponent': {
      next.selection =
        action.id === null ? { kind: 'none' } : { kind: 'component', id: action.id };
      return next;
    }

    case 'selectConnection': {
      next.selection =
        action.index === null ? { kind: 'none' } : { kind: 'connection', index: action.index };
      return next;
    }

    case 'deleteSelection': {
      const sel: EditorSelection = next.selection;
      if (sel.kind === 'component') {
        // remove component and any connection touching it
        next.placed = next.placed.filter((p) => p.id !== sel.id);
        next.connections = next.connections.filter(
          (c) => c.from.componentId !== sel.id && c.to.componentId !== sel.id,
        );
      } else if (sel.kind === 'connection') {
        next.connections = next.connections.filter((_, i) => i !== sel.index);
      }
      next.selection = { kind: 'none' };
      return next;
    }

    case 'updateProp': {
      const p = next.placed.find((x) => x.id === action.id);
      if (p) {
        p.props = { ...p.props, [action.key]: action.value };
      }
      return next;
    }

    case 'startWire': {
      next.draftWire = {
        from: { componentId: action.componentId, port: action.port },
        cursor: { x: action.cursor.x, y: action.cursor.y },
      };
      return next;
    }

    case 'updateWireCursor': {
      if (next.draftWire) {
        next.draftWire = {
          from: next.draftWire.from,
          cursor: { x: action.x, y: action.y },
        };
      }
      return next;
    }

    case 'finishWire': {
      if (!next.draftWire) return next;
      const from = next.draftWire.from;
      const to = { componentId: action.componentId, port: action.port };
      // Reject self-loop on same port (F-2)
      if (from.componentId === to.componentId && from.port === to.port) {
        next.draftWire = null;
        return next;
      }
      // Reject duplicate connection (F-1)
      const exists = next.connections.some(
        (c) =>
          (c.from.componentId === from.componentId &&
            c.from.portName === from.port &&
            c.to.componentId === to.componentId &&
            c.to.portName === to.port) ||
          (c.from.componentId === to.componentId &&
            c.from.portName === to.port &&
            c.to.componentId === from.componentId &&
            c.to.portName === from.port),
      );
      if (exists) {
        next.draftWire = null;
        return next;
      }
      next.connections.push({
        from: { componentId: from.componentId, portName: from.port },
        to: { componentId: to.componentId, portName: to.port },
      });
      next.draftWire = null;
      return next;
    }

    case 'cancelWire': {
      next.draftWire = null;
      return next;
    }

    case 'removeConnection': {
      next.connections = next.connections.filter((_, i) => i !== action.index);
      if (next.selection.kind === 'connection' && next.selection.index === action.index) {
        next.selection = { kind: 'none' };
      }
      return next;
    }

    case 'setCamera': {
      if (action.offset) next.camera.offset = { ...action.offset };
      if (typeof action.zoom === 'number') next.camera.zoom = action.zoom;
      return next;
    }

    case 'switchDomain': {
      // Full reset — caller should save current state first if desired
      return {
        domain: action.domain as D,
        placed: [],
        connections: [],
        selection: { kind: 'none' },
        draftWire: null,
        camera: { offset: { x: 0, y: 0 }, zoom: 1 },
        hoveredId: null,
      };
    }

    case 'loadBundle': {
      const { bundle } = action;
      const layoutMap = new Map<string, { x: number; y: number; rotation?: number }>();
      if (bundle.layout) {
        for (const e of bundle.layout.entries) {
          layoutMap.set(e.componentId, e.anchor);
        }
      }

      // Build placed list first (可能先全部为 (0, 0))
      const placedList: PlacedComponent[] = bundle.spec.components.map((c) => ({
        id: c.id,
        kind: c.kind,
        props: { ...c.props },
        anchor: layoutMap.get(c.id) ?? { x: 0, y: 0 },
      }));

      const connectionList = (bundle.spec.connections as Array<{
        from: { componentId: string; portName: string };
        to: { componentId: string; portName: string };
        kind?: string;
      }>).map((c) => ({
        from: { componentId: c.from.componentId, portName: c.from.portName },
        to: { componentId: c.to.componentId, portName: c.to.portName },
        kind: c.kind,
      }));

      // Auto-fill layout when: no layout entries AND all placed are at (0,0) AND有元件
      // （保护：用户有任何非零坐标都不覆盖；AC-C2 R-15）
      const hasLayoutEntries = bundle.layout && bundle.layout.entries.length > 0;
      const allAtOrigin = placedList.length > 0 && placedList.every(
        (p) => p.anchor.x === 0 && p.anchor.y === 0,
      );

      if (!hasLayoutEntries && allAtOrigin) {
        const result = autoLayout(
          {
            componentIds: placedList.map((p) => p.id),
            connections: connectionList.map((c) => ({
              from: c.from.componentId,
              to: c.to.componentId,
            })),
          },
          'grid',
        );
        for (const p of placedList) {
          const pos = result.positions[p.id];
          if (pos) {
            p.anchor = { x: pos.x, y: pos.y, rotation: p.anchor.rotation };
          }
        }
      }

      return {
        domain: bundle.spec.domain as D,
        placed: placedList,
        connections: connectionList,
        selection: { kind: 'none' },
        draftWire: null,
        camera: { offset: { x: 0, y: 0 }, zoom: 1 },
        hoveredId: null,
      };
    }

    case 'autoLayout': {
      const algorithm: LayoutAlgorithm = action.algorithm ?? 'grid';
      const result = autoLayout(
        {
          componentIds: next.placed.map((p) => p.id),
          connections: next.connections.map((c) => ({
            from: c.from.componentId,
            to: c.to.componentId,
          })),
        },
        algorithm,
      );
      for (const p of next.placed) {
        const pos = result.positions[p.id];
        if (pos) {
          p.anchor = { x: pos.x, y: pos.y, rotation: p.anchor.rotation };
        }
      }
      return next;
    }

    case 'hoverComponent': {
      // D 阶段: 交互态反馈 · 由 history.ignoreActions 过滤不进 undo past
      next.hoveredId = action.id;
      return next;
    }

    default: {
      // Exhaustiveness check
      const _exhaustive: never = action;
      void _exhaustive;
      return next;
    }
  }
}
