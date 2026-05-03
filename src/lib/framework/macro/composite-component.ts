import { AbstractComponent, ComponentStamp } from '../contracts/component';
import type { ComponentDomain, ComponentAnchor } from '../contracts/component';
import type { AssemblySpec } from '../contracts/assembly';
import type { MacroExportPortMap } from '../contracts/layout';

export interface CompositeComponentProps {
  /** The internal graph definition of the macro component */
  spec: AssemblySpec;
  /** Mapping from external port name to structured internal port reference */
  exportPortMap: MacroExportPortMap;
  /** Free-form runtime properties */
  params?: Record<string, unknown>;
}

export class CompositeComponent extends AbstractComponent<CompositeComponentProps, unknown> {
  public readonly domain: ComponentDomain;
  public readonly kind: string = 'composite';
  public readonly ports: readonly string[];

  constructor(
    id: string,
    domain: ComponentDomain,
    props: CompositeComponentProps,
    anchor: ComponentAnchor = { x: 0, y: 0 }
  ) {
    super(id, props, anchor);
    this.domain = domain;
    this.ports = Object.keys(props.exportPortMap);
  }

  /**
   * Composite components do not produce direct stamps.
   * They must be flattened by the Assembler/Flattener before being passed to a Solver.
   */
  toStamp(): ComponentStamp<unknown> {
    throw new Error(`CompositeComponent ${this.id} cannot generate a stamp. It must be flattened before solving.`);
  }
}
