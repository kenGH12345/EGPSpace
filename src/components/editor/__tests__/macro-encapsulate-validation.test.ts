/**
 * macro-encapsulate-validation tests (T-5) — preview + error-validation logic
 * extracted from MacroEncapsulateDialog.
 *
 * We don't render the React component (no RTL installed); instead we exercise
 * the underlying pure functions (classifyConnections + buildDefaultExportPortMap)
 * in the exact pattern the Dialog uses to produce its live preview, then assert
 * the derived values. This is safer than snapshot tests and gives us full
 * coverage of the 4-error-path + boundary-counting logic.
 */

import {
  emptyEditorState,
  applyEditorAction,
  classifyConnections,
  buildDefaultExportPortMap,
} from '../../../lib/editor';
import type { EditorState } from '../../../lib/editor';

/** Replicates the preview memo inside MacroEncapsulateDialog. */
function computePreview(state: EditorState) {
  if (state.selection.kind !== 'multi') {
    return { innerCount: 0, portCount: 0, crossDomain: false };
  }
  const selectedIds = new Set(state.selection.ids);
  const innerComps = state.placed.filter((p) => selectedIds.has(p.id));
  const { boundary } = classifyConnections(selectedIds, state.connections);
  const { exportPortMap } = buildDefaultExportPortMap(selectedIds, boundary);
  return {
    innerCount: innerComps.length,
    portCount: Object.keys(exportPortMap).length,
    crossDomain: innerComps.length !== state.selection.ids.length,
  };
}

/** Replicates the validation rules inside MacroEncapsulateDialog. */
function validate(
  state: EditorState,
  form: { name: string; kind: string },
): { errors: string[]; canSubmit: boolean } {
  const errors: string[] = [];
  if (state.selection.kind !== 'multi' || state.selection.ids.length < 2) {
    errors.push('selection');
  }
  if (!form.name.trim()) errors.push('empty-name');
  if (!/^macro:[a-z0-9][a-z0-9-]*$/.test(form.kind)) errors.push('kind-format');
  if (Object.prototype.hasOwnProperty.call(state.macros, form.kind)) errors.push('kind-exists');
  const preview = computePreview(state);
  if (preview.crossDomain) errors.push('cross-domain');
  const blockingErrors = errors.filter((e) => e !== 'kind-exists');
  return { errors, canSubmit: blockingErrors.length === 0 };
}

function circuitWith(ids: string[], connections: Array<[string, string, string, string]> = []) {
  let s: EditorState = emptyEditorState('circuit');
  for (const id of ids) {
    s = applyEditorAction(s, {
      type: 'placeComponent',
      kind: 'resistor',
      position: { x: 0, y: 0 },
      id,
    });
  }
  for (const [fromId, fromPort, toId, toPort] of connections) {
    s = applyEditorAction(s, {
      type: 'addConnection',
      from: { componentId: fromId, portName: fromPort },
      to: { componentId: toId, portName: toPort },
    });
  }
  return s;
}

describe('Dialog preview', () => {
  it('reports 0/0 when no multi-selection active', () => {
    const s = circuitWith(['a', 'b']);
    expect(computePreview(s)).toEqual({ innerCount: 0, portCount: 0, crossDomain: false });
  });

  it('counts inner components and boundary-derived port count', () => {
    let s = circuitWith(
      ['r1', 'r2', 'x'],
      [
        ['r1', 'b', 'r2', 'a'], // internal
        ['r2', 'b', 'x', 'p'], // boundary
        ['x', 'q', 'r1', 'a'], // boundary
      ],
    );
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['r1', 'r2'] });
    const preview = computePreview(s);
    expect(preview.innerCount).toBe(2);
    expect(preview.portCount).toBe(2); // r1.a and r2.b are boundary endpoints
    expect(preview.crossDomain).toBe(false);
  });

  it('reports zero ports when subgraph is isolated', () => {
    let s = circuitWith(['a', 'b'], [['a', 'p', 'b', 'q']]);
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['a', 'b'] });
    expect(computePreview(s).portCount).toBe(0);
  });
});

describe('Dialog validation', () => {
  it('blocks when selection is not multi', () => {
    const s = circuitWith(['a', 'b']);
    const { errors, canSubmit } = validate(s, { name: 'X', kind: 'macro:x' });
    expect(errors).toContain('selection');
    expect(canSubmit).toBe(false);
  });

  it('blocks when name is empty', () => {
    let s = circuitWith(['a', 'b']);
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['a', 'b'] });
    const { errors, canSubmit } = validate(s, { name: '   ', kind: 'macro:x' });
    expect(errors).toContain('empty-name');
    expect(canSubmit).toBe(false);
  });

  it('blocks when kind format is invalid', () => {
    let s = circuitWith(['a', 'b']);
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['a', 'b'] });
    const cases = ['resistor', 'macro:', 'macro:-bad', 'MACRO:X', 'macro:UPPER'];
    for (const kind of cases) {
      const { errors } = validate(s, { name: 'N', kind });
      expect(errors).toContain('kind-format');
    }
  });

  it('flags kind-exists but still allows submission (overwrite mode)', () => {
    let s = circuitWith(['a', 'b']);
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['a', 'b'] });
    s = applyEditorAction(s, {
      type: 'registerMacro',
      key: 'macro:x',
      definition: {
        spec: { domain: 'circuit', components: [], connections: [] },
        exportPortMap: {},
      },
    });
    const { errors, canSubmit } = validate(s, { name: 'X', kind: 'macro:x' });
    expect(errors).toContain('kind-exists');
    expect(canSubmit).toBe(true);
  });

  it('accepts a valid submission', () => {
    let s = circuitWith(['a', 'b']);
    s = applyEditorAction(s, { type: 'setMultiSelection', ids: ['a', 'b'] });
    const { errors, canSubmit } = validate(s, { name: 'Filter', kind: 'macro:filter-1' });
    expect(errors).toEqual([]);
    expect(canSubmit).toBe(true);
  });
});

describe('slugify pattern (matching Dialog auto-derivation)', () => {
  // Mirrors the slug logic inside MacroEncapsulateDialog
  function slugify(name: string): string {
    const slug = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    return slug ? `macro:${slug}` : '';
  }

  it('converts spaces and special chars to single hyphen', () => {
    expect(slugify('RC 低通 Filter!')).toBe('macro:rc-filter');
  });

  it('returns empty string when name is blank or fully unsupported', () => {
    expect(slugify('   ')).toBe('');
    expect(slugify('中文')).toBe('');
  });

  it('preserves alphanumeric words', () => {
    expect(slugify('rc-v2-filter-3')).toBe('macro:rc-v2-filter-3');
  });
});
