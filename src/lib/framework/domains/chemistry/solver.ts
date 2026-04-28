/**
 * StoichiometrySolver — chemistry's IDomainSolver implementation.
 *
 * Scope (intentionally narrow):
 *   1. Walk every Flask in the graph
 *   2. Compare its contents against the reaction registry (chemistry "pattern library")
 *   3. For each matched reaction pattern, identify the limiting reagent and compute `extent`
 *   4. Fill `perComponent[id]` with {moles, phase, state} for UI and reaction rules
 *   5. Return `reactions` — a list of (ruleId, flaskId, reactantIds, limitingReagentId, extent)
 *      that InteractionEngine's rules will consume
 *
 * Out of scope:
 *   - Equilibrium constants (Kb, Kw) — reactions are treated as unidirectional and instant
 *   - Kinetic rates — no time step; solver is a one-shot snapshot
 *   - Mass transport across flasks — each flask is an independent subsystem
 */

import type { IDomainSolver, SolveResult, PreCheckResult } from '../../index';
import type { ChemistryComponent, ChemistryPhase, Reagent, Solid } from './components';
import { ChemistryGraph } from './chemistry-graph';
import { REACTION_REGISTRY, type ReactionFormula } from './reactions/registry';

/** State of a single chemistry component as seen by the solver. */
export type ChemistryComponentState = 'normal' | 'reacting' | 'exhausted';

export interface ChemistryPerComponent {
  moles: number;
  phase: ChemistryPhase;
  state: ChemistryComponentState;
  /** Only present for Solid; mirrors Solid.state. */
  solidState?: 'intact' | 'rusting' | 'dissolved';
}

/**
 * A concrete reaction opportunity in a specific flask. Reaction rules consume this
 * to decide which spawn/remove/mutate events to emit.
 */
export interface ReactionCandidate {
  ruleId: string;
  flaskId: string;
  /** Component ids participating as reactants (excluding products which don't exist yet). */
  reactantIds: string[];
  /** The reactant that runs out first. */
  limitingReagentId: string;
  /** Extent of reaction in mol (= moles of the limiting reagent divided by its stoichiometric coefficient). */
  extent: number;
}

export interface ChemistrySolveResult extends SolveResult<ChemistryPerComponent> {
  reactions: ReactionCandidate[];
}

/**
 * Clamp a possibly-invalid moles number to a safe non-negative value.
 * Also returns whether the value was clamped so we can mark state accordingly.
 */
function clampMoles(m: number): { moles: number; clamped: boolean } {
  if (!Number.isFinite(m) || m <= 0) return { moles: 0, clamped: true };
  return { moles: m, clamped: false };
}

/**
 * Amount of the "reactive species" the component contributes, normalised to mol.
 * - Reagent: use `props.moles` directly
 * - Solid: convert `massG` → mol using a trivial molar mass lookup (best-effort; 0 if unknown)
 * - Others: not counted
 */
function reactiveMolesOf(c: ChemistryComponent): number {
  if (c.kind === 'reagent') {
    return clampMoles((c as Reagent).props.moles).moles;
  }
  if (c.kind === 'solid') {
    const s = c as Solid;
    if (s.props.state === 'dissolved') return 0;
    const mm = MOLAR_MASS_G_PER_MOL[s.props.formula];
    if (!mm || !(mm > 0)) return 0;
    return clampMoles(s.props.massG / mm).moles;
  }
  return 0;
}

/**
 * Minimal molar-mass table for common reactants. Reactions that touch a formula
 * not in this table will see it contribute 0 reactive moles — a conservative
 * "unknown substance doesn't participate" default.
 */
const MOLAR_MASS_G_PER_MOL: Record<string, number> = {
  Fe: 55.85,
  Zn: 65.38,
  Mg: 24.31,
  Al: 26.98,
  Cu: 63.55,
  Fe2O3: 159.69,
  H2O: 18.02,
  NaCl: 58.44,
};

/**
 * Does the flask's content set satisfy a reaction's reactant pattern?
 * Returns the map reactantFormula → componentId (for each reactant of the pattern),
 * or null if the pattern is not satisfied (at least one reactant missing).
 */
function matchReactionPattern(
  contents: ChemistryComponent[],
  formula: ReactionFormula,
): Record<string, string> | null {
  const reactantMap: Record<string, string> = {};
  for (const r of formula.reactants) {
    const candidate = contents.find((c) => {
      if (c.kind === 'reagent') return (c as Reagent).props.formula === r.formula;
      if (c.kind === 'solid') {
        const s = c as Solid;
        return s.props.formula === r.formula && s.props.state !== 'dissolved';
      }
      return false;
    });
    if (!candidate) return null;
    reactantMap[r.formula] = candidate.id;
  }
  return reactantMap;
}

/**
 * Given a matched reaction pattern in a flask, identify the limiting reactant
 * and compute the reaction extent (mol of "unit reaction" that proceeds).
 */
function computeLimitingAndExtent(
  reactantMap: Record<string, string>,
  formula: ReactionFormula,
  graph: ChemistryGraph,
): { limitingReagentId: string; extent: number; reactantIds: string[] } {
  let limiting = { id: '', extentUnits: Infinity };
  const ids: string[] = [];
  for (const r of formula.reactants) {
    const compId = reactantMap[r.formula];
    ids.push(compId);
    const comp = graph.get(compId);
    if (!comp) continue;
    const moles = reactiveMolesOf(comp);
    const extentIfThisIsLimiting = moles / Math.max(1, r.coefficient);
    if (extentIfThisIsLimiting < limiting.extentUnits) {
      limiting = { id: compId, extentUnits: extentIfThisIsLimiting };
    }
  }
  // If all reactants have 0 moles, extent is 0 and the "limiting" id is meaningless
  const safeExtent = Number.isFinite(limiting.extentUnits) ? limiting.extentUnits : 0;
  return {
    limitingReagentId: limiting.id,
    extent: Math.max(0, safeExtent),
    reactantIds: ids,
  };
}

export class StoichiometrySolver
  implements IDomainSolver<ChemistryGraph, ChemistrySolveResult>
{
  readonly domain = 'chemistry' as const;

  preCheck(graph: ChemistryGraph): PreCheckResult {
    if (graph.componentCount() === 0) {
      return { state: 'normal', reason: 'empty graph' };
    }
    return { state: 'normal' };
  }

  solve(graph: ChemistryGraph): ChemistrySolveResult {
    const perComponent: Record<string, ChemistryPerComponent> = {};
    const reactions: ReactionCandidate[] = [];
    const reactingIds = new Set<string>();

    // 1. Scan every flask and match reaction patterns
    for (const flask of graph.flasks()) {
      const contents = graph.contentsOf(flask.id);
      for (const formula of Object.values(REACTION_REGISTRY)) {
        const matchMap = matchReactionPattern(contents, formula);
        if (!matchMap) continue;
        const { limitingReagentId, extent, reactantIds } = computeLimitingAndExtent(
          matchMap,
          formula,
          graph,
        );
        if (extent <= 0) continue; // no reaction without reactant mass
        reactions.push({
          ruleId: formula.id,
          flaskId: flask.id,
          reactantIds,
          limitingReagentId,
          extent,
        });
        for (const id of reactantIds) reactingIds.add(id);
      }
    }

    // 2. Fill perComponent for every component
    for (const c of graph.components()) {
      const entry = this._componentSnapshot(c, reactingIds);
      perComponent[c.id] = entry;
    }

    return {
      state: 'normal',
      perComponent,
      reactions,
      aggregates: {
        flaskCount: graph.flasks().length,
        reactionCount: reactions.length,
      },
    };
  }

  private _componentSnapshot(
    c: ChemistryComponent,
    reactingIds: Set<string>,
  ): ChemistryPerComponent {
    if (c.kind === 'reagent') {
      const r = c as Reagent;
      const { moles } = clampMoles(r.props.moles);
      return {
        moles,
        phase: r.props.phase,
        state: moles <= 0 ? 'exhausted' : reactingIds.has(c.id) ? 'reacting' : 'normal',
      };
    }
    if (c.kind === 'solid') {
      const s = c as Solid;
      const moles = reactiveMolesOf(s);
      return {
        moles,
        phase: 's',
        state: s.props.state === 'dissolved' ? 'exhausted' : reactingIds.has(c.id) ? 'reacting' : 'normal',
        solidState: s.props.state,
      };
    }
    if (c.kind === 'bubble') {
      return {
        moles: (c.props as { accumulatedMoles?: number }).accumulatedMoles ?? 0,
        phase: 'g',
        state: 'normal',
      };
    }
    if (c.kind === 'flask') {
      return { moles: 0, phase: 'l', state: 'normal' };
    }
    // thermometer
    return { moles: 0, phase: 'l', state: 'normal' };
  }
}
