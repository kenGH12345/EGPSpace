/**
 * Experiment Component Framework — public API surface.
 *
 * Everything a domain implementation or consumer needs is re-exported here.
 * Domain files MUST import from this barrel (not reach into sub-paths), to keep
 * the framework's internal structure free to evolve.
 */

// ── Components ───────────────────────────────────────────────────────────
export type {
  ComponentDomain,
  ComponentKind,
  ComponentAnchor,
  ComponentStamp,
  ComponentDTO,
  ComponentSolvedValues,
  IExperimentComponent,
} from './contracts/component';
export { AbstractComponent } from './contracts/component';

export type { PortRef, Connection } from './contracts/port';
export { portRef, portKey, portEquals } from './contracts/port';

export { UnionFind } from './runtime/union-find';

export type {
  EquipotentialNodeMap,
  GraphValidation,
  DomainGraphDTO,
} from './contracts/graph';
export { DomainGraph } from './contracts/graph';

export { componentRegistry } from './runtime/registry';
export type { ComponentFactory } from './runtime/registry';

// ── Solvers ──────────────────────────────────────────────────────────────
export type {
  SolverDomain,
  SolverBase,
  IDomainSolver,
  ITickSolver,
  ISolver,
  PreCheckResult,
  SolveResult,
  SolveState,
  SolveContext,
  TickContext,
} from './contracts/solver';
export { SolverError } from './contracts/solver';

// ── Interactions (reactions between components) ──────────────────────────
export type { ReactionEvent, ReactionEventKind } from './contracts/events';
export { ReactionEvents } from './contracts/events';

export type { ReactionRule } from './contracts/rule';

export type { InteractionTickReport } from './runtime/engine';
export { InteractionEngine } from './runtime/engine';

// ── Assembly (Spec → DomainGraph, cross-domain DSL) ──────────────────────
export type {
  AssemblySpec,
  ComponentDecl,
  SpecPortRef,
  ConnectionDecl,
  AssemblyMetadata,
} from './contracts/assembly';
export { isAssemblySpec, emptySpec } from './contracts/assembly';

export type {
  AssemblyError,
  AssemblyErrorCode,
  AssemblyErrorSeverity,
  AssemblyValidationResult,
} from './contracts/errors';
export { AssemblyBuildError, makeError } from './contracts/errors';

export type { PortsLookup } from './runtime/validator';
export { validateSpec } from './runtime/validator';

export type { ComponentBuilder, AssembleOptions } from './runtime/assembler';
export { Assembler } from './runtime/assembler';

export type { FluentAddOptions } from './builders/fluent';
export { FluentAssembly } from './builders/fluent';

// ── Layout (visual placement, sibling to AssemblySpec) ────────────────────
export type {
  LayoutEntry,
  LayoutSpec,
  LayoutMetadata,
  AssemblyBundle,
  MacroPortRef,
  MacroExportPortMap,
} from './contracts/layout';
export {
  isLayoutSpec,
  emptyLayout,
  layoutLookup,
  isAssemblyBundle,
} from './contracts/layout';

// ── Macro / Composite (nested sub-graphs) ──────────────────────────────
export type { CompositeComponentProps } from './macro/composite-component';
export { CompositeComponent } from './macro/composite-component';
export type { MacroDefinition, MacroResolver } from './macro/flattener';
export { SpecFlattener } from './macro/flattener';
export { macroPortRefKey } from './macro/port-map';
