/**
 * ChemistryReactionEngine — dual-path chemistry engine (v2.0).
 *
 * v1 path (legacy, `params: Record<string, number>`):
 *   Falls back to a thin closed-form compute suitable for simple scenarios.
 *   Exposed for backwards compatibility with any existing templates.
 *
 * v2 path (graph-based):
 *   When the caller supplies `params.graph` (a serialised ChemistrySpec),
 *   the engine:
 *     1. Assembles the graph via ChemistryAssembler
 *     2. Runs StoichiometrySolver to snapshot moles and identify reaction candidates
 *     3. Feeds the solver into InteractionEngine + CHEMISTRY_REACTIONS for iteration
 *     4. Returns {perComponent, events, components} in the same shape CircuitEngine v2 uses
 *
 * Dual-path dispatch uses a three-way type guard (object + Array + non-empty)
 * identical to CircuitEngine's — zero-config, zero-misroute.
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

import {
  ChemistryAssembler,
  StoichiometrySolver,
  CHEMISTRY_REACTIONS,
  type ChemistrySpec,
} from '@/lib/framework/domains/chemistry';
import { InteractionEngine } from '@/lib/framework';

interface V2Payload {
  graph: ChemistrySpec;
  overrides?: Record<string, Record<string, unknown>>;
  /** When false, skip InteractionEngine and only return the solver snapshot. */
  reactions?: boolean;
  /** Max iterations for the fixed-point loop; defaults to 8. */
  maxIter?: number;
}

function isV2GraphPayload(params: unknown): params is V2Payload {
  if (!params || typeof params !== 'object') return false;
  const p = params as { graph?: unknown };
  if (!p.graph || typeof p.graph !== 'object') return false;
  const g = p.graph as { components?: unknown };
  return Array.isArray(g.components) && g.components.length > 0;
}

export class ChemistryReactionEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'chemistry/reaction',
    subject: 'chemistry',
    displayName: '化学反应系统 (v2 组件化)',
    description: '统一化学反应引擎：元件装配 → 化学计量求解 → 反应事件产生',
    version: '2.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['beaker', 'text'],
  };

  validate(_params: Record<string, number>): ValidationResult {
    return { valid: true, errors: [] };
  }

  compute(params: Record<string, number>): ComputationResult {
    // The interface pins params to Record<string, number>, but v2 callers pass
    // a richer object via postMessage (JSON-safe). We accept both.
    try {
      if (isV2GraphPayload(params)) {
        return this._computeV2(params);
      }
      return this._computeV1(params);
    } catch (err) {
      return {
        values: {},
        state: 'error',
        explanation: `ChemistryReactionEngine failed: ${(err as Error).message}`,
        trace: { error: { formula: 'try', inputs: {}, result: 0 } },
      };
    }
  }

  private _computeV2(payload: V2Payload): ComputationResult {
    // Apply overrides onto a shallow-cloned spec before assembly
    const spec: ChemistrySpec = {
      ...payload.graph,
      components: payload.graph.components.map((c) => {
        const ov = payload.overrides?.[c.id];
        if (!ov) return c;
        return { ...c, props: { ...c.props, ...ov } };
      }),
    };

    const assembler = new ChemistryAssembler();
    const graph = assembler.assembleChemistry(spec);

    const solver = new StoichiometrySolver();
    const useReactions = payload.reactions !== false;
    const maxIter = payload.maxIter ?? 8;

    // Detect heat sources
    const isHeating = spec.components.some(
      (c) => c.kind === 'alcohol-lamp' && c.props.isLit === true
    );
    const hasIgniter = spec.components.some((c) => c.kind === 'igniter');

    let perComponentOut: Record<string, Record<string, number | string | boolean>> = {};
    let events: ReturnType<InteractionEngine<typeof graph, ReturnType<typeof solver.solve>>['tick']>['events'] = [];
    let iterations = 1;
    let unstable = false;

    if (useReactions) {
      // Pass heating/igniter context to rules if they need it (currently via solver or engine meta, here we can attach to graph)
      (graph as any).isHeating = isHeating;
      (graph as any).hasIgniter = hasIgniter;

      const engine = new InteractionEngine(solver, maxIter).registerAll(CHEMISTRY_REACTIONS);
      const tick = engine.tick(graph);
      perComponentOut = this._formatPerComponent(tick.finalSolution.perComponent);
      events = tick.events;
      iterations = tick.iterations;
      unstable = tick.unstable;
    } else {
      const sol = solver.solve(graph);
      perComponentOut = this._formatPerComponent(sol.perComponent);
    }

    const spawnCount = events.filter((e) => e.kind === 'spawn').length;
    const removeCount = events.filter((e) => e.kind === 'remove').length;
    const mutateCount = events.filter((e) => e.kind === 'mutate').length;

    return {
      values: {
        perComponent: perComponentOut,
        events: events.map((e) => ({
          kind: e.kind,
          sourceRuleId: e.sourceRuleId,
          reason: e.reason,
          targetId: e.targetId ?? '',
          newComponentId: e.newComponent?.id ?? '',
          newComponentKind: e.newComponent?.kind ?? '',
        })),
        components: graph.toDTO().components.map((c) => ({
          id: c.id,
          kind: c.kind,
          props: c.props,
        })),
        spawnCount,
        removeCount,
        mutateCount,
        iterations,
        unstable: unstable ? 1 : 0,
      },
      state: unstable ? 'warning' : 'stable',
      explanation: `${events.length} event(s) applied (spawn=${spawnCount}, remove=${removeCount}, mutate=${mutateCount}) over ${iterations} iter(s)`,
      trace: {
        events: { formula: 'graph × rules × solver', inputs: { componentCount: graph.componentCount() }, result: events.length },
      },
    };
  }

  private _computeV1(params: Record<string, number>): ComputationResult {
    // Minimal numeric fallback: if caller sends plain {acidMoles, baseMoles},
    // return neutralization summary using closed-form stoichiometry.
    const acid = Number(params.acidMoles ?? 0);
    const base = Number(params.baseMoles ?? 0);
    const extent = Math.min(acid, base / 2);
    return {
      values: {
        reactionExtent: extent,
        acidRemaining: Math.max(0, acid - extent),
        baseRemaining: Math.max(0, base - 2 * extent),
      },
      state: 'stable',
      explanation: `v1 legacy path · extent=${extent.toFixed(4)}`,
      trace: { extent: { formula: 'min(acid, base/2)', inputs: { acid, base }, result: extent } },
    };
  }

  private _formatPerComponent(
    per: Record<string, { moles: number; phase: string; state: string; solidState?: string }>,
  ): Record<string, Record<string, number | string | boolean>> {
    const out: Record<string, Record<string, number | string | boolean>> = {};
    for (const [id, v] of Object.entries(per)) {
      out[id] = {
        moles: v.moles,
        phase: v.phase,
        state: v.state,
        ...(v.solidState ? { solidState: v.solidState } : {}),
      };
    }
    return out;
  }
}

const chemistryReactionEngine = new ChemistryReactionEngine();
export default chemistryReactionEngine;
