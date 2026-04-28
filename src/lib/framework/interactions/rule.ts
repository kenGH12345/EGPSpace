/**
 * ReactionRule — declarative rule that evaluates solver output and emits events
 * describing topology/state changes ("some components produce new components").
 *
 * Cross-domain by design: the rule doesn't know about circuit vs chemistry.
 * Each rule belongs to ONE domain, but is pluggable within the framework.
 */

import type { DomainGraph } from '../components/graph';
import type { SolveResult } from '../solvers/base';
import type { ComponentDomain } from '../components/base';
import type { ReactionEvent } from './events';

export interface ReactionRule<
  TGraph extends DomainGraph = DomainGraph,
  TResult extends SolveResult = SolveResult,
> {
  /** Unique rule identifier, e.g. "circuit/overload-bulb". */
  readonly id: string;
  /** Domain this rule belongs to. */
  readonly domain: ComponentDomain;
  /** Human-readable description for docs / UI. */
  readonly description: string;

  /**
   * Inspect current graph state + the latest solver result, and return the events
   * that should be applied. Return [] if no action. Must be pure & deterministic
   * for a given (graph, result) pair — otherwise the fixed-point loop won't
   * terminate.
   */
  evaluate(graph: TGraph, solution: TResult): ReactionEvent[];
}
