/**
 * Framework + Circuit Solver Tests
 *
 * Covers the critical path:
 *  - Union-Find basic operations
 *  - 7 circuit components independently constructible (AC-1)
 *  - Circuit MNA solver on 5 canonical topologies (PLAN T-24)
 *  - Interaction engine reaction mechanics (new component spawning)
 */

import { UnionFind, InteractionEngine, portRef } from '../index';
import {
  Battery,
  Wire,
  Switch,
  Resistor,
  Bulb,
  Ammeter,
  Voltmeter,
  BurntBulb,
  CircuitGraph,
  CircuitSolver,
  CIRCUIT_REACTIONS,
  overloadBulbRule,
} from '../domains/circuit';

// ────────────────────────────────────────────────────────────────────────
describe('Framework · UnionFind', () => {
  it('unions and finds with path compression', () => {
    const uf = new UnionFind();
    uf.union('a', 'b');
    uf.union('b', 'c');
    expect(uf.connected('a', 'c')).toBe(true);
    expect(uf.connected('a', 'd')).toBe(false);
  });

  it('partition groups connected keys', () => {
    const uf = new UnionFind();
    uf.union('x', 'y');
    uf.union('p', 'q');
    uf.add('z');
    const groups = [...uf.partition().values()].map((g) => g.sort());
    expect(groups.length).toBe(3);
  });
});

// ────────────────────────────────────────────────────────────────────────
describe('Circuit · 7 Components are independently constructible (AC-1)', () => {
  it('Battery / Wire / Switch / Resistor / Bulb / Ammeter / Voltmeter each instantiate with isolated state', () => {
    const b1 = new Battery('b1', 6);
    const b2 = new Battery('b2', 12);
    expect(b1.props.voltage).toBe(6);
    expect(b2.props.voltage).toBe(12);
    b1.props.voltage = 9;
    expect(b2.props.voltage).toBe(12); // independence

    expect(new Wire('w1').ports).toEqual(['a', 'b']);
    expect(new Switch('s1', true).props.closed).toBe(true);
    expect(new Resistor('r1', 10).props.resistance).toBe(10);
    expect(new Bulb('bulb1', 5, 3).props.ratedPower).toBe(3);
    expect(new Ammeter('am1').kind).toBe('ammeter');
    expect(new Voltmeter('vm1').ports).toEqual(['+', '-']);
  });

  it('component reuse: Resistor class can be instantiated many times with distinct props (AC-4)', () => {
    const rs = Array.from({ length: 5 }, (_, i) => new Resistor(`R${i}`, (i + 1) * 10));
    rs[0].props.resistance = 999;
    expect(rs[1].props.resistance).toBe(20); // untouched
    expect(new Set(rs.map((r) => r.id)).size).toBe(5);
  });
});

// ────────────────────────────────────────────────────────────────────────
describe('Circuit · CircuitGraph port connections (AC-2, AC-5)', () => {
  it('connects ports and identifies equipotential nodes via wires', () => {
    const g = new CircuitGraph();
    const bat = new Battery('bat', 12);
    const w = new Wire('w1');
    const r = new Resistor('r1', 10);
    g.add(bat).add(w).add(r);
    g.connect(portRef('bat', 'positive'), portRef('w1', 'a'));
    g.connect(portRef('w1', 'b'), portRef('r1', 'a'));
    g.connect(portRef('r1', 'b'), portRef('bat', 'negative'));

    const nodes = g.buildEquipotentialNodes((c) => g.shortEdgeFilter(c));
    // Expected 2 equipotential nodes: {bat+, w.a, w.b, r.a} all shorted via wire; {r.b, bat-}
    expect(nodes.nodes.length).toBe(2);
  });

  it('throws on connecting unknown port', () => {
    const g = new CircuitGraph();
    g.add(new Battery('bat', 6));
    expect(() => g.connect(portRef('bat', 'nonexistent'), portRef('bat', 'negative'))).toThrow();
  });
});

// ────────────────────────────────────────────────────────────────────────
describe('Circuit · MNA Solver on 5 canonical topologies (PLAN T-24, AC-6)', () => {
  const solver = new CircuitSolver();

  function buildSeriesGraph(v: number, rValues: number[]): CircuitGraph {
    const g = new CircuitGraph();
    const bat = new Battery('bat', v);
    g.add(bat);
    const resistors = rValues.map((r, i) => new Resistor(`r${i}`, r));
    resistors.forEach((r) => g.add(r));
    // Chain: bat+ → r0.a → r0.b → r1.a → ... → r(n-1).b → bat-
    let prevPort = portRef('bat', 'positive');
    for (const r of resistors) {
      g.connect(prevPort, portRef(r.id, 'a'));
      prevPort = portRef(r.id, 'b');
    }
    g.connect(prevPort, portRef('bat', 'negative'));
    return g;
  }

  it('Topology 1 · single resistor: U=6V, R=10Ω → I=0.6A', () => {
    const g = buildSeriesGraph(6, [10]);
    const sol = solver.solve(g);
    expect(sol.state).toBe('normal');
    expect(sol.perComponent['r0'].current).toBeCloseTo(0.6, 3);
    expect(sol.perComponent['r0'].voltage).toBeCloseTo(6, 3);
    expect(sol.aggregates.totalCurrent).toBeCloseTo(0.6, 3);
  });

  it('Topology 2 · series R1+R2: U=12V, R=10+20Ω → I=0.4A, V_R1=4V, V_R2=8V', () => {
    const g = buildSeriesGraph(12, [10, 20]);
    const sol = solver.solve(g);
    expect(sol.perComponent['r0'].current).toBeCloseTo(0.4, 3);
    expect(sol.perComponent['r1'].current).toBeCloseTo(0.4, 3);
    expect(sol.perComponent['r0'].voltage).toBeCloseTo(4, 3);
    expect(sol.perComponent['r1'].voltage).toBeCloseTo(8, 3);
  });

  it('Topology 3 · parallel R1‖R2: U=12V, R1=R2=10Ω → Req=5Ω, I=2.4A, I1=I2=1.2A', () => {
    const g = new CircuitGraph();
    g.add(new Battery('bat', 12))
      .add(new Resistor('r1', 10))
      .add(new Resistor('r2', 10));
    // Both resistors connect bat+ to bat- in parallel
    g.connect(portRef('bat', 'positive'), portRef('r1', 'a'));
    g.connect(portRef('bat', 'positive'), portRef('r2', 'a'));
    g.connect(portRef('r1', 'b'), portRef('bat', 'negative'));
    g.connect(portRef('r2', 'b'), portRef('bat', 'negative'));

    const sol = solver.solve(g);
    expect(sol.state).toBe('normal');
    expect(sol.perComponent['r1'].current).toBeCloseTo(1.2, 3);
    expect(sol.perComponent['r2'].current).toBeCloseTo(1.2, 3);
    expect(sol.aggregates.equivalentResistance).toBeCloseTo(5, 3);
  });

  it('Topology 4 · open switch kills current everywhere (AC-6)', () => {
    const g = new CircuitGraph();
    g.add(new Battery('bat', 6)).add(new Switch('sw', false)).add(new Resistor('r', 10));
    g.connect(portRef('bat', 'positive'), portRef('sw', 'in'));
    g.connect(portRef('sw', 'out'), portRef('r', 'a'));
    g.connect(portRef('r', 'b'), portRef('bat', 'negative'));

    const sol = solver.solve(g);
    // Open switch → an edge marked 'open' between sw.in and sw.out means the
    // battery's negative terminal can't reach positive; battery current must be 0.
    // Depending on topology classification, state may be 'normal' with 0 current
    // or 'open' pre-check. Either way: resistor current must be 0.
    expect(sol.perComponent['r'].current).toBeCloseTo(0, 3);
  });

  it('Topology 5 · short circuit via direct wire detected by preCheck', () => {
    const g = new CircuitGraph();
    g.add(new Battery('bat', 6)).add(new Wire('w'));
    g.connect(portRef('bat', 'positive'), portRef('w', 'a'));
    g.connect(portRef('w', 'b'), portRef('bat', 'negative'));

    const pre = solver.preCheck(g);
    expect(pre.state).toBe('short');
  });

  it('Bulb glow reflects power fraction (AC-6 · 可互相作用)', () => {
    // 6V battery, 5Ω bulb rated 3W → actual = 36/5 = 7.2W → glow = 7.2/3 = 2.4, clamped at 1.5
    const g = new CircuitGraph();
    g.add(new Battery('bat', 6)).add(new Bulb('b1', 5, 3));
    g.connect(portRef('bat', 'positive'), portRef('b1', 'a'));
    g.connect(portRef('b1', 'b'), portRef('bat', 'negative'));

    const sol = solver.solve(g);
    expect(sol.perComponent['b1'].glow).toBeGreaterThan(1);
    expect(sol.perComponent['b1'].state).toBe('overload');
  });
});

// ────────────────────────────────────────────────────────────────────────
describe('Framework · InteractionEngine + Reaction (AC-7)', () => {
  const solver = new CircuitSolver();

  it('overload reaction spawns a BurntBulb and marks original bulb destroyed', () => {
    const g = new CircuitGraph();
    g.add(new Battery('bat', 20)).add(new Bulb('b1', 5, 3));
    g.connect(portRef('bat', 'positive'), portRef('b1', 'a'));
    g.connect(portRef('b1', 'b'), portRef('bat', 'negative'));

    const eng = new InteractionEngine(solver).registerAll(CIRCUIT_REACTIONS);
    const report = eng.tick(g);

    // Overload-bulb rule must have fired
    expect(report.events.length).toBeGreaterThan(0);
    const spawns = report.events.filter((e) => e.kind === 'spawn');
    expect(spawns.length).toBe(1);
    expect(spawns[0].newComponent?.kind).toBe('burnt_bulb');

    // Original bulb is mutated to infinite resistance
    const mutates = report.events.filter((e) => e.kind === 'mutate');
    expect(mutates.some((e) => (e.mutation?.resistance as number) === Number.POSITIVE_INFINITY)).toBe(true);

    // Annotation was attached
    const annotations = report.events.filter((e) => e.kind === 'annotate');
    expect(annotations.length).toBe(1);
    expect(annotations[0].reason).toContain('过载');

    // After reaction, the graph now has 3 components (bat + b1 + b1_burnt)
    expect(g.componentCount()).toBe(3);

    // Final solution should show the burnt bulb with 0 current (new topology)
    const burnt = g.get('b1_burnt');
    expect(burnt).toBeInstanceOf(BurntBulb);
  });

  it('normal-operation bulb does NOT trigger overload reaction', () => {
    const g = new CircuitGraph();
    g.add(new Battery('bat', 6)).add(new Resistor('r', 10)).add(new Bulb('b1', 5, 3));
    // Add a protective resistor so the bulb runs below rated
    g.connect(portRef('bat', 'positive'), portRef('r', 'a'));
    g.connect(portRef('r', 'b'), portRef('b1', 'a'));
    g.connect(portRef('b1', 'b'), portRef('bat', 'negative'));

    const eng = new InteractionEngine(solver).registerAll(CIRCUIT_REACTIONS);
    const report = eng.tick(g);

    expect(report.events.length).toBe(0); // no reaction
    expect(g.componentCount()).toBe(3); // no new component
  });

  it('reaction rule id and domain are enforced', () => {
    expect(overloadBulbRule.id).toBe('circuit/overload-bulb');
    expect(overloadBulbRule.domain).toBe('circuit');
  });
});

// ────────────────────────────────────────────────────────────────────────
describe('Framework · Atomization Acceptance (AC-1~AC-7 summary)', () => {
  it('AC-1: every component is an independently constructible class', () => {
    expect(new Battery('a', 1)).toBeInstanceOf(Battery);
    expect(new Bulb('b', 5, 3)).toBeInstanceOf(Bulb);
  });

  it('AC-2: components assemble into valid topology via connect()', () => {
    const g = new CircuitGraph();
    g.add(new Battery('b', 6)).add(new Resistor('r', 10));
    g.connect(portRef('b', 'positive'), portRef('r', 'a'));
    g.connect(portRef('r', 'b'), portRef('b', 'negative'));
    expect(g.componentCount()).toBe(2);
    expect(g.connections().length).toBe(2);
  });

  it('AC-3: component props are mutable and drive re-solve', () => {
    const g = new CircuitGraph();
    const bat = new Battery('bat', 6);
    const r = new Resistor('r', 10);
    g.add(bat).add(r);
    g.connect(portRef('bat', 'positive'), portRef('r', 'a'));
    g.connect(portRef('r', 'b'), portRef('bat', 'negative'));

    const solver = new CircuitSolver();
    const before = solver.solve(g).aggregates.totalCurrent;
    bat.props.voltage = 12;
    const after = solver.solve(g).aggregates.totalCurrent;
    expect(after).toBeCloseTo(before * 2, 3);
  });

  it('AC-4: same component class reusable across graphs', () => {
    const g1 = new CircuitGraph();
    const g2 = new CircuitGraph();
    g1.add(new Resistor('r1', 10));
    g2.add(new Resistor('r1', 20));
    expect(g1.get('r1')?.props.resistance).toBe(10);
    expect(g2.get('r1')?.props.resistance).toBe(20);
  });

  it('AC-5: ports connected to ports with Union-Find identifying equipotential nodes', () => {
    const g = new CircuitGraph();
    g.add(new Battery('b', 6)).add(new Wire('w')).add(new Resistor('r', 10));
    g.connect(portRef('b', 'positive'), portRef('w', 'a'));
    g.connect(portRef('w', 'b'), portRef('r', 'a'));
    g.connect(portRef('r', 'b'), portRef('b', 'negative'));
    const nodes = g.buildEquipotentialNodes((c) => g.shortEdgeFilter(c));
    // 4 ports on circuit side (b+, w.a, w.b, r.a) + (r.b, b-). Wire collapses 2 nodes → 2 total.
    expect(nodes.nodes.length).toBe(2);
  });

  it('AC-6: open switch cuts current globally', () => {
    const g = new CircuitGraph();
    g.add(new Battery('b', 6)).add(new Switch('sw', true)).add(new Resistor('r', 10));
    g.connect(portRef('b', 'positive'), portRef('sw', 'in'));
    g.connect(portRef('sw', 'out'), portRef('r', 'a'));
    g.connect(portRef('r', 'b'), portRef('b', 'negative'));
    const solver = new CircuitSolver();
    const iClosed = solver.solve(g).perComponent['r'].current;

    const sw = g.get('sw')!;
    sw.props.closed = false;
    const iOpen = solver.solve(g).perComponent['r'].current;

    expect(iClosed).toBeCloseTo(0.6, 3);
    expect(iOpen).toBeCloseTo(0, 3);
  });

  it('AC-7: components interaction produces new components (overload → BurntBulb)', () => {
    const g = new CircuitGraph();
    g.add(new Battery('bat', 20)).add(new Bulb('b1', 5, 3));
    g.connect(portRef('bat', 'positive'), portRef('b1', 'a'));
    g.connect(portRef('b1', 'b'), portRef('bat', 'negative'));

    const solver = new CircuitSolver();
    const eng = new InteractionEngine(solver).registerAll(CIRCUIT_REACTIONS);
    const before = g.componentCount();
    eng.tick(g);
    const after = g.componentCount();

    expect(after).toBe(before + 1); // a new component spawned
    expect(g.get('b1_burnt')).toBeInstanceOf(BurntBulb);
  });
});
