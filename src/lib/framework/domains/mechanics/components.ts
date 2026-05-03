import { AbstractComponent, ComponentDomain } from '../../contracts/component';
import type { ComponentStamp } from '../../contracts/component';
import { ITraitPhysical, ITraitConductive } from '../../contracts/traits';

export type MechanicsKind = 'mass-block' | 'spring';

/**
 * Entry for a mechanics matrix/system stamp.
 * This is a stub for the mechanics solver.
 */
export interface MechanicsStampEntry {
  kind: MechanicsKind;
  nodes: string[];
  parameters: Record<string, number>;
}

// --------------------------------------------------------
// Mass Block
// --------------------------------------------------------

export interface MassBlockProps extends ITraitPhysical, ITraitConductive {
  /** Initial velocity */
  velocityX: number;
  velocityY: number;
  /** Material type */
  material: string;
}

export class MassBlock extends AbstractComponent<MassBlockProps, MechanicsStampEntry> {
  readonly domain: ComponentDomain = 'mechanics';
  readonly kind: MechanicsKind = 'mass-block';
  
  // Center port for applying forces or attaching springs
  readonly ports = ['center'] as const;

  constructor(id: string, props: Partial<MassBlockProps> = {}) {
    super(id, {
      mass: props.mass ?? 1.0,
      state: props.state ?? 'solid',
      resistance: props.resistance ?? Infinity, // Default insulator
      velocityX: props.velocityX ?? 0,
      velocityY: props.velocityY ?? 0,
      material: props.material ?? 'iron',
    });
  }

  toStamp(): ComponentStamp<MechanicsStampEntry> {
    return {
      componentId: this.id,
      entries: [
        {
          kind: 'mass-block',
          nodes: [`${this.id}#center`],
          parameters: { mass: this.props.mass },
        },
      ],
    };
  }
}

// --------------------------------------------------------
// Spring
// --------------------------------------------------------

export interface SpringProps extends ITraitPhysical {
  /** Spring constant (N/m) */
  k: number;
  /** Rest length (m) */
  restLength: number;
}

export class Spring extends AbstractComponent<SpringProps, MechanicsStampEntry> {
  readonly domain: ComponentDomain = 'mechanics';
  readonly kind: MechanicsKind = 'spring';
  
  // Two ends of the spring
  readonly ports = ['left', 'right'] as const;

  constructor(id: string, props: Partial<SpringProps> = {}) {
    super(id, {
      mass: props.mass ?? 0.1,
      state: 'solid',
      k: props.k ?? 100,
      restLength: props.restLength ?? 1.0,
    });
  }

  toStamp(): ComponentStamp<MechanicsStampEntry> {
    return {
      componentId: this.id,
      entries: [
        {
          kind: 'spring',
          nodes: [`${this.id}#left`, `${this.id}#right`],
          parameters: { k: this.props.k, restLength: this.props.restLength },
        },
      ],
    };
  }
}
