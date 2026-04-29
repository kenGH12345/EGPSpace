/**
 * FluentAssembly — domain-agnostic chainable DSL base class.
 *
 * Design (D-3):
 *   - Base class provides {add, connect, loop, build, toSpec, toLayout, toBundle}
 *   - Zero domain-specific methods here (no .battery(), .lens(), etc.)
 *   - Domain bindings extend this class to add type-safe sugar methods:
 *       class CircuitBuilder extends FluentAssembly<'circuit'> {
 *         battery(opts) { return this.add('battery', {voltage: opts.voltage}, opts.id); }
 *       }
 *
 * Sugar API contract (unchanged since D-3 / AC-D3):
 *   - Sugar methods still accept `{id, anchor}` opts.
 *   - Internally: props are written to `_spec.components`, while anchor is
 *     written to `_layout.entries` — zero leakage of visual data into Spec.
 *
 * Key contract: `build()` delegates to a caller-supplied Assembler — FluentAssembly
 * itself does NOT own a component factory (keeps it domain-agnostic).
 */

import type { IExperimentComponent, ComponentDomain, ComponentAnchor } from '../contracts/component';
import type { DomainGraph } from '../contracts/graph';
import type { DomainGraphDTO } from '../contracts/graph';
import type { Assembler } from '../runtime/assembler';
import type { AssemblySpec, AssemblyMetadata } from '../contracts/assembly';
import { emptySpec } from '../contracts/assembly';
import type { LayoutSpec, AssemblyBundle } from '../contracts/layout';
import { emptyLayout } from '../contracts/layout';

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
  protected readonly _layout: LayoutSpec<D>;
  private _idCounter = 0;
  /** Ordered list of ids as they were added (for loop() convenience). */
  private readonly _addOrder: string[] = [];

  constructor(domain: D, metadata?: AssemblyMetadata) {
    this._spec = emptySpec(domain);
    this._layout = emptyLayout(domain);
    if (metadata) this._spec.metadata = metadata;
  }

  // ── Core chainable operations (domain-agnostic) ──

  /**
   * Add a component to the spec. `kind` must be resolvable by the assembler
   * passed to build(); FluentAssembly does not validate kind existence.
   *
   * anchor (if provided via opts) is routed to the sibling LayoutSpec — NOT
   * embedded in the component decl. This is the core D-3 split.
   */
  add(kind: string, props: Record<string, unknown>, opts: FluentAddOptions = {}): this {
    const id = opts.id ?? `${kind}${this._nextIdCounter()}`;
    this._spec.components.push({
      id,
      kind,
      props,
      // NOTE: anchor intentionally NOT written here; routed to _layout below.
    });
    this._addOrder.push(id);
    if (opts.anchor) {
      this._writeAnchor(id, opts.anchor);
    }
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
   */
  chain(kind?: string): this {
    if (this._addOrder.length < 2) return this;
    const last = this._addOrder[this._addOrder.length - 1];
    const prev = this._addOrder[this._addOrder.length - 2];
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

  /** Return the accumulated layout as a new POJO (deep clone for safety). */
  toLayout(): LayoutSpec<D> {
    return JSON.parse(JSON.stringify(this._layout));
  }

  /** Return both spec and layout in a single bundle (deep-cloned). */
  toBundle(): AssemblyBundle<D> {
    return {
      spec: this.toSpec(),
      layout: this.toLayout(),
    };
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

  /**
   * Write an anchor entry to _layout. "Last write wins" on duplicate ids so
   * sugar methods that spin the same id (rare) remain idempotent.
   */
  private _writeAnchor(componentId: string, anchor: ComponentAnchor): void {
    const idx = this._layout.entries.findIndex((e) => e.componentId === componentId);
    if (idx >= 0) {
      this._layout.entries[idx] = { componentId, anchor };
    } else {
      this._layout.entries.push({ componentId, anchor });
    }
  }

  private _nextIdCounter(): number {
    return ++this._idCounter;
  }
}
