/**
 * Physics: Circuit Engine v2.0 — dual-path: legacy formula OR graph-based solver.
 *
 * v1.1 path (legacy, unchanged):
 *   compute({voltage, r1, r2, topology}) → closed-form Ohm's-Law result
 *
 * v2 path (new, graph-based):
 *   compute({graph, reactions?, overrides?}) → delegates to:
 *     CircuitAssembler → CircuitSolver → InteractionEngine
 *   Returns per-component current/voltage/power + reaction events.
 *
 * Dispatch: `_isV2GraphPayload(params)` checks 3 conditions simultaneously:
 *   (a) params is object
 *   (b) params.graph is object
 *   (c) params.graph.components is a non-empty array
 * All three must hold to take the v2 path. Otherwise falls through to v1.1.
 *
 * Failure of v2 path is caught and returned as a structured error value; it does
 * NOT fall through to v1.1 (because a caller passing `graph` explicitly wants the
 * graph result; silent fallback would hide bugs).
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

// Framework v2 imports (side-effect registers circuit component factories)
import {
  circuitAssembler,
  CircuitSolver,
  CIRCUIT_REACTIONS,
  type CircuitGraph,
  type CircuitSolveResult,
} from '@/lib/framework/domains/circuit';
import {
  InteractionEngine,
  AssemblyBuildError,
  SolverError,
  isAssemblySpec,
  type AssemblySpec,
  type ReactionEvent,
} from '@/lib/framework';
import type { DomainGraphDTO } from '@/lib/framework';

/** Shape of a v2 graph payload as received from the template. */
interface V2GraphPayload {
  /** Either a full AssemblySpec literal, or a DomainGraphDTO. */
  graph: AssemblySpec<'circuit'> | DomainGraphDTO;
  /** Optional per-component property overrides keyed by component id. */
  overrides?: Record<string, Record<string, unknown>>;
  /** Whether to enable reaction rules (default true). */
  reactions?: boolean;
}

export class CircuitEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'physics/circuit',
    subject: 'physics',
    displayName: '电路基础',
    description: 'Ohm\'s law + MNA-based circuit solver (v2 graph path) with legacy R_eq formula (v1.1)',
    version: '2.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['rect', 'line'],
  };

  validate(params: Record<string, number>): ValidationResult {
    // v2 path: defer validation to Assembler (runs during compute)
    if (this._isV2GraphPayload(params)) {
      return { valid: true, errors: [] };
    }
    // v1.1 legacy validation
    return this._validateLegacy(params);
  }

  compute(params: Record<string, number>): ComputationResult {
    if (this._isV2GraphPayload(params)) {
      return this._computeV2(params as unknown as V2GraphPayload);
    }
    return this._computeLegacy(params);
  }

  // ══════════════════════════════════════════════════════════════════════
  // Dual-path dispatch
  // ══════════════════════════════════════════════════════════════════════

  /**
   * Three-point type guard for v2 dispatch. Returns true iff:
   *   (a) params is a non-null object
   *   (b) params.graph is a non-null object
   *   (c) params.graph.components is a non-empty array
   *
   * Being conservative here matters: legacy v1.1 templates send `{voltage, r1, r2}`
   * without any `graph` key, so false positives are impossible in normal use.
   */
  private _isV2GraphPayload(params: unknown): params is V2GraphPayload {
    if (!params || typeof params !== 'object') return false;
    const p = params as Record<string, unknown>;
    const g = p.graph;
    if (!g || typeof g !== 'object') return false;
    const comps = (g as Record<string, unknown>).components;
    return Array.isArray(comps) && comps.length > 0;
  }

  // ══════════════════════════════════════════════════════════════════════
  // v2 graph path
  // ══════════════════════════════════════════════════════════════════════

  private _computeV2(payload: V2GraphPayload): ComputationResult {
    try {
      // 1. Normalise payload: accept AssemblySpec OR DomainGraphDTO
      //    DomainGraphDTO looks similar but may lack metadata — Assembler handles both.
      const spec = this._normaliseToSpec(payload.graph);

      // 2. Apply per-component overrides (for live slider twiddling)
      if (payload.overrides) {
        for (const comp of spec.components) {
          const patch = payload.overrides[comp.id];
          if (patch) comp.props = { ...comp.props, ...patch };
        }
      }

      // 3. Assemble → CircuitGraph
      const graph: CircuitGraph = circuitAssembler.assembleCircuit(spec);

      // 4. Solve (with optional interactions)
      const solver = new CircuitSolver();
      const useReactions = payload.reactions !== false; // default true
      let solution: CircuitSolveResult;
      const events: ReactionEvent[] = [];

      if (useReactions) {
        const interactions = new InteractionEngine<CircuitGraph, CircuitSolveResult>(solver);
        interactions.registerAll(CIRCUIT_REACTIONS);
        const tick = interactions.tick(graph);
        solution = tick.finalSolution;
        events.push(...tick.events);
      } else {
        solution = solver.solve(graph);
      }

      // 5. Build ComputationResult
      return this._formatV2Result(solution, events, graph);
    } catch (err) {
      return this._v2ErrorResult(err);
    }
  }

  private _normaliseToSpec(
    input: AssemblySpec<'circuit'> | DomainGraphDTO,
  ): AssemblySpec<'circuit'> {
    if (isAssemblySpec(input)) {
      return input as AssemblySpec<'circuit'>;
    }
    // Treat as DomainGraphDTO — reshape to spec (anchor intentionally dropped per D-5)
    const dto = input as DomainGraphDTO;
    return {
      domain: 'circuit',
      components: dto.components.map((c) => ({
        id: c.id,
        kind: c.kind,
        props: c.props,
      })),
      connections: dto.connections.map((c) => ({
        from: c.from,
        to: c.to,
        kind: c.kind,
      })),
    };
  }

  private _formatV2Result(
    solution: CircuitSolveResult,
    events: ReactionEvent[],
    graph: CircuitGraph,
  ): ComputationResult {
    // Convert per-component record into a plain object with JSON-safe values
    const perComponent: Record<string, Record<string, number | string>> = {};
    for (const [id, vals] of Object.entries(solution.perComponent)) {
      perComponent[id] = {
        current: vals.current,
        voltage: vals.voltage,
        power: vals.power,
        state: vals.state ?? 'normal',
        ...(typeof vals.glow === 'number' ? { glow: vals.glow } : {}),
      };
    }

    // Reduce events to JSON-safe shape
    const eventRecords = events.map((e) => ({
      kind: e.kind,
      sourceRuleId: e.sourceRuleId,
      targetId: e.targetId ?? null,
      reason: e.reason,
    }));

    // Overall state label
    const burntCount = graph.components().filter((c) => c.kind === 'burnt_bulb').length;
    const overallState = solution.state === 'normal'
      ? (burntCount > 0 ? 'reaction_occurred' : 'normal')
      : solution.state;

    return {
      values: {
        version: 'v2',
        perComponent: perComponent as unknown as object,
        events: eventRecords as unknown as object,
        componentCount: graph.componentCount(),
        burntCount,
      },
      state: overallState,
      explanation: solution.explanation ?? '',
    };
  }

  private _v2ErrorResult(err: unknown): ComputationResult {
    let code = 'compute_exception';
    let message = err instanceof Error ? err.message : String(err);
    if (err instanceof AssemblyBuildError) code = 'assembly_build_failed';
    else if (err instanceof SolverError) code = 'solver_failed';

    return {
      values: {
        version: 'v2',
        error: true,
        errorCode: code,
        errorMessage: message,
      },
      state: 'error',
      explanation: `v2 compute failed (${code}): ${message}`,
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // v1.1 legacy path (VERBATIM — do not alter without test update)
  // ══════════════════════════════════════════════════════════════════════

  private _validateLegacy(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const voltage = params.voltage ?? 12;
    const r1 = params.r1 ?? params.resistance ?? 10;
    const r2 = params.r2 ?? 10;

    if (voltage <= 0) errors.push({ field: 'voltage', message: '电压必须为正数', severity: 'error' });
    if (r1 <= 0) errors.push({ field: 'r1', message: 'R1 必须大于 0（零电阻会导致短路）', severity: 'error' });
    if (r2 < 0) errors.push({ field: 'r2', message: 'R2 不能为负数', severity: 'error' });

    if (voltage > 220) errors.push({ field: 'voltage', message: '电压超过常见实验范围（>220V）', severity: 'warning' });

    return { valid: errors.length === 0, errors };
  }

  private _computeLegacy(params: Record<string, number>): ComputationResult {
    const voltage = params.voltage ?? 12;
    const r1 = params.r1 ?? params.resistance ?? 10;
    const r2 = params.r2 ?? 10;
    const topology = params.topology;
    const isLegacySingle = topology === undefined && params.r2 === undefined;

    let rEq: number;
    let topologyLabel: string;
    if (isLegacySingle) {
      rEq = r1;
      topologyLabel = 'single';
    } else if (topology === 1) {
      rEq = r1 > 0 && r2 > 0 ? (r1 * r2) / (r1 + r2) : Math.min(r1, r2);
      topologyLabel = 'parallel';
    } else {
      rEq = r1 + r2;
      topologyLabel = 'series';
    }

    if (rEq === 0) {
      return {
        values: {
          voltage, r1, r2, rEq: 0,
          current: Infinity, power: Infinity,
          currentR1: Infinity, currentR2: Infinity,
          voltageR1: 0, voltageR2: 0,
          topology: topologyLabel,
          badgeKind: 'danger',
          badgeText: '短路警告',
          bulbGlow: 0,
        },
        state: 'shortCircuit',
        explanation: '等效电阻为零，电路短路！电流趋于无穷大。',
      };
    }

    const current = voltage / rEq;
    const power = (voltage * voltage) / rEq;

    let currentR1: number, currentR2: number, voltageR1: number, voltageR2: number;
    if (topologyLabel === 'parallel') {
      voltageR1 = voltage;
      voltageR2 = voltage;
      currentR1 = voltage / r1;
      currentR2 = r2 > 0 ? voltage / r2 : 0;
    } else if (topologyLabel === 'series') {
      currentR1 = current;
      currentR2 = current;
      voltageR1 = current * r1;
      voltageR2 = current * r2;
    } else {
      currentR1 = current;
      currentR2 = 0;
      voltageR1 = voltage;
      voltageR2 = 0;
    }

    const bulbGlow = Math.max(0, Math.min(1, power / 20));
    const stateText =
      topologyLabel === 'parallel' ? '并联电路' :
      topologyLabel === 'series' ? '串联电路' : '单电阻';
    const badgeKind: 'success' | 'info' | 'warning' =
      power > 10 ? 'warning' : power > 0.5 ? 'success' : 'info';
    const badgeText = `${stateText} · 电流 ${current.toFixed(3)}A`;

    return {
      values: {
        voltage,
        r1,
        r2: isLegacySingle ? 0 : r2,
        rEq,
        resistance: rEq,
        current,
        power,
        currentR1,
        currentR2,
        voltageR1,
        voltageR2,
        topology: topologyLabel,
        bulbGlow,
        stateText,
        badgeKind,
        badgeText,
      },
      state: topologyLabel,
      explanation: `${stateText}：U = ${voltage.toFixed(1)}V，R_eq = ${rEq.toFixed(2)}Ω，I = ${current.toFixed(3)}A，P = ${power.toFixed(2)}W。`,
    };
  }
}

const circuitEngine = new CircuitEngine();
export default circuitEngine;
