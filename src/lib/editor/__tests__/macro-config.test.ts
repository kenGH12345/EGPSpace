/**
 * macro-config tests (T-4) — purity + merge semantics for the macro→config
 * transformation pipeline.
 */

import {
  computeMacroPortOffsets,
  buildMacroPaletteEntries,
  buildMacroPortLayout,
  buildMacroDrawers,
  mergeConfigWithMacros,
  isMacroPaletteEntry,
  MACRO_DEFAULT_SIZE,
} from '../macro-config';
import type { MacroDefinition, MacroExportPortMap } from '@/lib/framework';
import type { EditorDomainConfig } from '../editor-config';

const port = (componentId: string, portName: string) => ({ componentId, portName });

const def = (exportPortMap: MacroExportPortMap, extra?: Partial<MacroDefinition['spec']>): MacroDefinition => ({
  spec: {
    domain: 'circuit',
    components: [],
    connections: [],
    ...extra,
  },
  exportPortMap,
});

describe('computeMacroPortOffsets', () => {
  it('returns empty object for empty portMap', () => {
    expect(computeMacroPortOffsets({})).toEqual({});
  });

  it('places a single port at horizontal center of bottom edge', () => {
    const offsets = computeMacroPortOffsets({ IN: port('r1', 'a') });
    expect(offsets.IN).toEqual({
      dx: MACRO_DEFAULT_SIZE.width / 2,
      dy: MACRO_DEFAULT_SIZE.height,
    });
  });

  it('spaces 3 ports evenly at 1/4, 2/4, 3/4 of the width', () => {
    const offsets = computeMacroPortOffsets({ a: port('x', 'a'), b: port('x', 'b'), c: port('x', 'c') });
    const w = MACRO_DEFAULT_SIZE.width;
    expect(offsets.a.dx).toBeCloseTo(w / 4);
    expect(offsets.b.dx).toBeCloseTo(w / 2);
    expect(offsets.c.dx).toBeCloseTo((3 * w) / 4);
    expect(offsets.a.dy).toBe(MACRO_DEFAULT_SIZE.height);
    expect(offsets.b.dy).toBe(MACRO_DEFAULT_SIZE.height);
    expect(offsets.c.dy).toBe(MACRO_DEFAULT_SIZE.height);
  });

  it('respects custom size argument', () => {
    const offsets = computeMacroPortOffsets({ p: port('x', 'p') }, { width: 200, height: 100 });
    expect(offsets.p).toEqual({ dx: 100, dy: 100 });
  });
});

describe('buildMacroPaletteEntries', () => {
  it('returns empty array when no macros registered', () => {
    expect(buildMacroPaletteEntries({})).toEqual([]);
  });

  it('uses metadata.name when provided', () => {
    const entries = buildMacroPaletteEntries({
      'macro:my-filter': def({ IN: port('x', 'a') }, { metadata: { name: 'Low-Pass Filter' } }),
    });
    expect(entries).toHaveLength(1);
    expect(entries[0].displayName).toBe('Low-Pass Filter');
    expect(entries[0].icon).toBe('📦');
  });

  it('falls back to kind suffix when metadata.name missing', () => {
    const entries = buildMacroPaletteEntries({ 'macro:rc-net': def({}) });
    expect(entries[0].displayName).toBe('rc-net');
  });

  it('uses metadata.description when provided', () => {
    const entries = buildMacroPaletteEntries({
      'macro:x': def({ IN: port('a', 'p') }, { metadata: { description: 'Custom voltage divider' } }),
    });
    expect(entries[0].description).toBe('Custom voltage divider');
  });

  it('falls back to describing inner component count when description missing', () => {
    const entries = buildMacroPaletteEntries({
      'macro:x': def(
        { A: port('r1', 'a') },
        {
          components: [
            { id: 'r1', kind: 'resistor', props: {} },
            { id: 'r2', kind: 'resistor', props: {} },
          ],
        },
      ),
    });
    expect(entries[0].description).toMatch(/2 个内部组件/);
  });

  it('preserves MACRO_DEFAULT_SIZE on hintSize', () => {
    const entries = buildMacroPaletteEntries({ 'macro:x': def({}) });
    expect(entries[0].hintSize).toEqual(MACRO_DEFAULT_SIZE);
  });
});

describe('buildMacroPortLayout', () => {
  it('builds a layout table keyed by macro kind', () => {
    const table = buildMacroPortLayout({
      'macro:a': def({ P1: port('r1', 'a') }),
      'macro:b': def({ Q1: port('x', 'p'), Q2: port('y', 'p') }),
    });
    expect(Object.keys(table).sort()).toEqual(['macro:a', 'macro:b']);
    expect(Object.keys(table['macro:a'])).toEqual(['P1']);
    expect(Object.keys(table['macro:b'])).toEqual(['Q1', 'Q2']);
  });

  it('returns empty table when no macros', () => {
    expect(buildMacroPortLayout({})).toEqual({});
  });
});

describe('buildMacroDrawers', () => {
  it('registers the same compositeDrawer for every macro kind', () => {
    const drawers = buildMacroDrawers({
      'macro:a': def({}),
      'macro:b': def({}),
    });
    expect(drawers['macro:a']).toBe(drawers['macro:b']);
    expect(typeof drawers['macro:a']).toBe('function');
  });
});

describe('mergeConfigWithMacros', () => {
  const baseConfig: EditorDomainConfig = {
    domain: 'circuit',
    displayName: 'Circuit',
    palette: [{ kind: 'resistor', displayName: 'Resistor', icon: 'R', defaultProps: {} }],
    portLayout: { resistor: { a: { dx: 0, dy: 0 }, b: { dx: 40, dy: 0 } } },
    drawers: { resistor: () => undefined },
    connection: { stroke: '#000', strokeWidth: 1 },
  };

  it('returns the SAME config reference when macros is empty (short-circuit)', () => {
    const out = mergeConfigWithMacros(baseConfig, {});
    expect(out).toBe(baseConfig);
  });

  it('merges palette entries while preserving atomic ones', () => {
    const out = mergeConfigWithMacros(baseConfig, {
      'macro:x': def({ IN: port('r1', 'a') }, { metadata: { name: 'Custom X' } }),
    });
    expect(out).not.toBe(baseConfig); // new object
    expect(out.palette).toHaveLength(2);
    expect(out.palette[0].kind).toBe('resistor');
    expect(out.palette[1].kind).toBe('macro:x');
    expect(out.palette[1].displayName).toBe('Custom X');
  });

  it('merges portLayout without clobbering atomic entries', () => {
    const out = mergeConfigWithMacros(baseConfig, { 'macro:x': def({ IN: port('r1', 'a') }) });
    expect(out.portLayout.resistor).toEqual(baseConfig.portLayout.resistor);
    expect(out.portLayout['macro:x'].IN).toBeDefined();
  });

  it('merges drawers without clobbering atomic entries', () => {
    const out = mergeConfigWithMacros(baseConfig, { 'macro:x': def({}) });
    expect(out.drawers.resistor).toBe(baseConfig.drawers.resistor);
    expect(typeof out.drawers['macro:x']).toBe('function');
  });

  it('does not mutate the input config', () => {
    const before = JSON.stringify({
      paletteLen: baseConfig.palette.length,
      portKinds: Object.keys(baseConfig.portLayout),
      drawerKinds: Object.keys(baseConfig.drawers),
    });
    mergeConfigWithMacros(baseConfig, { 'macro:x': def({ IN: port('a', 'p') }) });
    const after = JSON.stringify({
      paletteLen: baseConfig.palette.length,
      portKinds: Object.keys(baseConfig.portLayout),
      drawerKinds: Object.keys(baseConfig.drawers),
    });
    expect(after).toBe(before);
  });
});

describe('isMacroPaletteEntry', () => {
  it('identifies macro: prefix', () => {
    expect(isMacroPaletteEntry({ kind: 'macro:x' })).toBe(true);
    expect(isMacroPaletteEntry({ kind: 'resistor' })).toBe(false);
    expect(isMacroPaletteEntry({ kind: '' })).toBe(false);
    expect(isMacroPaletteEntry({ kind: 'macromolecule' })).toBe(false); // no colon
  });
});
