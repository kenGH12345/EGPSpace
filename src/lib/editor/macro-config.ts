/**
 * macro-config — pure helpers that fold user-defined macros into an
 * EditorDomainConfig at render time.
 *
 * Design (T-4):
 *   EditorDomainConfig is immutable per-domain (palette/portLayout/drawers are
 *   statically registered). When the user encapsulates a subgraph, a new
 *   MacroDefinition gets registered in state.macros. This module transforms
 *   that map into (a) palette entries, (b) port-layout offsets, (c) drawer
 *   registrations — then merges them on top of the static config.
 *
 *   Downstream consumers (EditorCanvas, ComponentPalette, PropertyPanel,
 *   getPortCanvasPos, findPortAtScreen, bundleFromState) remain completely
 *   macro-unaware; they receive a merged config and continue to look things
 *   up by kind.
 *
 *   Zero React. Zero state mutation.
 */

import type { EditorDomainConfig, PaletteEntry, CanvasDrawer } from './editor-config';
import type { PortLayoutTable, PortOffset } from './port-layout';
import type { MacroDefinition, MacroExportPortMap } from '@/lib/framework';
import { compositeDrawer } from './drawers/composite-drawer';

/** Default AABB for a composite. Wide enough to fit up to ~6 bottom ports comfortably. */
export const MACRO_DEFAULT_SIZE = { width: 96, height: 64 } as const;

/**
 * Given a macro's exportPortMap, compute the port offsets relative to the
 * composite's anchor (top-left corner of its AABB).
 *
 * Layout: ports are evenly spaced along the bottom edge, left-to-right in
 * insertion order of exportPortMap keys. This matches the visual convention
 * used by compositeDrawer so the connection lines meet the drawn port dots.
 */
export function computeMacroPortOffsets(
  exportPortMap: Readonly<MacroExportPortMap>,
  size: { width: number; height: number } = MACRO_DEFAULT_SIZE,
): Record<string, PortOffset> {
  const names = Object.keys(exportPortMap);
  const count = names.length;
  const offsets: Record<string, PortOffset> = {};
  if (count === 0) return offsets;
  for (let i = 0; i < count; i++) {
    const dx = (size.width / (count + 1)) * (i + 1);
    offsets[names[i]] = { dx, dy: size.height };
  }
  return offsets;
}

/** Build PaletteEntry[] for every macro in the map. */
export function buildMacroPaletteEntries(
  macros: Readonly<Record<string, MacroDefinition>>,
): PaletteEntry[] {
  return Object.keys(macros).map((kind) => {
    const def = macros[kind];
    const displayName = def.spec.metadata?.name ?? kind.replace(/^macro:/, '');
    return {
      kind,
      displayName,
      icon: '📦',
      description:
        def.spec.metadata?.description ??
        `用户自定义元件 · ${def.spec.components.length} 个内部组件`,
      defaultProps: {},
      hintSize: { ...MACRO_DEFAULT_SIZE },
    };
  });
}

/** Build a PortLayoutTable fragment for every macro in the map. */
export function buildMacroPortLayout(
  macros: Readonly<Record<string, MacroDefinition>>,
): PortLayoutTable {
  const table: PortLayoutTable = {};
  for (const kind of Object.keys(macros)) {
    table[kind] = computeMacroPortOffsets(macros[kind].exportPortMap);
  }
  return table;
}

/** Build a drawer registration for every macro — all share the same compositeDrawer. */
export function buildMacroDrawers(
  macros: Readonly<Record<string, MacroDefinition>>,
): Record<string, CanvasDrawer> {
  const drawers: Record<string, CanvasDrawer> = {};
  for (const kind of Object.keys(macros)) {
    drawers[kind] = compositeDrawer;
  }
  return drawers;
}

/**
 * Fold macros into a domain config. Returns a NEW config object (safe for
 * useMemo dependency tracking); the original is not mutated.
 *
 * Short-circuit: when macros is empty, returns the input config UNCHANGED
 * (same reference) — zero allocation, zero re-render impact for users who
 * never create a macro.
 */
export function mergeConfigWithMacros<D extends EditorDomainConfig>(
  config: D,
  macros: Readonly<Record<string, MacroDefinition>>,
): D {
  const macroKinds = Object.keys(macros);
  if (macroKinds.length === 0) return config;

  return {
    ...config,
    palette: [...config.palette, ...buildMacroPaletteEntries(macros)],
    portLayout: { ...config.portLayout, ...buildMacroPortLayout(macros) },
    drawers: { ...config.drawers, ...buildMacroDrawers(macros) },
  };
}

/** True when the palette entry represents a user-defined macro. */
export function isMacroPaletteEntry(entry: Pick<PaletteEntry, 'kind'>): boolean {
  return entry.kind.startsWith('macro:');
}
