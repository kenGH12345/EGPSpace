/**
 * REACTION_REGISTRY — chemistry reaction pattern library.
 *
 * Each entry describes a reaction template: its reactants with coefficients,
 * its products with phases, and (optionally) which legacy L1 engine contains
 * the numerical model the rule should delegate to.
 *
 * Rules look up their own id in this registry to read the product template,
 * then spawn Reagent/Bubble/Solid components accordingly. Solver also reads it
 * to detect which flasks contain a matching reactant set.
 *
 * ⚠️ The registry is intentionally data-only (no functions) so it stays
 * JSON-serialisable and easy to unit-test.
 */

import type { ChemistryPhase } from '../components';

export interface ReactantTemplate {
  formula: string;
  coefficient: number;
}

export interface ProductTemplate {
  formula: string;
  coefficient: number;
  phase: ChemistryPhase;
}

export interface ReactionFormula {
  /** Matches the ReactionRule.id of the rule that evaluates this reaction. */
  id: string;
  description: string;
  reactants: ReactantTemplate[];
  products: ProductTemplate[];
  /** Which L1 legacy engine to consult for numerical details (pH, rust rate, ...). */
  legacyEngine?: 'titration' | 'iron-rusting' | 'reaction-rate';
}

// ── Category lookups (used by rules to classify reagent pairs) ────────────

export const ACIDS = ['H2SO4', 'HCl', 'HNO3', 'CH3COOH'] as const;
export const BASES = ['NaOH', 'KOH', 'Ca(OH)2', 'NH3'] as const;
export const ACTIVE_METALS = ['Zn', 'Mg', 'Fe', 'Al'] as const;

export type AcidFormula = (typeof ACIDS)[number];
export type BaseFormula = (typeof BASES)[number];
export type ActiveMetalFormula = (typeof ACTIVE_METALS)[number];

export function isAcid(formula: string): formula is AcidFormula {
  return (ACIDS as readonly string[]).includes(formula);
}
export function isBase(formula: string): formula is BaseFormula {
  return (BASES as readonly string[]).includes(formula);
}
export function isActiveMetal(formula: string): formula is ActiveMetalFormula {
  return (ACTIVE_METALS as readonly string[]).includes(formula);
}

// ── Registry ──────────────────────────────────────────────────────────────

export const REACTION_REGISTRY: Record<string, ReactionFormula> = {
  'chemistry/acid-base-neutralization': {
    id: 'chemistry/acid-base-neutralization',
    description: '酸碱中和反应 (e.g. H2SO4 + 2NaOH → Na2SO4 + 2H2O)',
    reactants: [
      { formula: 'H2SO4', coefficient: 1 },
      { formula: 'NaOH', coefficient: 2 },
    ],
    products: [
      { formula: 'Na2SO4', coefficient: 1, phase: 'aq' },
      { formula: 'H2O', coefficient: 2, phase: 'l' },
    ],
    legacyEngine: 'titration',
  },
  'chemistry/metal-acid': {
    id: 'chemistry/metal-acid',
    description: '活泼金属+酸 产气 (e.g. Zn + H2SO4 → ZnSO4 + H2↑)',
    reactants: [
      { formula: 'Zn', coefficient: 1 },
      { formula: 'H2SO4', coefficient: 1 },
    ],
    products: [
      { formula: 'ZnSO4', coefficient: 1, phase: 'aq' },
      { formula: 'H2', coefficient: 1, phase: 'g' },
    ],
  },
  'chemistry/iron-rusting': {
    id: 'chemistry/iron-rusting',
    description: '铁生锈 (4Fe + 3O2 → 2Fe2O3)',
    reactants: [
      { formula: 'Fe', coefficient: 4 },
      { formula: 'O2', coefficient: 3 },
    ],
    products: [{ formula: 'Fe2O3', coefficient: 2, phase: 's' }],
    legacyEngine: 'iron-rusting',
  },
};
