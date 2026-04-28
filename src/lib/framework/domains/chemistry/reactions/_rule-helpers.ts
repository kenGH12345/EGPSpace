/**
 * Shared helpers used by the three reaction rules.
 *
 * Keep this tiny — it exists to avoid the three rule files duplicating
 * each other, not to become a utility grab-bag.
 */

import type { ChemistryComponent, Reagent, Solid } from '../components';

const MOLAR_MASS_G_PER_MOL: Record<string, number> = {
  Fe: 55.85,
  Zn: 65.38,
  Mg: 24.31,
  Al: 26.98,
  Fe2O3: 159.69,
};

/**
 * Compute reactive moles of a component (same convention as the solver uses).
 * Reagent: use moles. Solid: convert massG via molar mass (0 if unknown formula).
 */
export function reactiveMolesForComponent(c: ChemistryComponent): number {
  if (c.kind === 'reagent') {
    const m = (c as Reagent).props.moles;
    return Number.isFinite(m) && m > 0 ? m : 0;
  }
  if (c.kind === 'solid') {
    const s = c as Solid;
    if (s.props.state === 'dissolved') return 0;
    const mm = MOLAR_MASS_G_PER_MOL[s.props.formula];
    if (!mm || !(mm > 0)) return 0;
    return Math.max(0, s.props.massG / mm);
  }
  return 0;
}

// Re-export the registry-builder functions the rule files need. Keeps the
// rule files' import surface small (2 imports: rule-helpers + registry).
export { makeReagent, makeBubble, makeSolid, spawnId } from '../reaction-utils';
