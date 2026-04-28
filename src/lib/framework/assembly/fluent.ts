/**
 * FluentAssembly — domain-agnostic chainable DSL base class.
 *
 * Design (D-3):
 *   - Base class provides {add, connect, loop, build, toSpec, toDTO, metadata}
 *   - Zero domain-specific methods here (no .battery(), .lens(), etc.)
 *   - Domain bindings extend this class to add type-safe sugar methods:
 *       class CircuitBuilder extends FluentAssembly<'circuit'> {
 *         battery(opts) { return this.add('battery', {voltage: opts.voltage}, opts.id); }
 *       }
 *
 *   - Two equivalent paths (AC-E):
 *       a) const g = new Assembler(...).assemble(literalSpec);
 *       b) const g = new FooBuilder().xxx().yyy().build();
 *     Must produce deep-equal graphs when given equivalent inputs.
 *
 * Key contract: `build()` delegates to a caller-supplied Assembler — FluentAssembly
 * itself does NOT own a component factory (keeps it domain-agnostic).
 */

import type { IExperimentComponent, ComponentDomain, ComponentAnchor } from '../components/base';
import type { DomainGraph } from '../components/graph';
import type { DomainGraphDTO } from '../components/graph';
import type { Assembler } from './assembler';
import type { AssemblySpec, ComponentDecl, ConnectionDecl, AssemblyMetadata } from './spec';
import { emptySpec } from './spec';

export interface FluentAddOptions {
  id?: string;
  anchor?: ComponentAnchor;
}

/**
 * Domain-agnostic chainable assembly. Extend to add type-safe sugar methods.
 *
 * Subclasses:
 *   class CircuitBuilder extends FluentAssembly<'circuit'> { ... }
 *   class OpticsBuilder  extends FluentAssembly<'optics'>  { ... }
 */
export abstract class FluentAssembly<
  D extends ComponentDomain,
  C extends IExperimentComponent = IExperimentComponent,
> {
  protected readonly _spec: AssemblySpec<D>;
  private _idCounter = 0;
  /** Ordered list of ids as they were added (for loop() convenience). */
  private readonly _addOrder: string[] = [];

  constructor(domain: D, metadata?: AssemblyMetadata) {
    this._spec = emptySpec(domain);
    if (metadata) this._spec.metadata = metadata;
  }

  // ── Core chainable operations (domain-agnostic) ──

  /**
   * Add a component to the spec. `kind` must be resolvable by the assembler
   * passed to build(); FluentAssembly does not validate kind existence.
   */
  add(kind: string, props: Record<string, unknown>, opts: FluentAddOptions = {}): this {
    const id = opts.id ?? `${kind}${this._nextIdCounter()}`;
    this._spec.components.push({
      id,
      kind,
      props,
      anchor: opts.anchor,
    });
    this._addOrder.push(id);
    return this;
  }

  /** Connect two ports by explicit reference. */
  connect(
    fromComponentId: string,
    fromPortName: string,
    toComponentId: string,
    toPortName: string,
    kind?: string,
  ): this {
    this._spec.connections.push({
      from: { componentId: fromComponentId, portName: fromPortName },
      to: { componentId: toComponentId, portName: toPortName },
      kind,
    });
    return this;
  }

  /**
   * Convenience: chain the last-added component's FIRST port to the next-to-last
   * component's SECOND port. Callers can override by explicit connect().
   *
   * NOTE: "first/second port" semantics depend on each component's port order.
   * Subclasses with domain knowledge can wrap this with safer helpers.
   */
  chain(kind?: string): this {
    if (this._addOrder.length < 2) return this;
    const last = this._addOrder[this._addOrder.length - 1];
    const prev = this._addOrder[this._addOrder.length - 2];
    // Use conventional port names — subclasses may override
    // Default convention: prev.out → last.in (common across domains).
    // If ports don't match, validator will flag; caller should use explicit connect.
    this._spec.connections.push({
      from: { componentId: prev, portName: 'out' },
      to: { componentId: last, portName: 'in' },
      kind,
    });
    return this;
  }

  /**
   * Set/merge metadata on the spec. Useful for persistence/documentation.
   */
  metadata(meta: AssemblyMetadata): this {
    this._spec.metadata = { ...(this._spec.metadata ?? {}), ...meta };
    return this;
  }

  // ── Terminal operations ──

  /** Return the accumulated spec as a new POJO (deep clone for safety). */
  toSpec(): AssemblySpec<D> {
    return JSON.parse(JSON.stringify(this._spec));
  }

  /**
   * Build a live DomainGraph by delegating to a caller-supplied Assembler.
   * The Assembler encapsulates the domain-specific component factory.
   */
  build(assembler: Assembler<D, C>): DomainGraph<C> {
    return assembler.assemble(this.toSpec());
  }

  /**
   * Directly produce the DomainGraph DTO (for postMessage to host).
   * Convenience method — equivalent to build(assembler).toDTO().
   */
  buildDTO(assembler: Assembler<D, C>): DomainGraphDTO {
    return this.build(assembler).toDTO();
  }

  /** Current component count — useful for subclass helpers like loop(). */
  protected componentCount(): number {
    return this._spec.components.length;
  }

  /** First added component id (for loop helpers). Empty string if none. */
  protected firstId(): string {
    return this._addOrder[0] ?? '';
  }

  /** Most recent added component id. Empty string if none. */
  protected lastId(): string {
    return this._addOrder[this._addOrder.length - 1] ?? '';
  }

  // ── Internal helpers ──
  private _nextIdCounter(): number {
    return ++this._idCounter;
  }
}
