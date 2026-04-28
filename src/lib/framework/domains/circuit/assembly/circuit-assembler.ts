/**
 * CircuitAssembler — circuit-domain Assembler binding.
 *
 * Delegates to the generic framework Assembler but supplies:
 *  - the circuit domain label
 *  - a ComponentBuilder that consults componentRegistry to instantiate live
 *    CircuitComponent objects from ComponentDecl
 *  - a CircuitGraph factory (domain-specialised DomainGraph subclass)
 *  - the circuitPortsOf function for Validator Layer 3
 */

import {
  Assembler,
  componentRegistry,
  type ComponentDecl,
  type AssemblySpec,
  type ComponentDTO,
} from '../../../index';
import { CircuitGraph } from '../circuit-graph';
import type { CircuitComponent } from '../components';
import { circuitPortsOf } from './circuit-spec';

/** Circuit-domain Assembler. */
export class CircuitAssembler extends Assembler<'circuit', CircuitComponent> {
  constructor() {
    super(
      'circuit',
      // ComponentBuilder: ComponentDecl → CircuitComponent via registry.
      (decl: ComponentDecl) => {
        const dto: ComponentDTO = {
          id: decl.id,
          domain: 'circuit',
          kind: decl.kind,
          props: { ...decl.props },
          anchor: decl.anchor ?? { x: 0, y: 0 },
        };
        if (!componentRegistry.has('circuit', decl.kind)) {
          throw new Error(`CircuitAssembler: unregistered kind "${decl.kind}"`);
        }
        return componentRegistry.create(dto) as CircuitComponent;
      },
      // Graph factory
      () => new CircuitGraph(),
    );
  }

  /**
   * Override: assemble with circuit-specific portsOf lookup enabled by default.
   * This catches typos like "positve" vs "positive" at validation time.
   */
  assembleCircuit(spec: AssemblySpec<'circuit'>): CircuitGraph {
    return this.assemble(spec, { portsOf: circuitPortsOf }) as CircuitGraph;
  }
}

/** Convenience singleton (ensure ./index.ts side-effect registration has run). */
export const circuitAssembler = new CircuitAssembler();
