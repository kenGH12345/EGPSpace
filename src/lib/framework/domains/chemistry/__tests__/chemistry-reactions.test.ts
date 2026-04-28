/**
 * T-13 · Chemistry reactions tests.
 *
 * Covers:
 *   1. acidBaseRule · equimolar acid+base → remove both + spawn salt + spawn water
 *   2. acidBaseRule · excess acid → remove base + mutate acid.moles
 *   3. acidBaseRule · invokes TitrationEngine (AC-F spy)
 *   4. metalAcidRule · Zn + H2SO4 → spawn Bubble(H2) · AC-G evidence
 *   5. metalAcidRule · Bubble product attached to source flask via spawnId
 *   6. ironRustingRule · Fe.state intact → rusting (mutate)
 *   7. ironRustingRule · invokes IronRustingEngine (AC-F spy)
 *   8. ironRustingRule · multi-tick advances rusting → dissolved
 *   9. InteractionEngine · 3 rules · iterations ≤ maxIter (no oscillation)
 *  10. unknown reactants → all rules skip silently
 */

import {
  Flask,
  Reagent,
  Solid,
  ChemistryGraph,
  StoichiometrySolver,
  CHEMISTRY_REACTIONS,
  acidBaseNeutralizationRule,
  metalAcidRule,
  ironRustingRule,
} from '../index';
import { InteractionEngine } from '@/lib/framework';
import * as TitrationModule from '@/lib/engines/chemistry/titration';
import * as RustModule from '@/lib/engines/chemistry/iron-rusting';

function seedFlaskAcidBase(acidMoles: number, baseMoles: number): ChemistryGraph {
  const g = new ChemistryGraph();
  g.add(new Flask('F1', { volumeML: 100, shape: 'beaker' }));
  g.add(new Reagent('A', { formula: 'H2SO4', moles: acidMoles, concentration: 2, phase: 'aq' }));
  g.add(new Reagent('B', { formula: 'NaOH', moles: baseMoles, concentration: 2, phase: 'aq' }));
  g.connect({ componentId: 'A', portName: 'in' }, { componentId: 'F1', portName: 'contents' });
  g.connect({ componentId: 'B', portName: 'in' }, { componentId: 'F1', portName: 'contents' });
  return g;
}

function seedFlaskZnAcid(znMassG: number, acidMoles: number): ChemistryGraph {
  const g = new ChemistryGraph();
  g.add(new Flask('F1', { volumeML: 100, shape: 'beaker' }));
  g.add(new Solid('Zn1', { formula: 'Zn', massG: znMassG, state: 'intact' }));
  g.add(new Reagent('A', { formula: 'H2SO4', moles: acidMoles, concentration: 2, phase: 'aq' }));
  g.connect({ componentId: 'Zn1', portName: 'in' }, { componentId: 'F1', portName: 'contents' });
  g.connect({ componentId: 'A', portName: 'in' }, { componentId: 'F1', portName: 'contents' });
  return g;
}

function seedFlaskFeO2(feMassG: number, o2Moles: number): ChemistryGraph {
  const g = new ChemistryGraph();
  g.add(new Flask('F1', { volumeML: 100, shape: 'beaker' }));
  g.add(new Solid('Fe1', { formula: 'Fe', massG: feMassG, state: 'intact' }));
  g.add(new Reagent('O', { formula: 'O2', moles: o2Moles, concentration: 0, phase: 'g' }));
  g.connect({ componentId: 'Fe1', portName: 'in' }, { componentId: 'F1', portName: 'contents' });
  g.connect({ componentId: 'O', portName: 'in' }, { componentId: 'F1', portName: 'contents' });
  return g;
}

describe('T-13 · chemistry reactions', () => {
  const solver = new StoichiometrySolver();

  test('T13-1 · equimolar acid+base → remove both + spawn 2 products', () => {
    // H2SO4 + 2 NaOH → stoichiometric at 0.5 mol acid + 1.0 mol base
    const g = seedFlaskAcidBase(0.5, 1.0);
    const solution = solver.solve(g);
    const events = acidBaseNeutralizationRule.evaluate(g, solution);
    const removes = events.filter((e) => e.kind === 'remove');
    const spawns = events.filter((e) => e.kind === 'spawn');
    expect(removes.length).toBeGreaterThanOrEqual(2);
    expect(spawns.length).toBe(2); // Na2SO4 + H2O
    const salt = spawns.find((e) => e.newComponent?.kind === 'reagent' && (e.newComponent.props as { formula: string }).formula === 'Na2SO4');
    const water = spawns.find((e) => e.newComponent?.kind === 'reagent' && (e.newComponent.props as { formula: string }).formula === 'H2O');
    expect(salt).toBeDefined();
    expect(water).toBeDefined();
  });

  test('T13-2 · excess acid → remove limiting base + mutate acid.moles', () => {
    // 0.5 mol acid + 0.2 mol base (base limits at extent 0.1)
    const g = seedFlaskAcidBase(0.5, 0.2);
    const solution = solver.solve(g);
    const events = acidBaseNeutralizationRule.evaluate(g, solution);
    const removedB = events.find((e) => e.kind === 'remove' && e.targetId === 'B');
    const mutatedA = events.find((e) => e.kind === 'mutate' && e.targetId === 'A');
    expect(removedB).toBeDefined();
    expect(mutatedA).toBeDefined();
    expect(mutatedA!.mutation).toMatchObject({ moles: expect.any(Number) });
  });

  test('T13-3 · acidBaseRule invokes TitrationEngine (AC-F evidence)', () => {
    const spy = jest.spyOn(TitrationModule.TitrationEngine.prototype, 'compute');
    const g = seedFlaskAcidBase(0.5, 1.0);
    const solution = solver.solve(g);
    acidBaseNeutralizationRule.evaluate(g, solution);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('T13-4 · metalAcidRule · Zn + H2SO4 → spawn Bubble(H2) · AC-G', () => {
    const g = seedFlaskZnAcid(1, 0.01); // 1g Zn + 0.01 mol H2SO4
    const solution = solver.solve(g);
    const events = metalAcidRule.evaluate(g, solution);
    const bubble = events.find((e) => e.kind === 'spawn' && e.newComponent?.kind === 'bubble');
    expect(bubble).toBeDefined();
    expect((bubble!.newComponent!.props as { gas: string }).gas).toBe('H2');
  });

  test('T13-5 · metalAcidRule · Bubble id references parent flask', () => {
    const g = seedFlaskZnAcid(1, 0.01);
    const solution = solver.solve(g);
    const events = metalAcidRule.evaluate(g, solution);
    const bubble = events.find((e) => e.kind === 'spawn' && e.newComponent?.kind === 'bubble')!;
    expect(bubble.newComponent!.id).toContain('F1');
    expect(bubble.newComponent!.id).toContain('H2');
  });

  test('T13-6 · ironRustingRule · Fe.state advances intact → rusting (mutate)', () => {
    const g = seedFlaskFeO2(1, 0.02);
    const solution = solver.solve(g);
    const events = ironRustingRule.evaluate(g, solution);
    const mut = events.find((e) => e.kind === 'mutate' && e.targetId === 'Fe1');
    expect(mut).toBeDefined();
    expect(mut!.mutation).toMatchObject({ state: 'rusting' });
  });

  test('T13-7 · ironRustingRule invokes IronRustingEngine (AC-F evidence)', () => {
    const spy = jest.spyOn(RustModule.IronRustingEngine.prototype, 'compute');
    const g = seedFlaskFeO2(1, 0.02);
    const solution = solver.solve(g);
    ironRustingRule.evaluate(g, solution);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  test('T13-8 · ironRustingRule · rusting Fe on second tick advances to dissolved', () => {
    const g = seedFlaskFeO2(1, 0.02);
    // Seed Fe in already-rusting state
    g.get('Fe1')!.props.state = 'rusting';
    const solution = solver.solve(g);
    const events = ironRustingRule.evaluate(g, solution);
    const mut = events.find((e) => e.kind === 'mutate' && e.targetId === 'Fe1')!;
    expect(mut.mutation).toMatchObject({ state: 'dissolved' });
  });

  test('T13-9 · InteractionEngine runs 3 rules, converges within maxIter', () => {
    const g = seedFlaskAcidBase(0.5, 1.0);
    const engine = new InteractionEngine(solver, 8).registerAll(CHEMISTRY_REACTIONS);
    const report = engine.tick(g);
    expect(report.unstable).toBe(false);
    expect(report.iterations).toBeLessThanOrEqual(8);
    // Events must include at least 2 spawns (salt, water)
    expect(report.events.filter((e) => e.kind === 'spawn').length).toBeGreaterThanOrEqual(2);
  });

  test('T13-10 · unknown formula → no events from any rule', () => {
    const g = new ChemistryGraph();
    g.add(new Flask('F1', { volumeML: 100, shape: 'beaker' }));
    g.add(new Reagent('X', { formula: 'Unobtanium', moles: 1, concentration: 1, phase: 'aq' }));
    g.add(new Reagent('Y', { formula: 'MysteryZ', moles: 1, concentration: 1, phase: 'aq' }));
    g.connect({ componentId: 'X', portName: 'in' }, { componentId: 'F1', portName: 'contents' });
    g.connect({ componentId: 'Y', portName: 'in' }, { componentId: 'F1', portName: 'contents' });
    const solution = solver.solve(g);
    for (const rule of CHEMISTRY_REACTIONS) {
      expect(rule.evaluate(g, solution)).toEqual([]);
    }
  });
});
