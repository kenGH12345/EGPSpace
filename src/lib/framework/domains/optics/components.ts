import { AbstractComponent, ComponentDomain } from '../../contracts/component';
import type { ComponentStamp } from '../../contracts/component';
import { ITraitPhysical, ITraitOptical } from '../../contracts/traits';

export type OpticsKind = 'light-source' | 'convex-lens';

/**
 * Entry for optics ray tracing or matrix solver.
 */
export interface OpticsStampEntry {
  kind: OpticsKind;
  nodes: string[];
  parameters: Record<string, number | string>;
}

// --------------------------------------------------------
// Light Source
// --------------------------------------------------------

export interface LightSourceProps extends ITraitPhysical, ITraitOptical {
  /** Light intensity (lumens or abstract unit) */
  intensity: number;
  /** Beam angle (degrees) */
  beamAngle: number;
}

export class LightSource extends AbstractComponent<LightSourceProps, OpticsStampEntry> {
  readonly domain: ComponentDomain = 'optics';
  readonly kind: OpticsKind = 'light-source';
  
  // Emitter port
  readonly ports = ['emitter'] as const;

  constructor(id: string, props: Partial<LightSourceProps> = {}) {
    super(id, {
      mass: props.mass ?? 0.5,
      state: props.state ?? 'solid',
      intensity: props.intensity ?? 1000,
      beamAngle: props.beamAngle ?? 30,
      color: props.color ?? '#FFFFFF',
      transparency: 0, // Opaque block
    });
  }

  toStamp(): ComponentStamp<OpticsStampEntry> {
    return {
      componentId: this.id,
      entries: [
        {
          kind: 'light-source',
          nodes: [`${this.id}#emitter`],
          parameters: { intensity: this.props.intensity, beamAngle: this.props.beamAngle, color: this.props.color || '#FFFFFF' },
        },
      ],
    };
  }
}

// --------------------------------------------------------
// Convex Lens
// --------------------------------------------------------

export interface ConvexLensProps extends ITraitPhysical, ITraitOptical {
  /** Focal length (m) */
  focalLength: number;
}

export class ConvexLens extends AbstractComponent<ConvexLensProps, OpticsStampEntry> {
  readonly domain: ComponentDomain = 'optics';
  readonly kind: OpticsKind = 'convex-lens';
  
  // Light passes through front to back (or vice versa)
  readonly ports = ['front', 'back'] as const;

  constructor(id: string, props: Partial<ConvexLensProps> = {}) {
    super(id, {
      mass: props.mass ?? 0.2,
      state: 'solid',
      transparency: props.transparency ?? 0.95,
      refractiveIndex: props.refractiveIndex ?? 1.5, // Glass
      focalLength: props.focalLength ?? 0.1, // 10 cm focal length
    });
  }

  toStamp(): ComponentStamp<OpticsStampEntry> {
    return {
      componentId: this.id,
      entries: [
        {
          kind: 'convex-lens',
          nodes: [`${this.id}#front`, `${this.id}#back`],
          parameters: { focalLength: this.props.focalLength, refractiveIndex: this.props.refractiveIndex! },
        },
      ],
    };
  }
}
