/**
 * Reaction rule: iron rusting.
 *
 *   4 Fe + 3 O2 → 2 Fe2O3
 *
 * Demonstrates the `mutate` event semantic: the Fe solid's state advances
 * intact → rusting → dissolved across successive ticks. Numerical rust rate
 * delegated to IronRustingEngine (AC-F).
 */

import type { ReactionRule, ReactionEvent } from '../../../index';
import type { ChemistrySolveResult, ChemistryGraph } from '../index';
import { REACTION_REGISTRY } from '../index';
import { makeSolid, spawnId } from './_rule-helpers';
import { IronRustingEngine } from '@/lib/engines/chemistry/iron-rusting';

const FORMULA = REACTION_REGISTRY['chemistry/iron-rusting'];
const rustEngine = new IronRustingEngine();

export const ironRustingRule: ReactionRule<ChemistryGraph, ChemistrySolveResult> = {
  id: 'chemistry/iron-rusting',
  domain: 'chemistry',
  description: FORMULA.description,

  evaluate(graph, solution): ReactionEvent[] {
    const events: ReactionEvent[] = [];
    const candidates = solution.reactions.filter((rc) => rc.ruleId === FORMULA.id);

    for (const cand of candidates) {
      const fe = cand.reactantIds
        .map((id) => graph.get(id))
        .find((c) => !!c && c.kind === 'solid' && c.props.formula === 'Fe');
      if (!fe || fe.kind !== 'solid') continue;

      // Consult legacy engine for a "day-equivalent" rust rate (AC-F).
      const tr = rustEngine.compute({
        days: 1,
        oxygen_concentration: 21,
        has_water: 1,
        has_salt: 0,
        temperature: 25,
      });
      const rustPercent = typeof tr.values.rustLevel === 'number' ? tr.values.rustLevel : 0;

      // State machine: intact → rusting → dissolved.
      const currentState = fe.props.state;
      const nextState =
        currentState === 'intact'
          ? 'rusting'
          : currentState === 'rusting'
            ? 'dissolved'
            : 'dissolved';

      // Mass loss is the solver-determined extent consumed (mol Fe) × molar mass
      const massLossG = cand.extent * 4 * 55.85;
      const currentMass = fe.props.massG;
      const nextMass = Math.max(0, currentMass - massLossG);

      events.push({
        kind: 'mutate',
        sourceRuleId: FORMULA.id,
        targetId: fe.id,
        mutation: { state: nextState, massG: nextMass },
        reason: `Fe rusting ${currentState}→${nextState} (lost ${massLossG.toFixed(2)}g, ${rustPercent.toFixed(1)}% rust)`,
      });

      // Spawn Fe2O3 product (solid).
      const productMassG = cand.extent * 2 * 159.69;
      if (productMassG > 0) {
        events.push({
          kind: 'spawn',
          sourceRuleId: FORMULA.id,
          newComponent: makeSolid(
            spawnId(cand.flaskId, 'Fe2O3'),
            'Fe2O3',
            productMassG,
            'intact',
          ),
          reason: `Fe2O3 formed (${productMassG.toFixed(2)}g)`,
        });
      }
    }

    return events;
  },
};
