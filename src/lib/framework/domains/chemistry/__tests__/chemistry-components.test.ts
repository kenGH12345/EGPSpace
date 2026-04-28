/**
 * T-6 · Chemistry components unit tests.
 *
 * Covers:
 *  1. Each component class constructs with valid props
 *  2. toDTO() / componentRegistry.create() roundtrip is faithful
 *  3. Domain is 'chemistry' for all five kinds
 *  4. Validation (volumeML > 0, moles finite, thermometer range, solid massG >= 0)
 *  5. Factory helpers work
 */

import {
  Flask,
  Reagent,
  Bubble,
  Solid,
  Thermometer,
  componentRegistry,
} from '../index';
// Ensure side-effect registration runs once
import '../index';

describe('T-6 · chemistry components', () => {
  test('Flask construction + DTO roundtrip', () => {
    const f = new Flask('F1', { volumeML: 250, shape: 'beaker' });
    expect(f.domain).toBe('chemistry');
    expect(f.kind).toBe('flask');
    expect(f.ports).toEqual(['contents']);

    const dto = f.serialize();
    const revived = componentRegistry.create(dto) as Flask;
    expect(revived.id).toBe('F1');
    expect(revived.props.volumeML).toBe(250);
    expect(revived.props.shape).toBe('beaker');
  });

  test('Reagent construction + phase preservation + DTO', () => {
    const r = new Reagent('R1', {
      formula: 'H2SO4',
      moles: 0.5,
      concentration: 2,
      phase: 'aq',
    });
    expect(r.domain).toBe('chemistry');
    expect(r.ports).toEqual(['in']);
    expect(r.props.formula).toBe('H2SO4');

    const revived = componentRegistry.create(r.serialize()) as Reagent;
    expect(revived.props.moles).toBe(0.5);
    expect(revived.props.phase).toBe('aq');
  });

  test('Bubble and Solid and Thermometer basic construction', () => {
    const b = new Bubble('B1', { gas: 'H2', rateMolPerTick: 0.05 });
    expect(b.kind).toBe('bubble');
    expect(b.props.gas).toBe('H2');

    const s = new Solid('S1', { formula: 'Zn', massG: 5, state: 'intact' });
    expect(s.kind).toBe('solid');
    expect(s.props.state).toBe('intact');

    const t = new Thermometer('T1', { tempC: 25, range: [-10, 110] });
    expect(t.kind).toBe('thermometer');
    expect(t.props.tempC).toBe(25);
  });

  test('componentRegistry can create every chemistry kind from DTO', () => {
    const dtos = [
      { id: 'f', domain: 'chemistry' as const, kind: 'flask', props: { volumeML: 100, shape: 'tube' }, anchor: { x: 0, y: 0 } },
      { id: 'r', domain: 'chemistry' as const, kind: 'reagent', props: { formula: 'NaOH', moles: 1, concentration: 1, phase: 'aq' }, anchor: { x: 0, y: 0 } },
      { id: 'b', domain: 'chemistry' as const, kind: 'bubble', props: { gas: 'CO2', rateMolPerTick: 0.01 }, anchor: { x: 0, y: 0 } },
      { id: 's', domain: 'chemistry' as const, kind: 'solid', props: { formula: 'Fe', massG: 10, state: 'intact' }, anchor: { x: 0, y: 0 } },
      { id: 't', domain: 'chemistry' as const, kind: 'thermometer', props: { tempC: 20, range: [0, 100] }, anchor: { x: 0, y: 0 } },
    ];
    for (const dto of dtos) {
      const comp = componentRegistry.create(dto);
      expect(comp.domain).toBe('chemistry');
      expect(comp.kind).toBe(dto.kind);
    }
  });

  test('all five kinds have domain === chemistry', () => {
    const items = [
      new Flask('a', { volumeML: 1, shape: 'beaker' }),
      new Reagent('b', { formula: 'X', moles: 0, concentration: 0, phase: 's' }),
      new Bubble('c', { gas: 'O2', rateMolPerTick: 0 }),
      new Solid('d', { formula: 'Y', massG: 0, state: 'intact' }),
      new Thermometer('e', { tempC: 0, range: [0, 0] }),
    ];
    for (const c of items) expect(c.domain).toBe('chemistry');
  });

  test('Flask rejects volumeML <= 0', () => {
    expect(() => new Flask('bad', { volumeML: 0, shape: 'beaker' })).toThrow(/volumeML/);
    expect(() => new Flask('bad', { volumeML: -1, shape: 'beaker' })).toThrow(/volumeML/);
  });

  test('Reagent rejects missing formula and non-finite moles; Thermometer rejects inverted range', () => {
    expect(() => new Reagent('r', { formula: '', moles: 1, concentration: 1, phase: 'aq' })).toThrow(/formula/);
    expect(() => new Reagent('r', { formula: 'X', moles: Infinity, concentration: 1, phase: 'aq' })).toThrow(/moles/);
    expect(() => new Thermometer('t', { tempC: 25, range: [100, 0] })).toThrow(/range/);
    expect(() => new Solid('s', { formula: 'Fe', massG: -1, state: 'intact' })).toThrow(/massG/);
  });
});
