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
import type { AssemblyBundle, MacroExportPortMap } from '@/lib/framework';
import type { MacroDefinition } from '@/lib/framework/macro/flattener';
import {
  type EditorState,
  type PlacedComponent,
  type EditorSelection,
  cloneEditorState,
} from './editor-state';
import { autoLayout, type LayoutAlgorithm } from './layout';
import { snapToGrid } from './port-layout';
import {
  classifyConnections,
  remapBoundaryToComposite,
  buildDefaultExportPortMap,
} from './macro-utils';

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
  | { type: 'rotateComponent'; id: string; deltaDegrees: number }
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
  | { type: 'hoverComponent'; id: string | null }
  | { type: 'addConnection'; from: { componentId: string; portName: string }; to: { componentId: string; portName: string } }
  | { type: 'batch'; actions: EditorAction[] }
  // ── E 阶段 · 组件自由组合自定义元件 ─────────────────────────────────────
  | { type: 'setMultiSelection'; ids: string[] }
  | { type: 'toggleComponentSelection'; id: string }
  | { type: 'registerMacro'; key: string; definition: MacroDefinition }
  | { type: 'removeMacro'; key: string }
  | {
      type: 'encapsulateSelection';
      kind: string; // e.g. "macro:rc-low-pass"
      exportPortMap?: MacroExportPortMap; // optional; auto-derived from boundary if omitted
      compositeId?: string; // optional explicit id; auto-generated otherwise
      position?: { x: number; y: number };
      metadata?: { name?: string; description?: string };
    }
  | {
      type: 'unpackMacro';
      /** Id of the placed composite instance to dissolve back into inner atomic components. */
      id: string;
      /**
       * Optional id-prefix for the expanded inner components so they don't
       * collide with unrelated state.placed ids. Defaults to the composite's id.
       * The final id becomes "<prefix>:<innerId>".
       */
      idPrefix?: string;
    };

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

    case 'rotateComponent': {
      const p = next.placed.find((x) => x.id === action.id);
      if (p) {
        const currentRotation = p.anchor.rotation || 0;
        const newRotation = (currentRotation + action.deltaDegrees) % 360;
        p.anchor = { ...p.anchor, rotation: newRotation < 0 ? newRotation + 360 : newRotation };
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
      } else if (sel.kind === 'multi') {
        const idsToRemove = new Set(sel.ids);
        next.placed = next.placed.filter((p) => !idsToRemove.has(p.id));
        next.connections = next.connections.filter(
          (c) => !idsToRemove.has(c.from.componentId) && !idsToRemove.has(c.to.componentId),
        );
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
        macros: {},
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
          'dagre',
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
        // T-6: hydrate macros from bundle. Old bundles without the field load
        // as {}. Deep-clone so subsequent mutations don't leak back to bundle.
        macros: bundle.macros
          ? Object.keys(bundle.macros).reduce<EditorState<D>['macros']>((acc, k) => {
              const def = bundle.macros![k];
              acc[k] = {
                spec: {
                  ...def.spec,
                  components: def.spec.components.map((c) => ({
                    id: c.id,
                    kind: c.kind,
                    props: { ...c.props },
                  })),
                  connections: def.spec.connections.map((c) => ({
                    from: { ...c.from },
                    to: { ...c.to },
                    ...(c.kind !== undefined ? { kind: c.kind } : {}),
                  })),
                  ...(def.spec.metadata ? { metadata: { ...def.spec.metadata } } : {}),
                },
                exportPortMap: Object.keys(def.exportPortMap).reduce<MacroExportPortMap>((map, portName) => {
                  const ref = def.exportPortMap[portName];
                  map[portName] = { componentId: ref.componentId, portName: ref.portName };
                  return map;
                }, {}),
              };
              return acc;
            }, {})
          : {},
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

    case 'addConnection': {
      const { from, to } = action;
      // Reject self-loop on same port
      if (from.componentId === to.componentId && from.portName === to.portName) return next;
      // Reject duplicate connection
      const exists = next.connections.some(
        (c) =>
          (c.from.componentId === from.componentId &&
            c.from.portName === from.portName &&
            c.to.componentId === to.componentId &&
            c.to.portName === to.portName) ||
          (c.from.componentId === to.componentId &&
            c.from.portName === to.portName &&
            c.to.componentId === from.componentId &&
            c.to.portName === from.portName),
      );
      if (!exists) {
        next.connections.push({ from, to });
      }
      return next;
    }

    case 'batch': {
      // Reduce all actions sequentially over the current state
      return action.actions.reduce((s, a) => applyEditorAction(s, a), next);
    }

    // ── E 阶段 · macro actions ────────────────────────────────────────────
    case 'setMultiSelection': {
      const ids = action.ids.filter((id) => next.placed.some((p) => p.id === id));
      if (ids.length === 0) next.selection = { kind: 'none' };
      else if (ids.length === 1) next.selection = { kind: 'component', id: ids[0] };
      else next.selection = { kind: 'multi', ids: [...new Set(ids)] };
      return next;
    }

    case 'toggleComponentSelection': {
      const id = action.id;
      const exists = next.placed.some((p) => p.id === id);
      if (!exists) return next;
      const sel = next.selection;
      if (sel.kind === 'none') {
        next.selection = { kind: 'component', id };
      } else if (sel.kind === 'connection') {
        next.selection = { kind: 'component', id };
      } else if (sel.kind === 'component') {
        if (sel.id === id) {
          next.selection = { kind: 'none' };
        } else {
          next.selection = { kind: 'multi', ids: [sel.id, id] };
        }
      } else if (sel.kind === 'multi') {
        const current = sel.ids;
        if (current.includes(id)) {
          const remaining = current.filter((x) => x !== id);
          if (remaining.length === 0) next.selection = { kind: 'none' };
          else if (remaining.length === 1) next.selection = { kind: 'component', id: remaining[0] };
          else next.selection = { kind: 'multi', ids: remaining };
        } else {
          next.selection = { kind: 'multi', ids: [...current, id] };
        }
      }
      return next;
    }

    case 'registerMacro': {
      next.macros = { ...next.macros, [action.key]: action.definition };
      return next;
    }

    case 'removeMacro': {
      const inUse = next.placed.some((p) => p.kind === action.key);
      if (inUse) return next; // protect against deleting in-use macro
      const { [action.key]: _removed, ...rest } = next.macros;
      void _removed;
      next.macros = rest;
      return next;
    }

    case 'encapsulateSelection': {
      const sel = next.selection;
      if (sel.kind !== 'multi' || sel.ids.length < 2) return next;

      // Cross-domain guard: all selected components must share the current domain.
      // (EditorState is already single-domain, so presence in next.placed is sufficient.)
      const selectedSet = new Set(sel.ids);
      const selectedComps = next.placed.filter((p) => selectedSet.has(p.id));
      if (selectedComps.length !== sel.ids.length) return next;

      const classification = classifyConnections(selectedSet, next.connections);
      const { exportPortMap: derivedMap, inverseMap } = buildDefaultExportPortMap(
        selectedSet,
        classification.boundary,
      );
      const exportPortMap = action.exportPortMap ?? derivedMap;

      const definition: MacroDefinition = {
        spec: {
          domain: next.domain,
          components: selectedComps.map((p) => ({
            id: p.id,
            kind: p.kind,
            props: { ...p.props },
          })),
          connections: classification.internal.map((c) => ({
            from: { ...c.from },
            to: { ...c.to },
            kind: c.kind,
          })),
          metadata: action.metadata,
        },
        exportPortMap,
      };

      // Register macro definition
      next.macros = { ...next.macros, [action.kind]: definition };

      // Create composite instance
      const compositeId = action.compositeId ?? nextId(next.placed, action.kind);
      const position = action.position ?? {
        x: selectedComps.reduce((sum, p) => sum + p.anchor.x, 0) / selectedComps.length,
        y: selectedComps.reduce((sum, p) => sum + p.anchor.y, 0) / selectedComps.length,
      };

      next.placed = [
        ...next.placed.filter((p) => !selectedSet.has(p.id)),
        {
          id: compositeId,
          kind: action.kind,
          props: {},
          anchor: { x: position.x, y: position.y },
        },
      ];

      // Rewrite boundary connections to point at composite instance
      next.connections = [
        ...classification.external.map((c) => ({
          from: { ...c.from },
          to: { ...c.to },
          kind: c.kind,
        })),
        ...classification.boundary.map((c) =>
          remapBoundaryToComposite(c, selectedSet, compositeId, inverseMap),
        ),
      ];

      next.selection = { kind: 'component', id: compositeId };
      return next;
    }

    case 'unpackMacro': {
      const composite = next.placed.find((p) => p.id === action.id);
      if (!composite) return next;
      const definition = next.macros[composite.kind];
      if (!definition) return next; // not a macro instance — no-op

      const prefix = action.idPrefix ?? composite.id;
      // Map: innerId → prefixedId (used to rewrite both internal and boundary connections)
      const idMap: Record<string, string> = {};
      const existingIds = new Set(next.placed.map((p) => p.id).filter((id) => id !== composite.id));
      for (const inner of definition.spec.components) {
        let candidate = `${prefix}:${inner.id}`;
        let n = 1;
        while (existingIds.has(candidate)) {
          candidate = `${prefix}:${inner.id}-${n++}`;
        }
        idMap[inner.id] = candidate;
        existingIds.add(candidate);
      }

      // Expand internal components at small offsets around the composite's anchor
      // so they're visually distinguishable rather than stacked.
      const baseX = composite.anchor.x;
      const baseY = composite.anchor.y;
      const expandedPlaced: PlacedComponent[] = definition.spec.components.map((inner, i) => ({
        id: idMap[inner.id],
        kind: inner.kind,
        props: { ...inner.props },
        anchor: {
          x: baseX + (i % 3) * 80,
          y: baseY + Math.floor(i / 3) * 60,
        },
      }));

      // Rewrite internal connections with prefixed ids
      const internalConns = definition.spec.connections.map((c) => ({
        from: { componentId: idMap[c.from.componentId], portName: c.from.portName },
        to: { componentId: idMap[c.to.componentId], portName: c.to.portName },
        ...(c.kind !== undefined ? { kind: c.kind } : {}),
      }));

      // Rewrite boundary connections: anything pointing at composite#ExtPort
      // becomes the mapped structured inner component port via exportPortMap.
      // Connections not touching the composite are preserved as-is.
      const remap = (ref: { componentId: string; portName: string }) => {
        if (ref.componentId !== composite.id) return ref;
        const target = definition.exportPortMap[ref.portName];
        if (!target) return ref; // unknown ext port — leave untouched
        const mapped = idMap[target.componentId];
        if (!mapped) return ref;
        return { componentId: mapped, portName: target.portName };
      };

      const rewrittenConns = next.connections.map((c) => ({
        from: remap(c.from),
        to: remap(c.to),
        ...(c.kind !== undefined ? { kind: c.kind } : {}),
      }));

      // Drop the composite; keep all other placed; append expanded inner comps
      next.placed = [...next.placed.filter((p) => p.id !== composite.id), ...expandedPlaced];
      next.connections = [...rewrittenConns, ...internalConns];
      next.selection = { kind: 'none' };
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
