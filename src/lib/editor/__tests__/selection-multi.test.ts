/**
 * selection-multi tests (T-2) — EditorSelection multi-branch and toggle semantics.
 *
 * Covers the full state-machine transitions of toggleComponentSelection:
 *   none   --toggle(a)--> component(a)
 *   comp(a) --toggle(a)--> none
 *   comp(a) --toggle(b)--> multi[a, b]
 *   multi[a,b,c] --toggle(b)--> multi[a, c]
 *   multi[a, b] --toggle(b)--> component(a)
 *   multi[a, b] --toggle(c)--> multi[a, b, c]
 *   connection --toggle(a)--> component(a)
 */

import { emptyEditorState, applyEditorAction } from '../index';
import type { EditorState } from '../index';

// Helper: build state with placed components (bypass dispatch for setup brevity)
function stateWith(ids: string[]): EditorState {
  let s: EditorState = emptyEditorState('circuit');
  for (const id of ids) {
    s = applyEditorAction(s, {
      type: 'placeComponent',
      kind: 'resistor',
      position: { x: 0, y: 0 },
      id,
    });
  }
  return s;
}

describe('toggleComponentSelection', () => {
  it('none + toggle(a) → component(a)', () => {
    let s = stateWith(['a']);
    s = applyEditorAction(s, { type: 'selectComponent', id: null }); // force none
    s = applyEditorAction(s, { type: 'toggleComponentSelection', id: 'a' });
    expect(s.selection).toEqual({ kind: 'component', id: 'a' });
  });

  it('component(a) + toggle(a) → none (deselect self)', () => {
    let s = stateWith(['a']);
    expect(s.selection).toEqual({ kind: 'component', id: 'a' });
    s = applyEditorAction(s, { type: 'toggleComponentSelection', id: 'a' });
    expect(s.selection).toEqual({ kind: 'none' });
  });

  it('component(a) + toggle(b) → multi[a, b]', () => {
    let s = stateWith(['a', 'b']);
    s = applyEditorAction(s, { type: 'selectComponent', id: 'a' });
    s = applyEditorAction(s, { type: 'toggleComponentSelection', id: 'b' });
    expect(s.selection).toEqual({ kind: 'multi', ids: ['a', 'b'] });
  });

  it('multi[a, b, c] + toggle(b) → multi[a, c]', () => {
    let s = stateWith(['a', 'b', 'c']);
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['a', 'b', 'c'] });
    s = applyEditorAction(s, { type: 'toggleComponentSelection', id: 'b' });
    expect(s.selection).toEqual({ kind: 'multi', ids: ['a', 'c'] });
  });

  it('multi[a, b] + toggle(b) → component(a) (collapse to single)', () => {
    let s = stateWith(['a', 'b']);
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['a', 'b'] });
    s = applyEditorAction(s, { type: 'toggleComponentSelection', id: 'b' });
    expect(s.selection).toEqual({ kind: 'component', id: 'a' });
  });

  it('multi[a, b] + toggle(c) → multi[a, b, c] (append)', () => {
    let s = stateWith(['a', 'b', 'c']);
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['a', 'b'] });
    s = applyEditorAction(s, { type: 'toggleComponentSelection', id: 'c' });
    expect(s.selection).toEqual({ kind: 'multi', ids: ['a', 'b', 'c'] });
  });

  it('connection selection + toggle(a) → component(a) (replaces)', () => {
    let s = stateWith(['a']);
    s = applyEditorAction(s, { type: 'selectConnection', index: 0 });
    expect(s.selection.kind).toBe('connection');
    s = applyEditorAction(s, { type: 'toggleComponentSelection', id: 'a' });
    expect(s.selection).toEqual({ kind: 'component', id: 'a' });
  });

  it('ignores toggle for non-existent component id', () => {
    let s = stateWith(['a']);
    s = applyEditorAction(s, { type: 'selectComponent', id: 'a' });
    s = applyEditorAction(s, { type: 'toggleComponentSelection', id: 'ghost' });
    expect(s.selection).toEqual({ kind: 'component', id: 'a' });
  });
});

describe('setMultiSelection', () => {
  it('collapses to none when ids list is empty', () => {
    let s = stateWith(['a', 'b']);
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: [] });
    expect(s.selection).toEqual({ kind: 'none' });
  });

  it('collapses to component when only one id', () => {
    let s = stateWith(['a', 'b']);
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['a'] });
    expect(s.selection).toEqual({ kind: 'component', id: 'a' });
  });

  it('sets multi when two or more ids', () => {
    let s = stateWith(['a', 'b', 'c']);
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['a', 'c'] });
    expect(s.selection).toEqual({ kind: 'multi', ids: ['a', 'c'] });
  });

  it('filters out non-existent ids', () => {
    let s = stateWith(['a', 'b']);
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['a', 'b', 'ghost'] });
    expect(s.selection).toEqual({ kind: 'multi', ids: ['a', 'b'] });
  });

  it('deduplicates ids', () => {
    let s = stateWith(['a', 'b']);
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['a', 'b', 'a'] });
    expect(s.selection).toEqual({ kind: 'multi', ids: ['a', 'b'] });
  });
});

describe('deleteSelection with multi', () => {
  it('removes all selected components and their connections', () => {
    let s = stateWith(['a', 'b', 'c']);
    s = applyEditorAction(s, {
      type: 'addConnection',
      from: { componentId: 'a', portName: 'p1' },
      to: { componentId: 'b', portName: 'p2' },
    });
    s = applyEditorAction(s, {
      type: 'addConnection',
      from: { componentId: 'c', portName: 'p3' },
      to: { componentId: 'a', portName: 'p4' },
    });
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['a', 'b'] });
    s = applyEditorAction(s, { type: 'deleteSelection' });

    expect(s.placed.map((p) => p.id)).toEqual(['c']);
    // Both connections touched 'a' → both removed
    expect(s.connections).toHaveLength(0);
    expect(s.selection).toEqual({ kind: 'none' });
  });
});
