/**
 * EditorState — single source of truth for the editor UI.
 *
 * Design (B-1):
 *   - Includes UI-only state (selection, draftWire, camera) that does NOT
 *     belong in an AssemblyBundle.
 *   - `placed[i].anchor` is kept locally for reducer simplicity; bundleFromState()
 *     strips anchors out to a LayoutSpec when exporting.
 *   - Pure data POJO — no methods. Feed into reducer.
 */

import type { ComponentDomain, ComponentAnchor, MacroExportPortMap } from '@/lib/framework';
import type { ConnectionDecl } from '@/lib/framework';
import type { MacroDefinition } from '@/lib/framework/macro/flattener';

/** A component placed on the editor canvas. */
export interface PlacedComponent {
  id: string;
  kind: string;
  props: Record<string, unknown>;
  anchor: ComponentAnchor;
}

/** UI-only selection state. */
export type EditorSelection =
  | { kind: 'none' }
  | { kind: 'component'; id: string }
  | { kind: 'connection'; index: number }
  | { kind: 'multi'; ids: string[] };

/** UI-only draft wire (in-progress connection). */
export interface DraftWire {
  from: { componentId: string; port: string };
  cursor: { x: number; y: number };
}

/** UI-only camera state for pan/zoom. */
export interface EditorCamera {
  offset: { x: number; y: number };
  zoom: number;
}

/** Top-level editor state. */
export interface EditorState<D extends ComponentDomain = ComponentDomain> {
  domain: D;
  placed: PlacedComponent[];
  connections: ConnectionDecl[];
  selection: EditorSelection;
  draftWire: DraftWire | null;
  camera: EditorCamera;
  /** Component id currently hovered (null when none). D 阶段新增。 */
  hoveredId: string | null;
  /**
   * User-defined composite components ("macros").
   * Key = macro kind (e.g. "macro:rc-low-pass"), value = full definition (inner spec + exportPortMap).
   * Populated by encapsulateSelection / registerMacro; consumed by SpecFlattener at run time.
   */
  macros: Record<string, MacroDefinition>;
}

/** Create an empty editor state for a given domain. */
export function emptyEditorState<D extends ComponentDomain>(domain: D): EditorState<D> {
  return {
    domain,
    placed: [],
    connections: [],
    selection: { kind: 'none' },
    draftWire: null,
    camera: { offset: { x: 0, y: 0 }, zoom: 1 },
    hoveredId: null,
    macros: {},
  };
}

/** Deep-clone helper for reducer (avoids mutating input state). */
export function cloneEditorState<D extends ComponentDomain>(s: EditorState<D>): EditorState<D> {
  return {
    domain: s.domain,
    placed: s.placed.map((p) => ({ ...p, anchor: { ...p.anchor }, props: { ...p.props } })),
    connections: s.connections.map((c) => ({
      from: { ...c.from },
      to: { ...c.to },
      kind: c.kind,
    })),
    selection: { ...s.selection } as EditorSelection,
    draftWire: s.draftWire
      ? {
          from: { ...s.draftWire.from },
          cursor: { ...s.draftWire.cursor },
        }
      : null,
    camera: { offset: { ...s.camera.offset }, zoom: s.camera.zoom },
    hoveredId: s.hoveredId,
    macros: cloneMacros(s.macros),
  };
}

/**
 * Deep-clone the macros map. Each MacroDefinition contains an AssemblySpec whose
 * components / connections / exportPortMap must be cloned independently so that
 * later mutations of the snapshot don't leak into the reducer's working copy.
 */
function cloneMacros(src: Record<string, MacroDefinition>): Record<string, MacroDefinition> {
  const out: Record<string, MacroDefinition> = {};
  for (const key of Object.keys(src)) {
    const def = src[key];
    out[key] = {
      spec: {
        domain: def.spec.domain,
        components: def.spec.components.map((c) => ({
          ...c,
          props: { ...c.props },
          anchor: c.anchor ? { ...c.anchor } : undefined,
        })),
        connections: def.spec.connections.map((cn) => ({
          from: { ...cn.from },
          to: { ...cn.to },
          kind: cn.kind,
        })),
        metadata: def.spec.metadata ? { ...def.spec.metadata } : undefined,
      },
      exportPortMap: Object.keys(def.exportPortMap).reduce<MacroExportPortMap>((map, portName) => {
        const ref = def.exportPortMap[portName];
        map[portName] = { componentId: ref.componentId, portName: ref.portName };
        return map;
      }, {}),
    };
  }
  return out;
}
