/**
 * AssemblySpec — declarative, domain-agnostic description of a component graph.
 *
 * Design (D-2): pure data POJO. No methods. Consumed by:
 *   - AssemblyValidator → validate structure
 *   - Assembler         → build DomainGraph
 *   - FluentAssembly    → produce spec from chained method calls
 *   - JSON I/O (future) → round-trip persistence
 *
 * Domain-agnostic: typed on `D extends ComponentDomain` so circuit / optics /
 * chemistry / mechanics / biology all share the same shape.
 */

import type { ComponentDomain, ComponentAnchor } from './component';

/** A single component declaration in a spec. */
export interface ComponentDecl {
  /** Unique id within the spec (validated by AssemblyValidator). */
  id: string;
  /** Registered factory kind. Domain-specific string, e.g. a power source / a node / a pipe. */
  kind: string;
  /** Free-form component-type-specific properties (resistance, focalLength, ...). */
  props: Record<string, unknown>;
  /**
   * @deprecated Use `LayoutSpec` (see `./layout.ts`) for visual placement.
   * The field is retained on ComponentDecl only for backwards compatibility;
   * Assembler emits a console.warn when it encounters a non-undefined value.
   */
  anchor?: ComponentAnchor;
}

/** Port reference used in spec connections. */
export interface SpecPortRef {
  componentId: string;
  portName: string;
}

/** A single connection between two component ports. */
export interface ConnectionDecl {
  from: SpecPortRef;
  to: SpecPortRef;
  /** Optional connection label (e.g. 'wire', 'beam', 'pipe'). */
  kind?: string;
}

/** Optional metadata accompanying an assembly. */
export interface AssemblyMetadata {
  name?: string;
  description?: string;
  version?: string;
  /** Free-form tags for search / categorisation. */
  tags?: string[];
}

/**
 * Top-level Spec. Fully serialisable (JSON.stringify-safe if props are JSON-safe).
 */
export interface AssemblySpec<D extends ComponentDomain = ComponentDomain> {
  domain: D;
  components: ComponentDecl[];
  connections: ConnectionDecl[];
  metadata?: AssemblyMetadata;
}

/**
 * Type guard — checks runtime shape. Used by Validator and Engine dual-path.
 * Does NOT check referential integrity or domain registration (that's Validator's job).
 */
export function isAssemblySpec(value: unknown): value is AssemblySpec {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.domain === 'string' &&
    Array.isArray(v.components) &&
    Array.isArray(v.connections)
  );
}

/** Create an empty spec for a given domain (used by FluentAssembly constructor). */
export function emptySpec<D extends ComponentDomain>(domain: D): AssemblySpec<D> {
  return { domain, components: [], connections: [] };
}
