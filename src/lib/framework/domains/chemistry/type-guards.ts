/**
 * Chemistry component type guards (E 阶段 · D-3).
 *
 * TypeScript discriminated union narrowing helpers. Use these instead of
 * raw `c.kind === 'reagent'` checks for consistency and self-documenting intent.
 *
 * ```ts
 * import { asReagent } from './type-guards';
 * if (asReagent(c)) {
 *   c.props.formula;       // ← narrowed to ReagentProps.formula (string)
 *   c.props.concentration; // ← narrowed to number
 * }
 * ```
 */

import type { ChemistryComponent, Flask, Reagent, Bubble, Solid, Thermometer } from './components';

export function asFlask(c: ChemistryComponent): c is Flask {
  return c.kind === 'flask';
}

export function asReagent(c: ChemistryComponent): c is Reagent {
  return c.kind === 'reagent';
}

export function asBubble(c: ChemistryComponent): c is Bubble {
  return c.kind === 'bubble';
}

export function asSolid(c: ChemistryComponent): c is Solid {
  return c.kind === 'solid';
}

export function asThermometer(c: ChemistryComponent): c is Thermometer {
  return c.kind === 'thermometer';
}
