/**
 * Domain Solver Contract — framework L0
 *
 * Every domain (circuit, optics, mechanics, ...) provides a solver implementing this
 * interface. Kept deliberately minimal: the framework doesn't assume matrix algebra
 * (optics might be ray-tracing, mechanics might be ODE integration).
 */

import type { DomainGraph } from './graph';
import type { ComponentDomain } from './component';

/** Summary of solver state for UI badges / logging. */
export type SolveState = 'normal' | 'short' | 'open' | 'overload' | 'invalid';

/** Result of pre-solve quick check; may short-circuit full solve. */
export interface PreCheckResult {
  state: SolveState;
  reason?: string;
}

/** Generic solver result. Domain specialises the `perComponent` payload shape. */
export interface SolveResult<PerComponent extends object = Record<string, unknown>> {
  state: SolveState;
  explanation?: string;
  /** Per-component solved values, keyed by componentId. */
  perComponent: Record<string, PerComponent>;
  /** Domain-level aggregates (total current, total intensity, total energy...). */
  aggregates?: Record<string, number | string>;
}

/**
 * Pluggable domain solver. Implementations live in
 * `src/lib/framework/domains/<domain>/solver.ts`.
 */
export interface IDomainSolver<TGraph extends DomainGraph = DomainGraph, TResult extends SolveResult = SolveResult> {
  readonly domain: ComponentDomain;

  /** Fast check for degenerate cases (short/open/invalid topology). */
  preCheck(graph: TGraph): PreCheckResult;

  /** Full solve. MUST throw a typed error (e.g. SolverError) on numerical failure. */
  solve(graph: TGraph): TResult;
}

export class SolverError extends Error {
  constructor(
    message: string,
    public readonly code: 'singular' | 'oscillation' | 'invalid_topology' | 'unknown',
  ) {
    super(message);
    this.name = 'SolverError';
  }
}
