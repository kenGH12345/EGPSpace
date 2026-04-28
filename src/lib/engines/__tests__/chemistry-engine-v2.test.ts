/**
 * T-20 · ChemistryReactionEngine v2.0 dual-path tests.
 *
 * 10 cases covering both paths and the graph-payload type guard.
 */

import { ChemistryReactionEngine } from '../chemistry/reaction';
import { ChemistryBuilder, chemistryAssembler } from '@/lib/framework/domains/chemistry';
// Ensure the factory registrations have run before any engine call
import '@/lib/framework/domains/chemistry';

describe('T-20 · ChemistryReactionEngine v2.0 dual-path', () => {
  const engine = new ChemistryReactionEngine();

  test('T20-1 · v1 path · legacy numeric params → closed-form reaction extent', () => {
    const r = engine.compute({ acidMoles: 0.5, baseMoles: 1.0 });
    expect(r.values.reactionExtent).toBeCloseTo(0.5, 4);
    expect(r.state).toBe('stable');
  });

  test('T20-2 · v1 path · no matching inputs → zero extent', () => {
    const r = engine.compute({});
    expect(r.values.reactionExtent).toBe(0);
  });

  test('T20-3 · dual-path · params.graph === null → falls back to v1', () => {
    const r = engine.compute({ graph: null } as unknown as Record<string, number>);
    expect(r.values.reactionExtent).toBeDefined();
  });

  test('T20-4 · dual-path · params.graph === {} (no components) → falls back to v1', () => {
    const r = engine.compute({ graph: {} } as unknown as Record<string, number>);
    expect(r.values.reactionExtent).toBeDefined();
  });

  test('T20-5 · dual-path · components === [] (empty array) → falls back to v1', () => {
    const r = engine.compute({
      graph: { domain: 'chemistry', components: [], connections: [] },
    } as unknown as Record<string, number>);
    expect(r.values.reactionExtent).toBeDefined();
  });

  test('T20-6 · v2 path · complete metal-acid graph → spawn H2 Bubble event', () => {
    const spec = new ChemistryBuilder()
      .flask({ id: 'F1', volumeML: 100, shape: 'beaker' })
      .drop('F1', { id: 'Zn1', formula: 'Zn', massG: 1 })
      .pour('F1', { id: 'A1', formula: 'H2SO4', moles: 0.01, concentration: 2, phase: 'aq' })
      .toSpec();

    const r = engine.compute({ graph: spec } as unknown as Record<string, number>);
    expect(r.values.spawnCount).toBeGreaterThanOrEqual(2);
    // Events array must contain a bubble spawn
    const events = r.values.events as Array<{ kind: string; newComponentKind: string }>;
    const bubbleSpawn = events.find((e) => e.kind === 'spawn' && e.newComponentKind === 'bubble');
    expect(bubbleSpawn).toBeDefined();
  });

  test('T20-7 · v2 path · acid-base graph → remove + spawn events for salt/water', () => {
    const spec = new ChemistryBuilder()
      .flask({ id: 'F1', volumeML: 100, shape: 'beaker' })
      .pour('F1', { id: 'A1', formula: 'H2SO4', moles: 0.5, concentration: 2, phase: 'aq' })
      .pour('F1', { id: 'B1', formula: 'NaOH', moles: 1.0, concentration: 2, phase: 'aq' })
      .toSpec();

    const r = engine.compute({ graph: spec } as unknown as Record<string, number>);
    expect(r.values.removeCount).toBeGreaterThanOrEqual(1);
    expect(r.values.spawnCount).toBeGreaterThanOrEqual(2);
  });

  test('T20-8 · v2 path · mixed metal-acid + Fe rusting → multiple reaction events', () => {
    // Two separate flasks with independent reactions
    const b = new ChemistryBuilder()
      .flask({ id: 'FA', volumeML: 100, shape: 'tube' })
      .drop('FA', { id: 'Zn1', formula: 'Zn', massG: 1 })
      .pour('FA', { id: 'A1', formula: 'H2SO4', moles: 0.01, concentration: 2, phase: 'aq' })
      .flask({ id: 'FB', volumeML: 100, shape: 'tube' })
      .drop('FB', { id: 'Fe1', formula: 'Fe', massG: 5 })
      .pour('FB', { id: 'O1', formula: 'O2', moles: 0.1, concentration: 0, phase: 'g' });

    const r = engine.compute({ graph: b.toSpec() } as unknown as Record<string, number>);
    const events = r.values.events as Array<{ sourceRuleId: string }>;
    const ruleIds = new Set(events.map((e) => e.sourceRuleId));
    expect(ruleIds.has('chemistry/metal-acid')).toBe(true);
    expect(ruleIds.has('chemistry/iron-rusting')).toBe(true);
  });

  test('T20-9 · failure recovery · broken graph (missing kind) → error state', () => {
    const badSpec = {
      domain: 'chemistry',
      components: [{ id: 'x', kind: 'unknown_kind', props: {} }],
      connections: [],
    };
    const r = engine.compute({ graph: badSpec } as unknown as Record<string, number>);
    expect(r.state).toBe('error');
    expect(r.explanation).toContain('failed');
  });

  test('T20-10 · assembler roundtrip · spec→assemble→toDTO→compute preserves result', () => {
    const b = new ChemistryBuilder()
      .flask({ id: 'F1', volumeML: 100, shape: 'beaker' })
      .pour('F1', { id: 'R1', formula: 'H2SO4', moles: 0.1, concentration: 2, phase: 'aq' })
      .pour('F1', { id: 'R2', formula: 'NaOH', moles: 0.2, concentration: 2, phase: 'aq' });

    const graph = b.build(chemistryAssembler);
    const dto = graph.toDTO();
    const r = engine.compute({ graph: dto } as unknown as Record<string, number>);
    expect(r.values.spawnCount).toBeGreaterThanOrEqual(2);
  });
});
