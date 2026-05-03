import { AbstractComponent, ComponentDomain } from '../../contracts/component';
import type { ComponentStamp } from '../../contracts/component';
import { ITraitBiological, ITraitPhysical, ITraitEdible } from '../../contracts/traits';

export type BiologyKind = 'plant-cell' | 'microscope-slide';

/**
 * Entry for biology state machine or reaction solver.
 */
export interface BiologyStampEntry {
  kind: BiologyKind;
  nodes: string[];
  parameters: Record<string, number | boolean | string>;
}

// --------------------------------------------------------
// Plant Cell (Abstract representation of living tissue)
// --------------------------------------------------------

export interface PlantCellProps extends ITraitBiological, ITraitPhysical, ITraitEdible {
  /** Hydration level 0.0-1.0 */
  hydration: number;
  /** Sunlight exposure level 0.0-1.0 */
  sunlight: number;
}

export class PlantCell extends AbstractComponent<PlantCellProps, BiologyStampEntry> {
  readonly domain: ComponentDomain = 'biology';
  readonly kind: BiologyKind = 'plant-cell';
  
  // Surface interaction
  readonly ports = ['surface'] as const;

  constructor(id: string, props: Partial<PlantCellProps> = {}) {
    super(id, {
      isAlive: props.isAlive ?? true,
      health: props.health ?? 1.0,
      mass: props.mass ?? 0.01,
      state: 'solid',
      hydration: props.hydration ?? 0.8,
      sunlight: props.sunlight ?? 0.5,
      nutrition: props.nutrition ?? 5,
      isToxic: props.isToxic ?? false,
    });
  }

  toStamp(): ComponentStamp<BiologyStampEntry> {
    return {
      componentId: this.id,
      entries: [
        {
          kind: 'plant-cell',
          nodes: [`${this.id}#surface`],
          parameters: { 
            isAlive: this.props.isAlive, 
            health: this.props.health!, 
            hydration: this.props.hydration 
          },
        },
      ],
    };
  }
}

// --------------------------------------------------------
// Microscope Slide (Container/Observer for bio matter)
// --------------------------------------------------------

export interface MicroscopeSlideProps extends ITraitPhysical {
  /** Magnification factor applied to specimen */
  magnification: number;
  /** Specimen ID currently on the slide */
  specimenId?: string;
}

export class MicroscopeSlide extends AbstractComponent<MicroscopeSlideProps, BiologyStampEntry> {
  readonly domain: ComponentDomain = 'biology';
  readonly kind: BiologyKind = 'microscope-slide';
  
  // Center stage for placing specimens
  readonly ports = ['stage'] as const;

  constructor(id: string, props: Partial<MicroscopeSlideProps> = {}) {
    super(id, {
      mass: props.mass ?? 0.05,
      state: 'solid',
      magnification: props.magnification ?? 100, // 100x magnification
      specimenId: props.specimenId,
    });
  }

  toStamp(): ComponentStamp<BiologyStampEntry> {
    return {
      componentId: this.id,
      entries: [
        {
          kind: 'microscope-slide',
          nodes: [`${this.id}#stage`],
          parameters: { magnification: this.props.magnification, specimenId: this.props.specimenId ?? '' },
        },
      ],
    };
  }
}
