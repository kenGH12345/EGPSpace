/**
 * macro-unpack-and-nesting tests (T-7, Phase 3) — verifies:
 *   1. unpackMacro reducer dissolves a composite back into atomic components
 *   2. Boundary connections are rewritten via exportPortMap
 *   3. Encapsulate → unpack is semantically reversible
 *   4. Nested encapsulation (macro containing another macro) — data layer
 *   5. SpecFlattener resolves nested macros recursively (end-to-end compute path)
 */

import {
  emptyEditorState,
  applyEditorAction,
  bundleFromState,
} from '../index';
import type { EditorState } from '../index';
import { SpecFlattener } from '@/lib/framework/macro/flattener';
import type { MacroDefinition } from '@/lib/framework';

function place<D extends import('@/lib/framework').ComponentDomain>(
  state: EditorState<D>,
  id: string,
  kind = 'resistor',
): EditorState<D> {
  return applyEditorAction(state, {
    type: 'placeComponent',
    kind,
    position: { x: 0, y: 0 },
    id,
  });
}

function connect<D extends import('@/lib/framework').ComponentDomain>(
  state: EditorState<D>,
  fromId: string,
  fromPort: string,
  toId: string,
  toPort: string,
): EditorState<D> {
  return applyEditorAction(state, {
    type: 'addConnection',
    from: { componentId: fromId, portName: fromPort },
    to: { componentId: toId, portName: toPort },
  });
}

describe('unpackMacro reducer', () => {
  it('no-ops on non-existent id', () => {
    const s = emptyEditorState('circuit');
    const result = applyEditorAction(s, { type: 'unpackMacro', id: 'ghost' });
    expect(result).toEqual(s);
  });

  it('no-ops when id refers to a non-macro atomic component', () => {
    let s = emptyEditorState('circuit');
    s = place(s, 'r1');
    const result = applyEditorAction(s, { type: 'unpackMacro', id: 'r1' });
    expect(result.placed).toHaveLength(1);
    expect(result.placed[0].id).toBe('r1');
  });

  it('expands a single-macro instance into its inner components', () => {
    // Build: r1 — r2, encapsulate both into macro:pair, then unpack
    let s = emptyEditorState('circuit');
    s = place(s, 'r1');
    s = place(s, 'r2');
    s = connect(s, 'r1', 'b', 'r2', 'a');
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['r1', 'r2'] });
    s = applyEditorAction(s, { type: 'encapsulateSelection', kind: 'macro:pair', metadata: { name: 'Pair' } });

    // After encapsulation: 1 composite placed, 0 connections (nothing external)
    expect(s.placed).toHaveLength(1);
    expect(s.placed[0].kind).toBe('macro:pair');
    const compositeId = s.placed[0].id;

    // Unpack
    s = applyEditorAction(s, { type: 'unpackMacro', id: compositeId });

    // Composite is gone, 2 inner comps restored (with prefixed ids), internal conn restored
    expect(s.placed).toHaveLength(2);
    const ids = s.placed.map((p) => p.id).sort();
    expect(ids).toEqual([`${compositeId}:r1`, `${compositeId}:r2`]);
    expect(s.connections).toHaveLength(1);
    expect(s.connections[0].from.componentId).toBe(`${compositeId}:r1`);
    expect(s.connections[0].from.portName).toBe('b');
    expect(s.connections[0].to.componentId).toBe(`${compositeId}:r2`);
    expect(s.connections[0].to.portName).toBe('a');
  });

  it('rewrites boundary connections via exportPortMap when composite has external wires', () => {
    // Build: ext — r1 — r2 (encapsulate r1+r2, leaving ext—composite wire)
    let s = emptyEditorState('circuit');
    s = place(s, 'ext');
    s = place(s, 'r1');
    s = place(s, 'r2');
    s = connect(s, 'ext', 'p', 'r1', 'a'); // boundary: ext.p ↔ r1.a
    s = connect(s, 'r1', 'b', 'r2', 'a'); // internal
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['r1', 'r2'] });
    s = applyEditorAction(s, { type: 'encapsulateSelection', kind: 'macro:pair' });

    // After encapsulation: [ext, composite], 1 external wire rewritten to composite
    expect(s.placed.map((p) => p.kind).sort()).toEqual(['macro:pair', 'resistor']);
    const compositeId = s.placed.find((p) => p.kind === 'macro:pair')!.id;
    expect(s.connections).toHaveLength(1);
    const extWire = s.connections[0];
    expect(
      (extWire.from.componentId === 'ext' && extWire.to.componentId === compositeId) ||
        (extWire.to.componentId === 'ext' && extWire.from.componentId === compositeId),
    ).toBe(true);

    // Unpack
    s = applyEditorAction(s, { type: 'unpackMacro', id: compositeId });

    // ext remains + 2 inner comps; boundary wire now points at the correct inner port
    expect(s.placed.map((p) => p.id).sort()).toEqual(['ext', `${compositeId}:r1`, `${compositeId}:r2`]);
    expect(s.connections).toHaveLength(2); // 1 ext↔inner + 1 internal
    const boundary = s.connections.find(
      (c) => c.from.componentId === 'ext' || c.to.componentId === 'ext',
    );
    expect(boundary).toBeDefined();
    const innerEnd =
      boundary!.from.componentId === 'ext' ? boundary!.to : boundary!.from;
    expect(innerEnd.componentId).toBe(`${compositeId}:r1`);
    expect(innerEnd.portName).toBe('a'); // default exportPortMap points to r1.a
  });

  it('prevents id collisions when idPrefix conflicts with existing ids', () => {
    // Pre-place a component whose id would collide with the default prefix
    let s = emptyEditorState('circuit');
    s = place(s, 'r1');
    s = place(s, 'r2');
    s = connect(s, 'r1', 'b', 'r2', 'a');
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['r1', 'r2'] });
    s = applyEditorAction(s, {
      type: 'encapsulateSelection',
      kind: 'macro:pair',
      compositeId: 'cp1',
    });

    // Manually inject a name-clash: 'cp1:r1' already exists
    s = place(s, 'cp1:r1', 'resistor');

    // Now unpack — must not collide
    s = applyEditorAction(s, { type: 'unpackMacro', id: 'cp1' });

    const ids = s.placed.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length); // all unique
    expect(ids).toContain('cp1:r1'); // original pre-existing
    expect(ids.some((id) => id.startsWith('cp1:r1-'))).toBe(true); // re-numbered inner
  });

  it('encapsulate → unpack preserves topology shape (semantic inverse)', () => {
    let s = emptyEditorState('circuit');
    s = place(s, 'r1');
    s = place(s, 'r2');
    s = connect(s, 'r1', 'b', 'r2', 'a');

    // Count before
    const topologyBefore = {
      placedCount: s.placed.length,
      connCount: s.connections.length,
    };

    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['r1', 'r2'] });
    s = applyEditorAction(s, { type: 'encapsulateSelection', kind: 'macro:pair' });
    const compositeId = s.placed[0].id;
    s = applyEditorAction(s, { type: 'unpackMacro', id: compositeId });

    // Counts match
    expect(s.placed).toHaveLength(topologyBefore.placedCount);
    expect(s.connections).toHaveLength(topologyBefore.connCount);

    // Macro definition remains in state.macros (unpack doesn't remove definition — user may still place new instances)
    expect(s.macros['macro:pair']).toBeDefined();
  });
});

describe('Nested encapsulation (macro within macro)', () => {
  it('allows encapsulating an existing macro instance together with atomic components', () => {
    // Build: r1 — r2, encapsulate into macro:inner; place macro:inner with r3; encapsulate both into macro:outer
    let s = emptyEditorState('circuit');
    s = place(s, 'r1');
    s = place(s, 'r2');
    s = connect(s, 'r1', 'b', 'r2', 'a');
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['r1', 'r2'] });
    s = applyEditorAction(s, {
      type: 'encapsulateSelection',
      kind: 'macro:inner',
      compositeId: 'inner1',
    });
    s = place(s, 'r3');
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['inner1', 'r3'] });
    s = applyEditorAction(s, {
      type: 'encapsulateSelection',
      kind: 'macro:outer',
      compositeId: 'outer1',
    });

    // Both macros registered
    expect(s.macros['macro:inner']).toBeDefined();
    expect(s.macros['macro:outer']).toBeDefined();

    // Outer contains the inner (nested)
    const outerSpec = s.macros['macro:outer'].spec;
    expect(outerSpec.components.some((c) => c.kind === 'macro:inner')).toBe(true);
    expect(outerSpec.components.some((c) => c.kind === 'resistor')).toBe(true);

    // Canvas has only the outer composite
    expect(s.placed).toHaveLength(1);
    expect(s.placed[0].kind).toBe('macro:outer');
  });

  it('SpecFlattener resolves nested macros recursively into atomic components', () => {
    // Build the same nested structure as above
    let s = emptyEditorState('circuit');
    s = place(s, 'r1');
    s = place(s, 'r2');
    s = connect(s, 'r1', 'b', 'r2', 'a');
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['r1', 'r2'] });
    s = applyEditorAction(s, {
      type: 'encapsulateSelection',
      kind: 'macro:inner',
      compositeId: 'inner1',
    });
    s = place(s, 'r3');
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['inner1', 'r3'] });
    s = applyEditorAction(s, {
      type: 'encapsulateSelection',
      kind: 'macro:outer',
      compositeId: 'outer1',
    });

    // Convert to bundle (top-level spec has 1 macro:outer component)
    const bundle = bundleFromState(s);
    expect(bundle.spec.components).toHaveLength(1);
    expect(bundle.spec.components[0].kind).toBe('macro:outer');

    // Flatten with a resolver backed by state.macros
    const resolver = {
      resolve: (kind: string): MacroDefinition | undefined => s.macros[kind],
    };
    const flattener = new SpecFlattener(resolver);
    const flat = flattener.flatten(bundle.spec);

    // After full flattening: 3 atomic resistors (2 from inner + 1 directly)
    expect(flat.components.every((c) => c.kind === 'resistor')).toBe(true);
    expect(flat.components.length).toBe(3);
  });

  it('nested macros survive save/load round-trip', () => {
    let s = emptyEditorState('circuit');
    s = place(s, 'r1');
    s = place(s, 'r2');
    s = connect(s, 'r1', 'b', 'r2', 'a');
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['r1', 'r2'] });
    s = applyEditorAction(s, {
      type: 'encapsulateSelection',
      kind: 'macro:inner',
      compositeId: 'inner1',
    });
    s = place(s, 'r3');
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['inner1', 'r3'] });
    s = applyEditorAction(s, { type: 'encapsulateSelection', kind: 'macro:outer' });

    const bundle = bundleFromState(s);
    const fresh = emptyEditorState('circuit');
    const reloaded = applyEditorAction(fresh, { type: 'loadBundle', bundle });

    // Both macro definitions restored
    expect(Object.keys(reloaded.macros).sort()).toEqual(['macro:inner', 'macro:outer']);

    // Flattening works against reloaded state
    const resolver = {
      resolve: (kind: string): MacroDefinition | undefined => reloaded.macros[kind],
    };
    const flat = new SpecFlattener(resolver).flatten(bundle.spec);
    expect(flat.components.length).toBe(3);
    expect(flat.components.every((c) => c.kind === 'resistor')).toBe(true);
  });
});
