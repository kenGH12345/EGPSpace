/**
 * Modified Nodal Analysis (MNA) Solver — circuit domain.
 *
 * Implements IDomainSolver for pure-resistor DC circuits with ideal voltage
 * sources. Self-contained Gaussian elimination with partial pivoting — no
 * external math dependency (project constraint: no new npm packages).
 *
 * Algorithm:
 *   1. buildEquipotentialNodes() via Union-Find (wires + closed switches + connections
 *      all collapse to single nodes).
 *   2. Pick ground node (the one with most members, for conditioning).
 *   3. For each resistor: stamp G[a][a]+=1/R, G[b][b]+=1/R, G[a][b]-=1/R, G[b][a]-=1/R.
 *   4. For each voltage source: add a new row/col (auxiliary current variable).
 *      Row enforces V(a) - V(b) = voltage.
 *   5. preCheck: detect short (voltage source with both terminals on same node)
 *      and open (voltage source terminal disconnected from the rest) BEFORE solve.
 *   6. Gauss-Jordan with partial pivoting.
 *   7. Interpret solution → per-component {current, voltage, power, ...}.
 */

import {
  portKey,
  SolverError,
  type IDomainSolver,
  type PreCheckResult,
  type SolveResult,
  type SolveState,
  type ComponentDomain,
} from '../../index';
import type { CircuitGraph } from './circuit-graph';
import type { CircuitStampEntry } from './stamp';

export interface CircuitPerComponent extends Record<string, unknown> {
  current: number;
  voltage: number;
  power: number;
  /** Convenience: for Bulb, fraction of rated power (0..1+) */
  glow?: number;
  /** 'short'|'open'|'normal' per-component state */
  state?: 'normal' | 'short' | 'open' | 'overload';
}

export interface CircuitSolveResult extends SolveResult<CircuitPerComponent> {
  perComponent: Record<string, CircuitPerComponent>;
  aggregates: {
    totalCurrent: number;
    totalPower: number;
    equivalentResistance: number;
    nodeCount: number;
    voltageSourceCount: number;
  };
  /** node id → solved voltage (V0 = ground = 0) */
  nodeVoltages: Record<string, number>;
}

export class CircuitSolver implements IDomainSolver<CircuitGraph, CircuitSolveResult> {
  readonly domain: ComponentDomain = 'circuit';

  preCheck(graph: CircuitGraph): PreCheckResult {
    const nodes = graph.buildEquipotentialNodes((c) => graph.shortEdgeFilter(c));
    const stamps = graph.collectStamps();
    const vSources = stamps.filter((s) => s.entry.kind === 'voltageSource');

    if (vSources.length === 0) {
      return { state: 'open', reason: 'no voltage source present' };
    }

    for (const vs of vSources) {
      if (vs.entry.kind !== 'voltageSource') continue;
      const np = nodes.portToNode.get(portKey({ componentId: vs.componentId, portName: vs.entry.fromPort }));
      const nn = nodes.portToNode.get(portKey({ componentId: vs.componentId, portName: vs.entry.toPort }));
      if (!np || !nn) {
        return { state: 'invalid', reason: `voltage source "${vs.componentId}" has a floating terminal` };
      }
      if (np === nn) {
        return { state: 'short', reason: `voltage source "${vs.componentId}" terminals are shorted together` };
      }
    }

    return { state: 'normal' };
  }

  solve(graph: CircuitGraph): CircuitSolveResult {
    const pre = this.preCheck(graph);
    if (pre.state !== 'normal') {
      return this._degenerateResult(graph, pre.state, pre.reason);
    }

    const nodeMap = graph.buildEquipotentialNodes((c) => graph.shortEdgeFilter(c));
    const stamps = graph.collectStamps();
    const resistors = stamps.filter(
      (s): s is { componentId: string; entry: Extract<CircuitStampEntry, { kind: 'resistor' }> } =>
        s.entry.kind === 'resistor',
    );
    const vSources = stamps.filter(
      (s): s is { componentId: string; entry: Extract<CircuitStampEntry, { kind: 'voltageSource' }> } =>
        s.entry.kind === 'voltageSource',
    );

    // Count how many resistors actually contribute (finite positive resistance).
    // Zero usable resistors → circuit is open (e.g. all bulbs burnt out): no current flows.
    const activeResistors = resistors.filter(
      (r) => Number.isFinite(r.entry.resistance) && r.entry.resistance > 0,
    );
    if (activeResistors.length === 0) {
      return this._degenerateResult(graph, 'open', 'no active resistive load (all paths broken)');
    }

    // Pick ground node: the node with the most member ports (best conditioning)
    let groundNode = nodeMap.nodes[0];
    let bestMembers = 0;
    for (const n of nodeMap.nodes) {
      const m = nodeMap.nodeMembers.get(n)?.length ?? 0;
      if (m > bestMembers) {
        bestMembers = m;
        groundNode = n;
      }
    }

    // Node ordering: all non-ground nodes + one aux variable per voltage source.
    const nonGroundNodes = nodeMap.nodes.filter((n) => n !== groundNode);
    const nodeIndex = new Map<string, number>();
    nonGroundNodes.forEach((n, i) => nodeIndex.set(n, i));
    const N = nonGroundNodes.length;
    const M = vSources.length;
    const size = N + M;

    // Build augmented matrix [A | b] of size (size) × (size+1)
    const A: number[][] = Array.from({ length: size }, () => Array(size + 1).fill(0));

    // Stamp resistors
    for (const r of resistors) {
      const { resistance, fromPort, toPort } = r.entry;
      // Skip if resistance is not a valid finite positive value.
      // Infinity → essentially open circuit for that edge (e.g. burnt bulb after mutation).
      if (!(resistance > 0) || !Number.isFinite(resistance)) continue;
      const g = 1 / resistance;
      const na = nodeMap.portToNode.get(portKey({ componentId: r.componentId, portName: fromPort }))!;
      const nb = nodeMap.portToNode.get(portKey({ componentId: r.componentId, portName: toPort }))!;
      const ia = nodeIndex.get(na);
      const ib = nodeIndex.get(nb);
      if (ia !== undefined) A[ia][ia] += g;
      if (ib !== undefined) A[ib][ib] += g;
      if (ia !== undefined && ib !== undefined) {
        A[ia][ib] -= g;
        A[ib][ia] -= g;
      }
    }

    // Stamp voltage sources (MNA aux rows/cols)
    vSources.forEach((vs, k) => {
      const { voltage, fromPort, toPort } = vs.entry;
      const na = nodeMap.portToNode.get(portKey({ componentId: vs.componentId, portName: fromPort }))!;
      const nb = nodeMap.portToNode.get(portKey({ componentId: vs.componentId, portName: toPort }))!;
      const ia = nodeIndex.get(na);
      const ib = nodeIndex.get(nb);
      const row = N + k;

      // Aux column coefficients: source current flows in at + terminal, out at -
      if (ia !== undefined) {
        A[ia][row] += 1;
        A[row][ia] += 1;
      }
      if (ib !== undefined) {
        A[ib][row] -= 1;
        A[row][ib] -= 1;
      }

      // RHS: V(+) - V(-) = voltage
      A[row][size] = voltage;
    });

    // Solve Ax = b via Gauss-Jordan with partial pivoting
    const x = gaussJordan(A, size);

    // Build nodeVoltages record
    const nodeVoltages: Record<string, number> = { [groundNode]: 0 };
    nonGroundNodes.forEach((n, i) => {
      nodeVoltages[n] = x[i];
    });

    // Voltage source currents (aux vars)
    const vSourceCurrents = new Map<string, number>();
    vSources.forEach((vs, k) => {
      vSourceCurrents.set(vs.componentId, x[N + k]);
    });

    // Interpret per-component
    const perComponent: Record<string, CircuitPerComponent> = {};
    const components = graph.components();
    for (const c of components) {
      perComponent[c.id] = this._interpretComponent(c, nodeMap, nodeVoltages, vSourceCurrents);
    }

    // Aggregates
    let totalCurrent = 0;
    for (const vs of vSources) {
      totalCurrent += Math.abs(vSourceCurrents.get(vs.componentId) ?? 0);
    }
    const totalPower = Object.values(perComponent).reduce((acc, c) => acc + (c.power ?? 0), 0);
    const batteryVoltage = vSources.reduce((acc, v) => acc + v.entry.voltage, 0);
    const equivalentResistance = totalCurrent > 1e-9 ? batteryVoltage / totalCurrent : Infinity;

    return {
      state: 'normal',
      explanation: `Solved ${nodeMap.nodes.length} nodes, ${M} voltage source(s). Total current ${totalCurrent.toFixed(3)} A.`,
      perComponent,
      nodeVoltages,
      aggregates: {
        totalCurrent,
        totalPower,
        equivalentResistance,
        nodeCount: nodeMap.nodes.length,
        voltageSourceCount: M,
      },
    };
  }

  // ─── Helpers ────────────────────────────────────────────────────────────

  private _interpretComponent(
    c: { id: string; kind: string; props: Record<string, unknown>; toStamp: () => { entries: CircuitStampEntry[] } },
    nodeMap: ReturnType<CircuitGraph['buildEquipotentialNodes']>,
    nodeVoltages: Record<string, number>,
    vSourceCurrents: Map<string, number>,
  ): CircuitPerComponent {
    const entries = c.toStamp().entries;
    const first = entries[0];
    if (!first) return { current: 0, voltage: 0, power: 0, state: 'open' };

    const na = nodeMap.portToNode.get(portKey({ componentId: c.id, portName: first.fromPort }));
    const nb = nodeMap.portToNode.get(portKey({ componentId: c.id, portName: first.toPort }));
    const Va = na !== undefined ? (nodeVoltages[na] ?? 0) : 0;
    const Vb = nb !== undefined ? (nodeVoltages[nb] ?? 0) : 0;
    const voltage = Va - Vb;

    if (first.kind === 'resistor') {
      const R = first.resistance;
      // Destroyed/infinite-resistance component: treat as open (no current, zero power).
      if (!Number.isFinite(R) || R <= 0) {
        const result: CircuitPerComponent = { current: 0, voltage, power: 0, state: 'open' };
        if (c.kind === 'bulb') result.glow = 0;
        return result;
      }
      const current = voltage / R;
      const power = voltage * current;
      const result: CircuitPerComponent = { current, voltage, power, state: 'normal' };
      // Bulb glow: fraction of rated power (capped displayed at 1.5 to signal overload)
      if (c.kind === 'bulb' && typeof c.props.ratedPower === 'number') {
        const rated = c.props.ratedPower as number;
        result.glow = rated > 0 ? Math.max(0, Math.min(1.5, power / rated)) : 0;
        if (power > rated * 1.5) result.state = 'overload';
      }
      return result;
    }

    if (first.kind === 'voltageSource') {
      const current = vSourceCurrents.get(c.id) ?? 0;
      const power = voltage * current;
      return { current, voltage, power, state: 'normal' };
    }

    if (first.kind === 'ammeter') {
      // Ammeter is a short; current derived from KCL is not directly produced by MNA.
      // Simplified: sum currents of all resistors on one of its node sides (future work).
      return { current: 0, voltage: 0, power: 0, state: 'normal' };
    }

    if (first.kind === 'short') {
      return { current: 0, voltage: 0, power: 0, state: 'normal' };
    }

    // open (switch-open, voltmeter, burnt_bulb): voltage is the potential difference
    return { current: 0, voltage, power: 0, state: 'open' };
  }

  private _degenerateResult(graph: CircuitGraph, state: SolveState, reason?: string): CircuitSolveResult {
    const perComponent: Record<string, CircuitPerComponent> = {};
    for (const c of graph.components()) {
      perComponent[c.id] = {
        current: 0,
        voltage: 0,
        power: 0,
        state: state === 'short' ? 'short' : state === 'open' ? 'open' : 'normal',
      };
    }
    return {
      state,
      explanation: reason ?? `Circuit is in ${state} state.`,
      perComponent,
      nodeVoltages: {},
      aggregates: {
        totalCurrent: state === 'short' ? Infinity : 0,
        totalPower: state === 'short' ? Infinity : 0,
        equivalentResistance: state === 'short' ? 0 : Infinity,
        nodeCount: 0,
        voltageSourceCount: 0,
      },
    };
  }
}

/**
 * Gauss-Jordan elimination with partial pivoting.
 * A is an (n × n+1) augmented matrix; mutated in place. Returns solution x (length n).
 * Throws SolverError('singular') if matrix is rank-deficient.
 */
export function gaussJordan(A: number[][], n: number): number[] {
  for (let col = 0; col < n; col++) {
    // Partial pivoting: find row with largest |A[row][col]| below (and at) current row
    let pivotRow = col;
    let pivotAbs = Math.abs(A[col][col]);
    for (let r = col + 1; r < n; r++) {
      const v = Math.abs(A[r][col]);
      if (v > pivotAbs) {
        pivotAbs = v;
        pivotRow = r;
      }
    }
    if (pivotAbs < 1e-12) {
      throw new SolverError(`MNA matrix singular at column ${col}`, 'singular');
    }
    if (pivotRow !== col) {
      [A[col], A[pivotRow]] = [A[pivotRow], A[col]];
    }

    // Scale pivot row so pivot = 1
    const pivot = A[col][col];
    for (let j = col; j <= n; j++) A[col][j] /= pivot;

    // Eliminate other rows
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = A[r][col];
      if (factor === 0) continue;
      for (let j = col; j <= n; j++) A[r][j] -= factor * A[col][j];
    }
  }

  const x = new Array<number>(n);
  for (let i = 0; i < n; i++) x[i] = A[i][n];
  return x;
}
