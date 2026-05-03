/**
 * macro-resolver tests (T-3) — MacroResolver factory semantics.
 */

import { makeResolverFromState, specReferencesMacros } from '../macro-resolver';
import type { MacroDefinition } from '@/lib/framework/macro/flattener';

const def: MacroDefinition = {
  spec: { domain: 'circuit', components: [], connections: [] },
  exportPortMap: {},
};

describe('makeResolverFromState', () => {
  it('resolves kinds with "macro:" prefix', () => {
    const r = makeResolverFromState({ 'macro:foo': def });
    expect(r.resolve('macro:foo')).toBe(def);
  });

  it('returns undefined for atomic kinds (non-macro prefix)', () => {
    const r = makeResolverFromState({ 'macro:foo': def });
    expect(r.resolve('resistor')).toBeUndefined();
    expect(r.resolve('battery')).toBeUndefined();
  });

  it('returns undefined for unknown macro kinds', () => {
    const r = makeResolverFromState({ 'macro:foo': def });
    expect(r.resolve('macro:missing')).toBeUndefined();
  });

  it('handles empty macros map', () => {
    const r = makeResolverFromState({});
    expect(r.resolve('macro:anything')).toBeUndefined();
    expect(r.resolve('resistor')).toBeUndefined();
  });
});

describe('specReferencesMacros', () => {
  it('returns true when any component kind starts with "macro:"', () => {
    expect(
      specReferencesMacros([
        { kind: 'resistor' },
        { kind: 'macro:x' },
        { kind: 'ground' },
      ]),
    ).toBe(true);
  });

  it('returns false when no component references a macro', () => {
    expect(
      specReferencesMacros([{ kind: 'resistor' }, { kind: 'battery' }]),
    ).toBe(false);
  });

  it('returns false for empty component list', () => {
    expect(specReferencesMacros([])).toBe(false);
  });
});
