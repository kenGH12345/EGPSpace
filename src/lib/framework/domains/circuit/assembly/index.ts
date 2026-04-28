/**
 * Circuit assembly — public barrel.
 *
 * Unified import surface for circuit-domain assembly:
 *   import { CircuitBuilder, circuitAssembler, CIRCUIT_PORTS } from '@/lib/framework/domains/circuit/assembly';
 */

export type { CircuitComponentKind, CircuitSpec } from './circuit-spec';
export { CIRCUIT_PORTS, circuitPortsOf } from './circuit-spec';

export { CircuitAssembler, circuitAssembler } from './circuit-assembler';

export { CircuitBuilder } from './circuit-builder';
export type {
  BatteryOpts,
  WireOpts,
  SwitchOpts,
  ResistorOpts,
  BulbOpts,
  AmmeterOpts,
  VoltmeterOpts,
} from './circuit-builder';
