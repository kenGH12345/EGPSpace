/**
 * Reaction rule: active metal + acid → salt + H2↑.
 *
 *   Zn + H2SO4 → ZnSO4 + H2↑
 *
 * This rule is the **AC-G evidence path**: every execution that has reactants
 * of (Zn + H2SO4) MUST spawn at least one Bubble(H2) component — the framework
 * must be able to express "reaction produces a new kind of component".
 *
 * Numerics: no existing L1 engine owns this reaction, so we compute extent
 * directly via stoichiometry (already done by the StoichiometrySolver; we just
 * consume `solution.reactions[].extent`).
 */

import type { ReactionRule, ReactionEvent } from '../../../index';
import type { ChemistrySolveResult, ChemistryGraph } from '../index';
import { makeReagent, makeBubble, spawnId, reactiveMolesForComponent } from './_rule-helpers';
import { REACTION_REGISTRY } from '../index';

const FORMULA = REACTION_REGISTRY['chemistry/metal-acid'];

export const metalAcidRule: ReactionRule<ChemistryGraph, ChemistrySolveResult> = {
  id: 'chemistry/metal-acid',
  domain: 'chemistry',
  description: FORMULA.description,

  evaluate(graph, solution): ReactionEvent[] {
    const events: ReactionEvent[] = [];
    const candidates = solution.reactions.filter((rc) => rc.ruleId === FORMULA.id);

    for (const cand of candidates) {
      const metal = cand.reactantIds
        .map((id) => graph.get(id))
        .find((c) => !!c && c.kind === 'solid' && c.props.formula === 'Zn');
      const acid = cand.reactantIds
        .map((id) => graph.get(id))
        .find((c) => !!c && c.kind === 'reagent' && c.props.formula === 'H2SO4');
      if (!metal || !acid) continue;

      // Consume 1:1 stoichiometry
      const metalBefore = reactiveMolesForComponent(metal);
      const acidBefore = reactiveMolesForComponent(acid);
      const metalConsumed = cand.extent * 1;
      const acidConsumed = cand.extent * 1;

      events.push(...consume(metal.id, metalBefore, metalConsumed, metal.kind === 'solid'));
      events.push(...consume(acid.id, acidBefore, acidConsumed, false));

      // Product 1: aqueous ZnSO4 (same amount of substance as consumed Zn/H2SO4)
      events.push({
        kind: 'spawn',
        sourceRuleId: FORMULA.id,
        newComponent: makeReagent(
          spawnId(cand.flaskId, 'ZnSO4'),
          'ZnSO4',
          cand.extent,
          'aq',
          0,
        ),
        reason: `ZnSO4 formed (extent=${cand.extent.toFixed(4)} mol)`,
      });

      // Product 2: H2 BUBBLE — this is the AC-G proof
      events.push({
        kind: 'spawn',
        sourceRuleId: FORMULA.id,
        newComponent: makeBubble(
          spawnId(cand.flaskId, 'H2', 'bub'),
          'H2',
          cand.extent, // one mole H2 per mole reaction
          cand.extent,
        ),
        reason: `H2 bubbling out (${cand.extent.toFixed(4)} mol H2)`,
      });
    }

    return events;
  },
};

function consume(id: string, before: number, consumed: number, isSolid: boolean): ReactionEvent[] {
  const remaining = Math.max(0, before - consumed);
  const ruleId = FORMULA.id;
  if (remaining <= 1e-6) {
    if (isSolid) {
      // For a solid, "consumed fully" = dissolved (preserve in graph for audit trail)
      return [
        {
          kind: 'mutate',
          sourceRuleId: ruleId,
          targetId: id,
          mutation: { massG: 0, state: 'dissolved' },
          reason: 'solid fully dissolved',
        },
      ];
    }
    return [{ kind: 'remove', sourceRuleId: ruleId, targetId: id, reason: 'fully consumed' }];
  }
  // Partial consumption
  if (isSolid) {
    // Approximate mass reduction proportional to mol consumed (needs molar mass).
    return [
      {
        kind: 'mutate',
        sourceRuleId: ruleId,
        targetId: id,
        mutation: { massG: Math.max(0, before === 0 ? 0 : (remaining / before) * getSolidMass(id, before)) },
        reason: `solid partially consumed (${consumed.toFixed(4)} mol reacted)`,
      },
    ];
  }
  return [
    {
      kind: 'mutate',
      sourceRuleId: ruleId,
      targetId: id,
      mutation: { moles: remaining },
      reason: `reagent reduced by ${consumed.toFixed(4)} mol`,
    },
  ];
}

// Small helper so the consume() branch can access the current massG without
// needing the component object (we already know the moles ratio).
function getSolidMass(_id: string, _before: number): number {
  // For the minimal metal-acid scope, we simply scale the remaining moles back
  // to grams via molar mass of Zn (65.38 g/mol). Keep local to avoid re-exporting
  // the molar-mass table outside the solver.
  const MOLAR_ZN = 65.38;
  return _before * MOLAR_ZN;
}
