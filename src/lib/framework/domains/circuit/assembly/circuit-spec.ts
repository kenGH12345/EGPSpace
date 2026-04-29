/**
 * CircuitSpec — circuit-domain concrete instantiation of the generic AssemblySpec.
 *
 * This file is a VERY thin type alias — all heavy lifting is in framework/assembly.
 * It exists to (a) provide a named type for IDE jump-to-definition, and (b) document
 * the accepted kinds for the circuit domain.
 */

import type { AssemblySpec } from '../../../contracts/assembly';

/**
 * Accepted component kinds in the circuit domain. Kept as a string union for
 * documentation; the validator consults componentRegistry at runtime.
 */
export type CircuitComponentKind =
  | 'battery'
  | 'wire'
  | 'switch'
  | 'resistor'
  | 'bulb'
  | 'burnt_bulb'
  | 'ammeter'
  | 'voltmeter';

/** Ports exposed by each circuit component kind. Used by Validator (Layer 3). */
export const CIRCUIT_PORTS: Record<CircuitComponentKind, readonly string[]> = {
  battery: ['positive', 'negative'],
  wire: ['a', 'b'],
  switch: ['in', 'out'],
  resistor: ['a', 'b'],
  bulb: ['a', 'b'],
  burnt_bulb: ['a', 'b'],
  ammeter: ['in', 'out'],
  voltmeter: ['a', 'b'],
};

/** Look up valid ports for a circuit kind (used by AssemblyValidator.portsOf). */
export function circuitPortsOf(kind: string): readonly string[] | undefined {
  return CIRCUIT_PORTS[kind as CircuitComponentKind];
}

/** A circuit-domain spec — type alias for clarity. */
export type CircuitSpec = AssemblySpec<'circuit'>;
