/**
 * bundle-from-state — convert EditorState into AssemblyBundle.
 *
 * Design (B-3, B-4):
 *   - Produces { spec, layout } where spec has NO anchors (engine-clean)
 *     and layout carries all component anchors.
 *   - JSON fingerprint of this bundle must match what Builder DSL would produce
 *     for the same logical input (AC-B4).
 */

import type { ComponentDomain, AssemblyBundle, MacroExportPortMap } from '@/lib/framework';
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
  const macroKinds = Object.keys(state.macros);
  const hasMacros = macroKinds.length > 0;
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
    // T-6: persist user-defined macros so "我的元件" survives reload.
    // Omit the field entirely when no macros exist, so bundles from plain
    // experiments stay byte-identical to pre-T-6 output (AC-B4 hash stability).
    ...(hasMacros
      ? {
          macros: macroKinds.reduce<Record<string, (typeof state.macros)[string]>>((acc, k) => {
            const def = state.macros[k];
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
          }, {}),
        }
      : {}),
  };
}
