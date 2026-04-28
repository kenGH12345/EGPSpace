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
} from './components/base';
export { AbstractComponent } from './components/base';

export type { PortRef, Connection } from './components/port';
export { portRef, portKey, portEquals } from './components/port';

export { UnionFind } from './components/union-find';

export type {
  EquipotentialNodeMap,
  GraphValidation,
  DomainGraphDTO,
} from './components/graph';
export { DomainGraph } from './components/graph';

export { componentRegistry } from './components/registry';
export type { ComponentFactory } from './components/registry';

// ── Solvers ──────────────────────────────────────────────────────────────
export type {
  IDomainSolver,
  PreCheckResult,
  SolveResult,
  SolveState,
} from './solvers/base';
export { SolverError } from './solvers/base';

// ── Interactions (reactions between components) ──────────────────────────
export type { ReactionEvent, ReactionEventKind } from './interactions/events';
export { ReactionEvents } from './interactions/events';

export type { ReactionRule } from './interactions/rule';

export type { InteractionTickReport } from './interactions/engine';
export { InteractionEngine } from './interactions/engine';

// ── Assembly (Spec → DomainGraph, cross-domain DSL) ──────────────────────
export type {
  AssemblySpec,
  ComponentDecl,
  SpecPortRef,
  ConnectionDecl,
  AssemblyMetadata,
} from './assembly/spec';
export { isAssemblySpec, emptySpec } from './assembly/spec';

export type {
  AssemblyError,
  AssemblyErrorCode,
  AssemblyErrorSeverity,
  AssemblyValidationResult,
} from './assembly/errors';
export { AssemblyBuildError, makeError } from './assembly/errors';

export type { PortsLookup } from './assembly/validator';
export { validateSpec } from './assembly/validator';

export type { ComponentBuilder, AssembleOptions } from './assembly/assembler';
export { Assembler } from './assembly/assembler';

export type { FluentAddOptions } from './assembly/fluent';
export { FluentAssembly } from './assembly/fluent';
