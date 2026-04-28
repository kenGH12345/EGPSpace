/**
 * ChemistryAssembler — chemistry-domain Assembler binding.
 *
 * Mirrors CircuitAssembler's structure: wires the framework Assembler to the
 * chemistry componentRegistry factories and ChemistryGraph constructor.
 */

import {
  Assembler,
  componentRegistry,
  type ComponentDecl,
  type AssemblySpec,
  type ComponentDTO,
} from '../../../index';
import { ChemistryGraph } from '../chemistry-graph';
import type { ChemistryComponent } from '../components';
import { chemistryPortsOf } from './chemistry-spec';

export class ChemistryAssembler extends Assembler<'chemistry', ChemistryComponent> {
  constructor() {
    super(
      'chemistry',
      (decl: ComponentDecl) => {
        const dto: ComponentDTO = {
          id: decl.id,
          domain: 'chemistry',
          kind: decl.kind,
          props: { ...decl.props },
          anchor: decl.anchor ?? { x: 0, y: 0 },
        };
        if (!componentRegistry.has('chemistry', decl.kind)) {
          throw new Error(`ChemistryAssembler: unregistered kind "${decl.kind}"`);
        }
        return componentRegistry.create(dto) as ChemistryComponent;
      },
      () => new ChemistryGraph(),
    );
  }

  /** Overload supplying chemistryPortsOf for port-presence validation. */
  assembleChemistry(spec: AssemblySpec<'chemistry'>): ChemistryGraph {
    return this.assemble(spec, { portsOf: chemistryPortsOf }) as ChemistryGraph;
  }
}

export const chemistryAssembler = new ChemistryAssembler();
