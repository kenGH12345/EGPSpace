/**
 * Experiment Component Framework — L0 Base Contract
 *
 * This file defines the **cross-domain** contract every experiment component
 * (circuit, optics, mechanics, chemistry, biology) implements. It is intentionally
 * domain-agnostic: no circuit-specific names like "voltage" or "resistance" leak here.
 *
 * Usage across domains (example skeletons; actual domain implementations live under
 * `src/lib/framework/domains/<domain>/components/*.ts`):
 *
 *   - Circuit:    class Battery  implements IExperimentComponent<{voltage:number}>
 *   - Optics:     class LightSrc implements IExperimentComponent<{wavelength:number}>
 *   - Mechanics:  class Spring   implements IExperimentComponent<{k:number}>
 *   - Chemistry:  class Reagent  implements IExperimentComponent<{formula:string, moles:number}>
 */

import type { PortRef } from './port';

/** Five domains supported by the framework. Extensible without breaking changes. */
export type ComponentDomain =
  | 'circuit'
  | 'optics'
  | 'mechanics'
  | 'chemistry'
  | 'biology'
  // Generic bucket for cross-domain markers (e.g. BurntBulb produced by a reaction)
  | 'meta';

/**
 * Kind tag for a component. Each domain uses its own literal union in practice
 * (e.g. 'battery'|'wire'|...), but the framework only needs a string for dispatch.
 */
export type ComponentKind = string;

/**
 * Where a component sits on the canvas (for rendering only; solver doesn't use this).
 * Optional rotation in degrees, default 0. Solvers should never read anchor.
 *
 * @deprecated Prefer `LayoutSpec` (see `framework/assembly/layout.ts`) for
 * visual placement. This type is retained for backwards compatibility; new code
 * should not write anchors directly to components.
 */
export interface ComponentAnchor {
  x: number;
  y: number;
  rotation?: number;
}

/**
 * A "stamp" is how a component contributes to the domain's solution system.
 * Framework defines the generic shape; each domain specialises via generics.
 *
 * Circuit example: stamp.entries = [{kind:'resistor', fromPort:'a', toPort:'b', value:10}]
 * Optics example:  stamp.entries = [{kind:'lens', fromPort:'in', toPort:'out', focal:50}]
 *
 * Keeping this generic (not hardcoded to MNA) is critical to cross-domain reuse.
 */
export interface ComponentStamp<Entry = unknown> {
  componentId: string;
  entries: Entry[];
}

/** Plain-object DTO for postMessage / serialization. No methods, no class refs. */
export interface ComponentDTO {
  id: string;
  domain: ComponentDomain;
  kind: ComponentKind;
  props: Record<string, unknown>;
  anchor: ComponentAnchor;
}

/**
 * The heart of the framework: every component implements this contract.
 *
 * Invariants:
 *  - `id` is globally unique within a DomainGraph
 *  - `ports` is immutable (no port add/remove after construction)
 *  - `props` MAY be mutated (user twiddles a slider) — re-solve picks up changes
 *  - `toStamp()` must be pure (same props → same stamp)
 *  - `serialize()` must be JSON-safe (no functions, no cycles)
 */
export interface IExperimentComponent<Props extends object = Record<string, unknown>, StampEntry = unknown> {
  readonly id: string;
  readonly domain: ComponentDomain;
  readonly kind: ComponentKind;
  readonly ports: readonly string[];
  /**
   * @deprecated Visual placement now lives in `LayoutSpec`. This field is
   * retained for backwards compatibility and defaults to `{x:0,y:0}` when
   * components are built by the new Assembler pipeline.
   */
  anchor: ComponentAnchor;
  props: Props;

  /** Contribute this component's rows/edges to the domain solver's system. */
  toStamp(): ComponentStamp<StampEntry>;

  /** Serialise to a plain object suitable for postMessage / JSON.stringify. */
  serialize(): ComponentDTO;
}

/**
 * Abstract base class handling boilerplate (id/ports/props mutation + DTO roundtrip).
 * Concrete components extend this and supply `kind`, `domain`, `ports`, and `toStamp`.
 */
export abstract class AbstractComponent<Props extends object, StampEntry = unknown>
  implements IExperimentComponent<Props, StampEntry>
{
  abstract readonly domain: ComponentDomain;
  abstract readonly kind: ComponentKind;
  abstract readonly ports: readonly string[];

  constructor(
    public readonly id: string,
    public props: Props,
    public anchor: ComponentAnchor = { x: 0, y: 0 },
  ) {
    if (!id) throw new Error('AbstractComponent: id is required');
  }

  abstract toStamp(): ComponentStamp<StampEntry>;

  serialize(): ComponentDTO {
    return {
      id: this.id,
      domain: this.domain,
      kind: this.kind,
      props: { ...this.props } as Record<string, unknown>,
      anchor: { ...this.anchor },
    };
  }
}

/** Plain JSON-safe value produced by solvers for UI, tests, and postMessage. */
export type ComponentSolvedValue =
  | number
  | string
  | boolean
  | null
  | ComponentSolvedValue[]
  | { [key: string]: ComponentSolvedValue };

/**
 * A snapshot of solved values for a single component, produced by a solver.
 * Domain solvers extend this with their own semantics:
 *  - Circuit:   { current, voltage, power, glow? }
 *  - Optics:    { rayPath, intensity }
 *  - Mechanics: { force, displacement, kineticEnergy }
 */
export interface ComponentSolvedValues {
  [key: string]: ComponentSolvedValue;
}

export type PortRefExport = PortRef; // re-export for convenience
