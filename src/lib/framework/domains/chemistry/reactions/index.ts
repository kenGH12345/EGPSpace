/**
 * Chemistry reaction rules barrel.
 *
 * Export order mirrors cognitive difficulty (simplest first): neutralization
 * (simple remove+spawn) → metal-acid (spawn bubble) → iron-rusting (mutate).
 */

export { acidBaseNeutralizationRule } from './acid-base-neutralization';
export { metalAcidRule } from './metal-acid';
export { ironRustingRule } from './iron-rusting';
export * from './registry';

import type { ReactionRule } from '../../../index';
import type { ChemistrySolveResult, ChemistryGraph } from '../index';
import { acidBaseNeutralizationRule } from './acid-base-neutralization';
import { metalAcidRule } from './metal-acid';
import { ironRustingRule } from './iron-rusting';

/** Aggregate list consumed by InteractionEngine.registerAll(). */
export const CHEMISTRY_REACTIONS: ReactionRule<ChemistryGraph, ChemistrySolveResult>[] = [
  acidBaseNeutralizationRule,
  metalAcidRule,
  ironRustingRule,
];
