/**
 * macro-actions tests (T-2 + T-5 reducer path) — registerMacro / removeMacro /
 * encapsulateSelection reducer semantics.
 *
 * encapsulateSelection is implemented in T-2 (eliminates exhaustive-never error)
 * and exercised end-to-end here; T-5's job is only to wire the UI Dialog to
 * this action.
 */

import { emptyEditorState, applyEditorAction } from '../index';
import type { EditorState, MacroDefinition } from '../index';

const sampleDef: MacroDefinition = {
  spec: {
    domain: 'circuit',
    components: [
      { id: 'r1', kind: 'resistor', props: {} },
      { id: 'r2', kind: 'resistor', props: {} },
    ],
    connections: [
      {
        from: { componentId: 'r1', portName: 'b' },
        to: { componentId: 'r2', portName: 'a' },
      },
    ],
  },
  exportPortMap: {
    A: { componentId: 'r1', portName: 'a' },
    B: { componentId: 'r2', portName: 'b' },
  },
};

function baseState(): EditorState {
  return emptyEditorState('circuit');
}

describe('registerMacro / removeMacro', () => {
  it('registerMacro adds a definition to state.macros', () => {
    let s = baseState();
    s = applyEditorAction(s, {
      type: 'registerMacro',
      key: 'macro:my-divider',
      definition: sampleDef,
    });
    expect(Object.keys(s.macros)).toEqual(['macro:my-divider']);
    expect(s.macros['macro:my-divider'].exportPortMap.A).toEqual({
      componentId: 'r1',
      portName: 'a',
    });
  });

  it('registerMacro overwrites existing key (用户确认覆盖 by the UI, reducer trusts caller)', () => {
    let s = baseState();
    s = applyEditorAction(s, {
      type: 'registerMacro',
      key: 'macro:x',
      definition: sampleDef,
    });
    const replaced: MacroDefinition = {
      spec: { domain: 'circuit', components: [], connections: [] },
      exportPortMap: {},
    };
    s = applyEditorAction(s, { type: 'registerMacro', key: 'macro:x', definition: replaced });
    expect(s.macros['macro:x'].spec.components).toHaveLength(0);
  });

  it('removeMacro deletes key when no placed instances', () => {
    let s = baseState();
    s = applyEditorAction(s, {
      type: 'registerMacro',
      key: 'macro:y',
      definition: sampleDef,
    });
    s = applyEditorAction(s, { type: 'removeMacro', key: 'macro:y' });
    expect(s.macros['macro:y']).toBeUndefined();
  });

  it('removeMacro protects against deletion when instance is placed', () => {
    let s = baseState();
    s = applyEditorAction(s, {
      type: 'registerMacro',
      key: 'macro:z',
      definition: sampleDef,
    });
    s = applyEditorAction(s, {
      type: 'placeComponent',
      kind: 'macro:z',
      position: { x: 0, y: 0 },
    });
    s = applyEditorAction(s, { type: 'removeMacro', key: 'macro:z' });
    expect(s.macros['macro:z']).toBeDefined(); // still there
  });
});

describe('encapsulateSelection', () => {
  function threeResistorSeries(): EditorState {
    let s = baseState();
    s = applyEditorAction(s, {
      type: 'placeComponent',
      kind: 'resistor',
      position: { x: 0, y: 0 },
      id: 'r1',
    });
    s = applyEditorAction(s, {
      type: 'placeComponent',
      kind: 'resistor',
      position: { x: 100, y: 0 },
      id: 'r2',
    });
    s = applyEditorAction(s, {
      type: 'placeComponent',
      kind: 'resistor',
      position: { x: 200, y: 0 },
      id: 'r3',
    });
    s = applyEditorAction(s, {
      type: 'placeComponent',
      kind: 'battery',
      position: { x: -100, y: 0 },
      id: 'bat',
    });
    s = applyEditorAction(s, {
      type: 'placeComponent',
      kind: 'ground',
      position: { x: 300, y: 0 },
      id: 'gnd',
    });
    // bat -- r1 -- r2 -- r3 -- gnd
    s = applyEditorAction(s, {
      type: 'addConnection',
      from: { componentId: 'bat', portName: 'p' },
      to: { componentId: 'r1', portName: 'a' },
    });
    s = applyEditorAction(s, {
      type: 'addConnection',
      from: { componentId: 'r1', portName: 'b' },
      to: { componentId: 'r2', portName: 'a' },
    });
    s = applyEditorAction(s, {
      type: 'addConnection',
      from: { componentId: 'r2', portName: 'b' },
      to: { componentId: 'r3', portName: 'a' },
    });
    s = applyEditorAction(s, {
      type: 'addConnection',
      from: { componentId: 'r3', portName: 'b' },
      to: { componentId: 'gnd', portName: 'g' },
    });
    return s;
  }

  it('encapsulates 3 selected resistors into a composite', () => {
    let s = threeResistorSeries();
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['r1', 'r2', 'r3'] });
    s = applyEditorAction(s, {
      type: 'encapsulateSelection',
      kind: 'macro:series-3r',
      compositeId: 'composite1',
    });

    // placed: bat + gnd + composite (r1/r2/r3 removed)
    expect(s.placed.map((p) => p.id).sort()).toEqual(['bat', 'composite1', 'gnd']);

    // macro registered
    expect(s.macros['macro:series-3r']).toBeDefined();
    const def = s.macros['macro:series-3r'];
    expect(def.spec.components.map((c) => c.id).sort()).toEqual(['r1', 'r2', 'r3']);
    // 2 internal connections (r1-r2, r2-r3)
    expect(def.spec.connections).toHaveLength(2);
    // exportPortMap auto-derived from 2 boundary conns: r1.a and r3.b
    expect(Object.keys(def.exportPortMap).sort()).toEqual(['r1_a', 'r3_b']);
    expect(def.exportPortMap.r1_a).toEqual({ componentId: 'r1', portName: 'a' });
    expect(def.exportPortMap.r3_b).toEqual({ componentId: 'r3', portName: 'b' });

    // 2 remaining connections (bat→composite, composite→gnd), both via exported ports
    expect(s.connections).toHaveLength(2);
    const batConn = s.connections.find((c) => c.from.componentId === 'bat');
    expect(batConn?.to).toEqual({ componentId: 'composite1', portName: 'r1_a' });
    const gndConn = s.connections.find((c) => c.to.componentId === 'gnd');
    expect(gndConn?.from).toEqual({ componentId: 'composite1', portName: 'r3_b' });

    // Selection moved to new composite
    expect(s.selection).toEqual({ kind: 'component', id: 'composite1' });
  });

  it('handles T-branch (single inside node, 3 boundary conns fan-out)', () => {
    let s = baseState();
    ['r1', 'x', 'y', 'z'].forEach((id) =>
      (s = applyEditorAction(s, {
        type: 'placeComponent',
        kind: 'resistor',
        position: { x: 0, y: 0 },
        id,
      })),
    );
    // r1.a ↔ x, r1.b ↔ y, r1.c ↔ z  (T-branch with 3 outside conns on different ports)
    s = applyEditorAction(s, {
      type: 'addConnection',
      from: { componentId: 'r1', portName: 'a' },
      to: { componentId: 'x', portName: 'p' },
    });
    s = applyEditorAction(s, {
      type: 'addConnection',
      from: { componentId: 'r1', portName: 'b' },
      to: { componentId: 'y', portName: 'p' },
    });
    s = applyEditorAction(s, {
      type: 'addConnection',
      from: { componentId: 'r1', portName: 'c' },
      to: { componentId: 'z', portName: 'p' },
    });

    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['r1'] });
    // setMultiSelection with 1 id collapses to 'component' — use a 2-id selection instead
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['r1', 'x'] });
    s = applyEditorAction(s, {
      type: 'encapsulateSelection',
      kind: 'macro:t-branch',
      compositeId: 'cmp',
    });
    // exportPortMap should have entries for r1.b and r1.c (x absorbed inside)
    const def = s.macros['macro:t-branch'];
    expect(Object.keys(def.exportPortMap).sort()).toEqual(['r1_b', 'r1_c']);
    expect(def.exportPortMap.r1_b).toEqual({ componentId: 'r1', portName: 'b' });
    expect(def.exportPortMap.r1_c).toEqual({ componentId: 'r1', portName: 'c' });
  });

  it('no-ops when selection is not multi or has < 2 ids', () => {
    let s = threeResistorSeries();
    s = applyEditorAction(s, { type: 'selectComponent', id: 'r1' });
    const before = s;
    s = applyEditorAction(s, { type: 'encapsulateSelection', kind: 'macro:noop' });
    expect(s.placed.length).toBe(before.placed.length);
    expect(s.macros['macro:noop']).toBeUndefined();
  });

  it('zero boundary connections → exportPortMap is empty (fully isolated subgraph)', () => {
    let s = baseState();
    s = applyEditorAction(s, {
      type: 'placeComponent',
      kind: 'resistor',
      position: { x: 0, y: 0 },
      id: 'i1',
    });
    s = applyEditorAction(s, {
      type: 'placeComponent',
      kind: 'resistor',
      position: { x: 0, y: 0 },
      id: 'i2',
    });
    s = applyEditorAction(s, {
      type: 'addConnection',
      from: { componentId: 'i1', portName: 'a' },
      to: { componentId: 'i2', portName: 'b' },
    });
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['i1', 'i2'] });
    s = applyEditorAction(s, {
      type: 'encapsulateSelection',
      kind: 'macro:isolated',
      compositeId: 'iso',
    });
    const def = s.macros['macro:isolated'];
    expect(def.exportPortMap).toEqual({});
    expect(def.spec.connections).toHaveLength(1);
    expect(s.connections).toHaveLength(0);
  });
});
