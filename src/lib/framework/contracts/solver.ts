import type { ComponentDomain } from './component';

export type SolverDomain = ComponentDomain | string;

export type SolveState = 'normal' | 'open' | 'short' | 'invalid' | 'error';

export interface PreCheckResult {
  state: SolveState;
  reason?: string;
}

export interface SolveContext {
  signal?: AbortSignal;
  metadata?: Record<string, unknown>;
}

export interface TickContext extends SolveContext {
  elapsedTime?: number;
  tickIndex?: number;
}

export interface SolverBase {
  readonly domain: SolverDomain;
}

export interface SolveResult<
  TPerComponent extends Record<string, unknown> = Record<string, unknown>,
  TAggregates extends Record<string, unknown> = Record<string, unknown>,
> {
  state: SolveState;
  explanation?: string;
  perComponent: Record<string, TPerComponent>;
  aggregates?: TAggregates;
}

export interface IDomainSolver<TGraph = unknown, TResult extends SolveResult = SolveResult>
  extends SolverBase {
  preCheck?(graph: TGraph, context?: SolveContext): PreCheckResult;
  solve(graph: TGraph, context?: SolveContext): TResult;
}

export interface ITickSolver<TResult = void> extends SolverBase {
  update(deltaTime: number, context?: TickContext): TResult;
}

export type ISolver<TResult = void> = ITickSolver<TResult>;

export class SolverError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'solver_error',
  ) {
    super(message);
    this.name = 'SolverError';
  }
}
