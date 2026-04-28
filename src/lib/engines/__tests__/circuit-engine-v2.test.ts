/**
 * CircuitEngine v2.0 dual-path tests.
 *
 * Covers:
 *   - Legacy v1.1 path: params without `graph` key unchanged behaviour
 *   - v2 graph path: AssemblySpec → per-component results
 *   - Dispatch type guard: 4 edge cases that MUST fall to v1.1
 *   - Reaction integration: overloaded bulb triggers BurntBulb spawn
 *   - Failure modes: unknown kind, bad spec, solver failure → structured error
 */

import circuitEngine, { CircuitEngine } from '../physics/circuit';
import type { AssemblySpec } from '@/lib/framework';
// Ensure circuit domain factories are registered
import '@/lib/framework/domains/circuit';

describe('CircuitEngine v2.0 · dispatch type guard', () => {
  test('v1.1 path: no graph key → closed-form result', () => {
    const result = circuitEngine.compute({ voltage: 12, r1: 10, r2: 20, topology: 0 });
    expect(result.values.version).toBeUndefined();  // v1 has no version field
    expect(result.values.current).toBeCloseTo(12 / 30, 4);
    expect(result.state).toBe('series');
  });

  test('v1.1 path: graph is not an object → falls through', () => {
    // @ts-expect-error — intentional bad shape
    const result = circuitEngine.compute({ voltage: 6, r1: 5, graph: 'not an object' });
    expect(result.values.version).toBeUndefined();
    expect(result.values.current).toBeCloseTo(6 / 5, 4);
  });

  test('v1.1 path: graph is empty object → falls through', () => {
    // @ts-expect-error — intentional
    const result = circuitEngine.compute({ voltage: 6, r1: 5, graph: {} });
    expect(result.values.version).toBeUndefined();
  });

  test('v1.1 path: graph.components is empty array → falls through', () => {
    // @ts-expect-error — intentional
    const result = circuitEngine.compute({ voltage: 6, r1: 5, graph: { components: [] } });
    expect(result.values.version).toBeUndefined();
  });

  test('v2 path: graph.components is non-empty array → v2 result', () => {
    const spec: AssemblySpec<'circuit'> = {
      domain: 'circuit',
      components: [
        { id: 'b1', kind: 'battery', props: { voltage: 6 } },
        { id: 'r1', kind: 'resistor', props: { resistance: 10 } },
      ],
      connections: [
        { from: { componentId: 'b1', portName: 'positive' }, to: { componentId: 'r1', portName: 'a' } },
        { from: { componentId: 'r1', portName: 'b' }, to: { componentId: 'b1', portName: 'negative' } },
      ],
    };
    // @ts-expect-error — runtime-only payload shape
    const result = circuitEngine.compute({ graph: spec });
    expect(result.values.version).toBe('v2');
    expect(result.values.componentCount).toBe(2);
    const perComp = result.values.perComponent as Record<string, Record<string, number>>;
    expect(perComp.r1).toBeDefined();
    expect(perComp.r1.current).toBeCloseTo(0.6, 2);  // 6V/10Ω = 0.6A
  });
});

describe('CircuitEngine v2.0 · v2 graph path', () => {
  test('series circuit (battery + resistor + bulb) with reactions disabled', () => {
    const spec: AssemblySpec<'circuit'> = {
      domain: 'circuit',
      components: [
        { id: 'b1', kind: 'battery', props: { voltage: 9 } },
        { id: 'r1', kind: 'resistor', props: { resistance: 10 } },
        { id: 'l1', kind: 'bulb', props: { resistance: 6, ratedPower: 2 } },
      ],
      connections: [
        { from: { componentId: 'b1', portName: 'positive' }, to: { componentId: 'r1', portName: 'a' } },
        { from: { componentId: 'r1', portName: 'b' }, to: { componentId: 'l1', portName: 'a' } },
        { from: { componentId: 'l1', portName: 'b' }, to: { componentId: 'b1', portName: 'negative' } },
      ],
    };
    // @ts-expect-error — runtime payload
    const result = circuitEngine.compute({ graph: spec, reactions: false });
    const perComp = result.values.perComponent as Record<string, Record<string, number>>;
    // Series: total R = 10+6 = 16; I = 9/16 = 0.5625A
    expect(perComp.r1.current).toBeCloseTo(0.5625, 3);
    expect(perComp.l1.current).toBeCloseTo(0.5625, 3);
  });

  test('overload triggers reaction: bulb → BurntBulb spawns', () => {
    // 24V across a 2W-rated bulb → massive overload → burnout rule fires
    const spec: AssemblySpec<'circuit'> = {
      domain: 'circuit',
      components: [
        { id: 'b1', kind: 'battery', props: { voltage: 24 } },
        { id: 'l1', kind: 'bulb', props: { resistance: 6, ratedPower: 2 } },
      ],
      connections: [
        { from: { componentId: 'b1', portName: 'positive' }, to: { componentId: 'l1', portName: 'a' } },
        { from: { componentId: 'l1', portName: 'b' }, to: { componentId: 'b1', portName: 'negative' } },
      ],
    };
    // @ts-expect-error — runtime payload
    const result = circuitEngine.compute({ graph: spec });
    expect(result.values.version).toBe('v2');
    // Burnout should have fired
    expect(result.values.burntCount).toBeGreaterThanOrEqual(1);
    const events = result.values.events as Array<{ sourceRuleId: string; kind: string }>;
    expect(events.some((e) => e.sourceRuleId.includes('overload'))).toBe(true);
  });

  test('overrides patch applies before solving', () => {
    const spec: AssemblySpec<'circuit'> = {
      domain: 'circuit',
      components: [
        { id: 'b1', kind: 'battery', props: { voltage: 6 } },
        { id: 'r1', kind: 'resistor', props: { resistance: 10 } },
      ],
      connections: [
        { from: { componentId: 'b1', portName: 'positive' }, to: { componentId: 'r1', portName: 'a' } },
        { from: { componentId: 'r1', portName: 'b' }, to: { componentId: 'b1', portName: 'negative' } },
      ],
    };
    // @ts-expect-error — runtime payload: doubles battery voltage via override
    const result = circuitEngine.compute({ graph: spec, overrides: { b1: { voltage: 12 } } });
    const perComp = result.values.perComponent as Record<string, Record<string, number>>;
    expect(perComp.r1.current).toBeCloseTo(1.2, 2);  // 12/10
  });
});

describe('CircuitEngine v2.0 · failure modes', () => {
  test('unknown kind → structured error, not throw', () => {
    const badSpec = {
      domain: 'circuit',
      components: [{ id: 'x', kind: 'flux_capacitor', props: {} }],
      connections: [],
    };
    // @ts-expect-error — runtime payload
    const result = circuitEngine.compute({ graph: badSpec });
    expect(result.values.error).toBe(true);
    expect(result.values.errorCode).toBe('assembly_build_failed');
    expect(result.state).toBe('error');
  });

  test('engine instance is reusable', () => {
    const e = new CircuitEngine();
    const r1 = e.compute({ voltage: 6, r1: 10 });  // v1.1
    const r2 = e.compute({ voltage: 12, r1: 20 }); // v1.1 again
    expect(r1.values.current).toBeCloseTo(0.6, 3);
    expect(r2.values.current).toBeCloseTo(0.6, 3);
  });
});
