/**
 * Assembler — transforms an AssemblySpec into a ready-to-use DomainGraph.
 *
 * Design (D-1, D-3):
 *   - Domain-agnostic base class: knows about Spec/Validator/DomainGraph but
 *     NOT about circuit/optics/chemistry specifics.
 *   - Consumes a "component builder" callback: spec ComponentDecl → IExperimentComponent.
 *     This is the ONLY domain-specific hook, supplied by each domain's binding layer.
 *   - Built-in validation pipeline: validateSpec → per-component build → connect.
 *
 * Usage (domain-specific binding):
 *   const assembler = new Assembler('circuit', dto => createCircuitComponent(dto));
 *   const graph = assembler.assemble(spec);
 */

import type { IExperimentComponent, ComponentDomain } from '../components/base';
import { DomainGraph } from '../components/graph';
import type { AssemblySpec, ComponentDecl } from './spec';
import type { AssemblyBundle } from './layout';
import type { AssemblyError, AssemblyValidationResult } from './errors';
import { AssemblyBuildError, makeError } from './errors';
import { validateSpec, type PortsLookup } from './validator';

/**
 * Domain-specific factory: turn a ComponentDecl into a live IExperimentComponent.
 * Throws `Error` on unknown kind or bad props — Assembler will catch & wrap.
 */
export type ComponentBuilder<C extends IExperimentComponent> = (decl: ComponentDecl) => C;

export interface AssembleOptions {
  /** Optional ports lookup for validator's Layer 3 checks. */
  portsOf?: PortsLookup;
  /** If true (default), throw AssemblyBuildError on validation errors. */
  strict?: boolean;
}

export class Assembler<
  D extends ComponentDomain,
  C extends IExperimentComponent = IExperimentComponent,
> {
  readonly domain: D;
  private readonly _build: ComponentBuilder<C>;
  private readonly _makeGraph: () => DomainGraph<C>;

  /**
   * @param domain  Domain label this assembler targets.
   * @param build   Factory: ComponentDecl → IExperimentComponent.
   * @param makeGraph  Optional factory for custom DomainGraph subclass.
   *                   Defaults to `new DomainGraph<C>(domain)`.
   */
  constructor(
    domain: D,
    build: ComponentBuilder<C>,
    makeGraph?: () => DomainGraph<C>,
  ) {
    this.domain = domain;
    this._build = build;
    this._makeGraph = makeGraph ?? (() => new DomainGraph<C>(domain));
  }

  /**
   * Validate spec and return structured result (no throwing).
   * Callers can use this for pre-flight checks before expensive operations.
   */
  validate(spec: unknown, portsOf?: PortsLookup): AssemblyValidationResult {
    return validateSpec(spec, portsOf);
  }

  /**
   * Assemble a spec into a live DomainGraph.
   * Throws AssemblyBuildError if validation fails (strict mode) or if component
   * build throws.
   */
  assemble(spec: AssemblySpec<D>, opts: AssembleOptions = {}): DomainGraph<C> {
    const { portsOf, strict = true } = opts;

    // Step 0: emit warning for legacy decl.anchor (deprecated; see D-4)
    this._warnLegacyAnchor(spec);

    // Step 1: validate
    const validation = this.validate(spec, portsOf);
    if (!validation.ok && strict) {
      throw new AssemblyBuildError(
        `Spec validation failed with ${validation.errors.length} error(s): ${validation.errors.map((e) => e.message).join('; ')}`,
        validation.errors,
      );
    }

    // Step 2: domain match
    if (spec.domain !== this.domain) {
      throw new AssemblyBuildError(
        `Domain mismatch: assembler=${this.domain}, spec=${spec.domain}`,
        [makeError('domain_mismatch', `Expected domain "${this.domain}", got "${spec.domain}"`)],
      );
    }

    // Step 3: build components
    const graph = this._makeGraph();
    const buildErrors: AssemblyError[] = [];
    for (const decl of spec.components) {
      try {
        const comp = this._build(decl);
        graph.add(comp);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        buildErrors.push(makeError(
          'unknown_component_kind',
          `Failed to build component "${decl.id}" (kind="${decl.kind}"): ${msg}`,
          { path: `components[${decl.id}]`, detail: { kind: decl.kind } },
        ));
      }
    }
    if (buildErrors.length > 0) {
      throw new AssemblyBuildError(
        `Component build failed for ${buildErrors.length} component(s)`,
        buildErrors,
      );
    }

    // Step 4: wire connections
    const connectErrors: AssemblyError[] = [];
    for (const conn of spec.connections) {
      try {
        graph.connect(conn.from, conn.to, conn.kind);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        connectErrors.push(makeError(
          'port_reference_invalid',
          `Failed to connect ${conn.from.componentId}#${conn.from.portName} → ${conn.to.componentId}#${conn.to.portName}: ${msg}`,
        ));
      }
    }
    if (connectErrors.length > 0 && strict) {
      throw new AssemblyBuildError(
        `Connection wiring failed for ${connectErrors.length} connection(s)`,
        connectErrors,
      );
    }

    return graph;
  }

  /**
   * Assemble a bundle (spec + optional layout) into a live DomainGraph.
   * The layout is not consumed by the graph itself (solvers don't need anchors);
   * callers retain the layout for downstream rendering or persistence.
   */
  assembleBundle(bundle: AssemblyBundle<D>, opts: AssembleOptions = {}): DomainGraph<C> {
    return this.assemble(bundle.spec as AssemblySpec<D>, opts);
  }

  // ── Internal helpers ──

  private _warnedAnchorOnce = false;
  private _warnLegacyAnchor(spec: AssemblySpec<D>): void {
    if (this._warnedAnchorOnce) return;
    const hasLegacy = spec.components.some((c) => (c as ComponentDecl).anchor !== undefined);
    if (hasLegacy) {
      // eslint-disable-next-line no-console
      console.warn(
        `[Assembler:${this.domain}] Spec contains legacy "decl.anchor" fields — this is deprecated; use LayoutSpec for visual placement.`,
      );
      this._warnedAnchorOnce = true;
    }
  }
}
