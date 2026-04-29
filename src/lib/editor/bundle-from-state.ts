/**
 * bundle-from-state — convert EditorState into AssemblyBundle.
 *
 * Design (B-3, B-4):
 *   - Produces { spec, layout } where spec has NO anchors (engine-clean)
 *     and layout carries all component anchors.
 *   - JSON fingerprint of this bundle must match what Builder DSL would produce
 *     for the same logical input (AC-B4).
 */

import type { ComponentDomain, AssemblyBundle } from '@/lib/framework';
import type { EditorState } from './editor-state';

/**
 * Convert editor state to an AssemblyBundle.
 *
 * Rules:
 *   - spec.components[i] contains {id, kind, props} ONLY (no anchor — AC-D5/B4)
 *   - spec.connections is copied as-is (ConnectionDecl already matches)
 *   - layout.entries[i] = { componentId, anchor } for every placed component
 */
export function bundleFromState<D extends ComponentDomain>(
  state: EditorState<D>,
): AssemblyBundle<D> {
  return {
    spec: {
      domain: state.domain,
      components: state.placed.map((p) => ({
        id: p.id,
        kind: p.kind,
        props: { ...p.props },
      })),
      connections: state.connections.map((c) => ({
        from: { componentId: c.from.componentId, portName: c.from.portName },
        to: { componentId: c.to.componentId, portName: c.to.portName },
        ...(c.kind !== undefined ? { kind: c.kind } : {}),
      })),
    },
    layout: {
      domain: state.domain,
      entries: state.placed.map((p) => ({
        componentId: p.id,
        anchor: { ...p.anchor },
      })),
    },
  };
}
