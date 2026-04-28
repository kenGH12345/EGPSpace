/**
 * T-7 · Chemistry solver · WAVE 0 GATE.
 *
 * Must pass 8/8 before Wave 1 begins. If any fail, the solver or its
 * limiting-reagent algorithm has a bug that would poison every reaction rule.
 */

import {
  Flask,
  Reagent,
  Solid,
  ChemistryGraph,
  StoichiometrySolver,
} from '../index';
import '../index'; // ensure registrations

function emptyGraph() {
  return new ChemistryGraph();
}

function flaskWith(id: string, contents: { reagents?: Array<[string, string, number, 'aq' | 'l' | 's' | 'g', number?]>; solids?: Array<[string, string, number]> } = {}) {
  const g = new ChemistryGraph();
  const f = new Flask(id, { volumeML: 250, shape: 'beaker' });
  g.add(f);
  for (const [rid, formula, moles, phase, conc] of contents.reagents ?? []) {
    const r = new Reagent(rid, { formula, moles, concentration: conc ?? 0, phase });
    g.add(r);
    g.connect({ componentId: rid, portName: 'in' }, { componentId: id, portName: 'contents' });
  }
  for (const [sid, formula, massG] of contents.solids ?? []) {
    const s = new Solid(sid, { formula, massG, state: 'intact' });
    g.add(s);
    g.connect({ componentId: sid, portName: 'in' }, { componentId: id, portName: 'contents' });
  }
  return g;
}

describe('T-7 · StoichiometrySolver · Wave 0 Gate', () => {
  const solver = new StoichiometrySolver();

  test('GATE-1 · empty graph returns empty perComponent and no reactions', () => {
    const r = solver.solve(emptyGraph());
    expect(r.perComponent).toEqual({});
    expect(r.reactions).toEqual([]);
    expect(r.state).toBe('normal');
  });

  test('GATE-2 · flask with 1 non-reacting reagent → state=normal, moles preserved', () => {
    const g = flaskWith('F1', { reagents: [['R1', 'C6H12O6', 0.3, 'aq', 1]] });
    const r = solver.solve(g);
    expect(r.perComponent['R1'].state).toBe('normal');
    expect(r.perComponent['R1'].moles).toBe(0.3);
    expect(r.reactions).toHaveLength(0);
  });

  test('GATE-3 · flask with acid + base → identifies a reaction candidate', () => {
    const g = flaskWith('F1', {
      reagents: [
        ['A1', 'H2SO4', 0.5, 'aq', 2],
        ['B1', 'NaOH', 1.0, 'aq', 1],
      ],
    });
    const r = solver.solve(g);
    expect(r.reactions.length).toBeGreaterThanOrEqual(1);
    const neutralization = r.reactions.find((rc) => rc.ruleId === 'chemistry/acid-base-neutralization');
    expect(neutralization).toBeDefined();
    expect(neutralization!.flaskId).toBe('F1');
    expect(neutralization!.reactantIds.sort()).toEqual(['A1', 'B1']);
  });

  test('GATE-4 · limiting-reagent identification: 0.1 mol acid + 1 mol base → acid limits', () => {
    // Stoichiometry: H2SO4 + 2 NaOH.  extent_if_acid_limits = 0.1/1 = 0.1
    //                                 extent_if_base_limits = 1/2   = 0.5
    // acid limits.
    const g = flaskWith('F1', {
      reagents: [
        ['A1', 'H2SO4', 0.1, 'aq', 1],
        ['B1', 'NaOH', 1.0, 'aq', 1],
      ],
    });
    const r = solver.solve(g);
    const neutralization = r.reactions.find((rc) => rc.ruleId === 'chemistry/acid-base-neutralization')!;
    expect(neutralization.limitingReagentId).toBe('A1');
    expect(neutralization.extent).toBeCloseTo(0.1, 4);
  });

  test('GATE-5 · extent = limitingMoles / stoichiometricCoefficient', () => {
    // Reverse of GATE-4: plenty of acid, scarce base.
    // extent_if_base_limits = 0.2 / 2 = 0.1
    const g = flaskWith('F1', {
      reagents: [
        ['A1', 'H2SO4', 5, 'aq', 1],
        ['B1', 'NaOH', 0.2, 'aq', 1],
      ],
    });
    const r = solver.solve(g);
    const neutralization = r.reactions.find((rc) => rc.ruleId === 'chemistry/acid-base-neutralization')!;
    expect(neutralization.limitingReagentId).toBe('B1');
    expect(neutralization.extent).toBeCloseTo(0.1, 4);
  });

  test('GATE-6 · two independent flasks do not interfere', () => {
    const g = new ChemistryGraph();
    // Flask A: Zn + H2SO4
    g.add(new Flask('FA', { volumeML: 100, shape: 'tube' }));
    g.add(new Solid('Zn1', { formula: 'Zn', massG: 1, state: 'intact' }));
    g.add(new Reagent('HA1', { formula: 'H2SO4', moles: 0.1, concentration: 1, phase: 'aq' }));
    g.connect({ componentId: 'Zn1', portName: 'in' }, { componentId: 'FA', portName: 'contents' });
    g.connect({ componentId: 'HA1', portName: 'in' }, { componentId: 'FA', portName: 'contents' });
    // Flask B: acid + base
    g.add(new Flask('FB', { volumeML: 100, shape: 'tube' }));
    g.add(new Reagent('HA2', { formula: 'H2SO4', moles: 0.1, concentration: 1, phase: 'aq' }));
    g.add(new Reagent('NB1', { formula: 'NaOH', moles: 0.2, concentration: 1, phase: 'aq' }));
    g.connect({ componentId: 'HA2', portName: 'in' }, { componentId: 'FB', portName: 'contents' });
    g.connect({ componentId: 'NB1', portName: 'in' }, { componentId: 'FB', portName: 'contents' });

    const r = solver.solve(g);
    const flaskAReactions = r.reactions.filter((rc) => rc.flaskId === 'FA');
    const flaskBReactions = r.reactions.filter((rc) => rc.flaskId === 'FB');
    expect(flaskAReactions.length).toBeGreaterThan(0);
    expect(flaskBReactions.length).toBeGreaterThan(0);
    expect(flaskAReactions.every((rc) => rc.flaskId === 'FA')).toBe(true);
    expect(flaskBReactions.every((rc) => rc.flaskId === 'FB')).toBe(true);
  });

  test('GATE-7 · negative/non-finite moles are clamped to 0 and state=exhausted', () => {
    // Bypass Reagent constructor's guard by mutating props after creation.
    const g = new ChemistryGraph();
    const f = new Flask('F1', { volumeML: 100, shape: 'beaker' });
    g.add(f);
    const r = new Reagent('R1', { formula: 'NaCl', moles: 1, concentration: 1, phase: 'aq' });
    g.add(r);
    g.connect({ componentId: 'R1', portName: 'in' }, { componentId: 'F1', portName: 'contents' });
    (r.props as { moles: number }).moles = -0.5;
    const result = solver.solve(g);
    expect(result.perComponent['R1'].moles).toBe(0);
    expect(result.perComponent['R1'].state).toBe('exhausted');
  });

  test('GATE-8 · unknown reagent formulas are silently skipped (no throw, no reactions)', () => {
    const g = flaskWith('F1', {
      reagents: [
        ['R1', 'UnobtaniumX', 1, 'aq', 1],
        ['R2', 'MysteryY', 1, 'aq', 1],
      ],
    });
    const r = solver.solve(g);
    expect(r.reactions).toHaveLength(0);
    expect(r.perComponent['R1'].state).toBe('normal');
    expect(r.perComponent['R2'].state).toBe('normal');
  });
});
