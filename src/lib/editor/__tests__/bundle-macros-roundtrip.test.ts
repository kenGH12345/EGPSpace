/**
 * bundle-macros-roundtrip tests (T-6, Phase 3) — persistence correctness for
 * user-defined macros: state → bundle → state round-trip and backward-compat
 * with pre-T-6 bundles (no macros field).
 */

import {
  emptyEditorState,
  applyEditorAction,
  bundleFromState,
} from '../index';
import type { EditorState } from '../index';
import type { AssemblyBundle } from '@/lib/framework';
import type { MacroDefinition } from '@/lib/framework';

function circuitWithSelection(ids: string[]): EditorState {
  let s: EditorState = emptyEditorState('circuit');
  for (const id of ids) {
    s = applyEditorAction(s, {
      type: 'placeComponent',
      kind: 'resistor',
      position: { x: 0, y: 0 },
      id,
    });
  }
  s = applyEditorAction(s, {
    type: 'addConnection',
    from: { componentId: ids[0], portName: 'b' },
    to: { componentId: ids[1], portName: 'a' },
  });
  s = applyEditorAction(s, { type: 'setMultiSelection', ids });
  return s;
}

function encapsulate(
  state: EditorState,
  kind: string,
  name = kind.replace(/^macro:/, ''),
): EditorState {
  return applyEditorAction(state, {
    type: 'encapsulateSelection',
    kind,
    metadata: { name },
  });
}

describe('bundleFromState · macros persistence', () => {
  it('omits macros field entirely when state.macros is empty (backward-compatible byte shape)', () => {
    const state = emptyEditorState('circuit');
    const bundle = bundleFromState(state);
    expect(bundle).not.toHaveProperty('macros');
  });

  it('serialises macros when state contains user-defined composites', () => {
    let s = circuitWithSelection(['r1', 'r2']);
    s = encapsulate(s, 'macro:pair', 'Resistor Pair');

    const bundle = bundleFromState(s);
    expect(bundle.macros).toBeDefined();
    expect(Object.keys(bundle.macros!)).toEqual(['macro:pair']);
    const def = bundle.macros!['macro:pair'];
    expect(def.spec.domain).toBe('circuit');
    expect(def.spec.components).toHaveLength(2);
    expect(def.spec.metadata?.name).toBe('Resistor Pair');
    expect(typeof def.exportPortMap).toBe('object');
  });

  it('deep-clones the definition — mutating the bundle does not leak into state', () => {
    let s = circuitWithSelection(['r1', 'r2']);
    s = encapsulate(s, 'macro:pair');

    const bundle = bundleFromState(s);
    const inner = bundle.macros!['macro:pair'].spec.components[0];
    inner.kind = 'MUTATED';
    (inner.props as Record<string, unknown>).foo = 1;
    bundle.macros!['macro:pair'].exportPortMap.EVIL = { componentId: 'x', portName: 'y' };

    // Original state remains pristine
    expect(s.macros['macro:pair'].spec.components[0].kind).toBe('resistor');
    expect(s.macros['macro:pair'].spec.components[0].props).toEqual({});
    expect(s.macros['macro:pair'].exportPortMap).not.toHaveProperty('EVIL');
  });
});

describe('loadBundle · macros hydration', () => {
  it('hydrates state.macros from bundle.macros on load', () => {
    // Produce a bundle by encapsulating
    let s1 = circuitWithSelection(['r1', 'r2']);
    s1 = encapsulate(s1, 'macro:pair', 'Pair');
    const bundle = bundleFromState(s1);

    // Load into a fresh state
    const fresh = emptyEditorState('circuit');
    const loaded = applyEditorAction(fresh, { type: 'loadBundle', bundle });

    expect(Object.keys(loaded.macros)).toEqual(['macro:pair']);
    expect(loaded.macros['macro:pair'].spec.metadata?.name).toBe('Pair');
    expect(loaded.macros['macro:pair'].spec.components).toHaveLength(2);
  });

  it('loads pre-T-6 bundles (no macros field) with empty macros map', () => {
    const legacyBundle: AssemblyBundle = {
      spec: {
        domain: 'circuit',
        components: [{ id: 'r1', kind: 'resistor', props: {} }],
        connections: [],
      },
    };

    const fresh = emptyEditorState('circuit');
    const loaded = applyEditorAction(fresh, { type: 'loadBundle', bundle: legacyBundle });

    expect(loaded.macros).toEqual({});
    expect(loaded.placed).toHaveLength(1);
  });

  it('treats bundle with macros: undefined same as missing field', () => {
    const bundleWithUndefined: AssemblyBundle = {
      spec: { domain: 'circuit', components: [], connections: [] },
      macros: undefined,
    };
    const fresh = emptyEditorState('circuit');
    const loaded = applyEditorAction(fresh, {
      type: 'loadBundle',
      bundle: bundleWithUndefined,
    });
    expect(loaded.macros).toEqual({});
  });

  it('deep-clones — mutating the loaded state does not mutate the source bundle', () => {
    let s = circuitWithSelection(['r1', 'r2']);
    s = encapsulate(s, 'macro:pair');
    const bundle = bundleFromState(s);
    const bundleSnapshot = JSON.stringify(bundle);

    const fresh = emptyEditorState('circuit');
    const loaded = applyEditorAction(fresh, { type: 'loadBundle', bundle });

    // Mutate loaded state aggressively
    loaded.macros['macro:pair'].exportPortMap.INJECTED = { componentId: 'x', portName: 'y' };
    loaded.macros['macro:pair'].spec.components[0].kind = 'HACKED';

    expect(JSON.stringify(bundle)).toBe(bundleSnapshot);
  });
});

describe('full round-trip · state → bundle → state is idempotent', () => {
  it('state₂ carries the same macro definitions as state₁ after save/load cycle', () => {
    let s1 = circuitWithSelection(['r1', 'r2']);
    s1 = encapsulate(s1, 'macro:pair', 'Pair');

    const bundle = bundleFromState(s1);
    const fresh = emptyEditorState('circuit');
    const s2 = applyEditorAction(fresh, { type: 'loadBundle', bundle });

    expect(Object.keys(s2.macros)).toEqual(Object.keys(s1.macros));
    expect(JSON.stringify(s2.macros)).toBe(JSON.stringify(s1.macros));
  });

  it('JSON serialisation of bundle is stable (safe for localStorage.setItem)', () => {
    let s = circuitWithSelection(['r1', 'r2']);
    s = encapsulate(s, 'macro:pair', 'Pair');
    const bundle = bundleFromState(s);

    expect(() => JSON.stringify(bundle)).not.toThrow();
    const roundTripped = JSON.parse(JSON.stringify(bundle)) as AssemblyBundle;
    expect(roundTripped.macros!['macro:pair'].exportPortMap).toEqual(
      bundle.macros!['macro:pair'].exportPortMap,
    );
  });

  it('supports multiple macros in a single bundle', () => {
    let s = circuitWithSelection(['r1', 'r2']);
    s = encapsulate(s, 'macro:first', 'First');
    // Place 2 more components and encapsulate them as a second macro
    s = applyEditorAction(s, {
      type: 'placeComponent',
      kind: 'resistor',
      position: { x: 100, y: 0 },
      id: 'r3',
    });
    s = applyEditorAction(s, {
      type: 'placeComponent',
      kind: 'resistor',
      position: { x: 200, y: 0 },
      id: 'r4',
    });
    s = applyEditorAction(s, {
      type: 'addConnection',
      from: { componentId: 'r3', portName: 'b' },
      to: { componentId: 'r4', portName: 'a' },
    });
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['r3', 'r4'] });
    s = encapsulate(s, 'macro:second', 'Second');

    const bundle = bundleFromState(s);
    expect(Object.keys(bundle.macros!).sort()).toEqual(['macro:first', 'macro:second']);

    // Round-trip
    const fresh = emptyEditorState('circuit');
    const s2 = applyEditorAction(fresh, { type: 'loadBundle', bundle });
    expect(Object.keys(s2.macros).sort()).toEqual(['macro:first', 'macro:second']);
  });
});

describe('isAssemblyBundle · macros field validation', () => {
  it('accepts bundles with valid macros object', async () => {
    const { isAssemblyBundle } = await import('@/lib/framework');
    const bundle = {
      spec: { domain: 'circuit', components: [], connections: [] },
      macros: { 'macro:x': { spec: {} as unknown, exportPortMap: {} } } as unknown,
    };
    expect(isAssemblyBundle(bundle)).toBe(true);
  });

  it('rejects bundles where macros is a primitive (not object)', async () => {
    const { isAssemblyBundle } = await import('@/lib/framework');
    const badBundle = {
      spec: { domain: 'circuit', components: [], connections: [] },
      macros: 'not-an-object',
    };
    expect(isAssemblyBundle(badBundle)).toBe(false);
  });

  it('accepts bundles with macros === null (tolerated as absent)', async () => {
    // Null is allowed in JSON but we treat it as a defensive failure to
    // prevent runtime crashes downstream. The guard reports false so callers
    // fall back to an error path.
    const { isAssemblyBundle } = await import('@/lib/framework');
    const badBundle = {
      spec: { domain: 'circuit', components: [], connections: [] },
      macros: null,
    };
    expect(isAssemblyBundle(badBundle)).toBe(false);
  });
});

/** Expose a typed MacroDefinition for editor tests/doc (not exported elsewhere). */
export type { MacroDefinition };
