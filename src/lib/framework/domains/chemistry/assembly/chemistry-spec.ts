/**
 * ChemistrySpec — chemistry-domain concrete instantiation of AssemblySpec.
 *
 * Kept intentionally thin. The shared AssemblySpec / Validator / Assembler do
 * the heavy lifting; this file only declares the set of accepted kinds and
 * their port layouts so the generic Validator can catch port typos.
 */

import type { AssemblySpec } from '../../../assembly/spec';

export type ChemistryComponentKind =
  | 'flask'
  | 'reagent'
  | 'bubble'
  | 'solid'
  | 'thermometer';

/**
 * Ports exposed by each chemistry component kind. Used by the generic
 * AssemblyValidator at Layer 3 (port presence check).
 */
export const CHEMISTRY_PORTS: Record<ChemistryComponentKind, readonly string[]> = {
  flask: ['contents'],
  reagent: ['in'],
  bubble: ['in'],
  solid: ['in'],
  thermometer: ['in'],
};

/** Look up valid ports for a chemistry kind. */
export function chemistryPortsOf(kind: string): readonly string[] | undefined {
  return CHEMISTRY_PORTS[kind as ChemistryComponentKind];
}

/** A chemistry-domain spec — type alias for clarity. */
export type ChemistrySpec = AssemblySpec<'chemistry'>;
