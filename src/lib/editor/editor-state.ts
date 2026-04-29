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

import type { ComponentDomain, ComponentAnchor } from '@/lib/framework';
import type { ConnectionDecl } from '@/lib/framework';

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
  | { kind: 'connection'; index: number };

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
  };
}
