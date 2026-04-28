/**
 * Reaction rule: acid-base neutralization.
 *
 *   H2SO4 + 2 NaOH → Na2SO4 + 2 H2O
 *
 * This rule is a thin adapter: it reads the `chemistry/acid-base-neutralization`
 * reaction candidates produced by the StoichiometrySolver, delegates numerical
 * details (pH, badge) to the legacy TitrationEngine (AC-F), and emits:
 *   - spawn events for products (Na2SO4 reagent, H2O reagent)
 *   - remove event for the limiting reagent (fully consumed)
 *   - mutate event for the excess reagent (moles reduced)
 */

import type { ReactionRule, ReactionEvent } from '../../../index';
import type { ChemistrySolveResult, ChemistryGraph } from '../index';
import { molesOf, makeReagent, spawnId, REACTION_REGISTRY } from '../index';
import { TitrationEngine } from '@/lib/engines/chemistry/titration';

const FORMULA = REACTION_REGISTRY['chemistry/acid-base-neutralization'];
const titrationEngine = new TitrationEngine();

export const acidBaseNeutralizationRule: ReactionRule<ChemistryGraph, ChemistrySolveResult> = {
  id: 'chemistry/acid-base-neutralization',
  domain: 'chemistry',
  description: FORMULA.description,

  evaluate(graph, solution): ReactionEvent[] {
    const events: ReactionEvent[] = [];
    const candidates = solution.reactions.filter((rc) => rc.ruleId === FORMULA.id);

    for (const cand of candidates) {
      // Find acid and base components by formula
      const reactants = cand.reactantIds
        .map((id) => graph.get(id))
        .filter((c): c is NonNullable<typeof c> => !!c && c.kind === 'reagent');
      const acid = reactants.find((r) => r.props.formula === 'H2SO4');
      const base = reactants.find((r) => r.props.formula === 'NaOH');
      if (!acid || !base) continue;

      // Delegate numerical trace to TitrationEngine (AC-F). Units:
      //   TitrationEngine expects concentration (mol/L) and volume (mL).
      // We synthesize plausible volumes from moles+concentration so the engine
      // returns a pH trace; the pH itself is advisory (exposed via annotate).
      const acidVol = acid.props.concentration > 0 ? (acid.props.moles / acid.props.concentration) * 1000 : 25;
      const baseVol = base.props.concentration > 0 ? (base.props.moles / base.props.concentration) * 1000 : 25;
      const tr = titrationEngine.compute({
        acid_concentration: Math.max(1e-6, acid.props.concentration),
        base_concentration: Math.max(1e-6, base.props.concentration),
        acid_volume: acidVol,
        base_volume: baseVol,
      });
      const pH = typeof tr.values.pH === 'number' ? tr.values.pH : 7;

      // Consume reactants
      const acidExtent = cand.extent * 1; // coefficient of H2SO4 is 1
      const baseExtent = cand.extent * 2; // coefficient of NaOH is 2
      events.push(...consumeReactant(acid.id, molesOf(acid), acidExtent));
      events.push(...consumeReactant(base.id, molesOf(base), baseExtent));

      // Spawn products
      events.push({
        kind: 'spawn',
        sourceRuleId: FORMULA.id,
        newComponent: makeReagent(
          spawnId(cand.flaskId, 'Na2SO4'),
          'Na2SO4',
          cand.extent * 1,
          'aq',
          0,
        ),
        reason: `Na2SO4 formed (extent=${cand.extent.toFixed(3)} mol, pH=${pH.toFixed(2)})`,
      });
      events.push({
        kind: 'spawn',
        sourceRuleId: FORMULA.id,
        newComponent: makeReagent(
          spawnId(cand.flaskId, 'H2O'),
          'H2O',
          cand.extent * 2,
          'l',
          0,
        ),
        reason: `H2O formed (extent=${cand.extent.toFixed(3)} mol)`,
      });
    }

    return events;
  },
};

/**
 * Shared helper: decide whether a reactant is fully consumed (emit remove)
 * or partially consumed (emit mutate). Tolerance 1e-6 to avoid jitter.
 */
function consumeReactant(id: string, before: number, consumed: number): ReactionEvent[] {
  const remaining = Math.max(0, before - consumed);
  if (remaining <= 1e-6) {
    return [{ kind: 'remove', sourceRuleId: FORMULA.id, targetId: id, reason: 'fully consumed' }];
  }
  return [
    {
      kind: 'mutate',
      sourceRuleId: FORMULA.id,
      targetId: id,
      mutation: { moles: remaining },
      reason: `moles reduced by ${consumed.toFixed(3)}`,
    },
  ];
}
