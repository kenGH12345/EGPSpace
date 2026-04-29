/**
 * InteractionEngine — applies ReactionRules to a DomainGraph and resolves
 * compound interactions in a bounded fixed-point loop.
 *
 * Flow within a single "tick":
 *   solve(graph) → solution → for each rule: evaluate → events → apply → re-solve if changed
 *   repeat until no new events OR iteration cap reached.
 *
 * Domain-agnostic: works for any domain whose components implement IExperimentComponent.
 */

import type { DomainGraph } from '../contracts/graph';
import type { IDomainSolver, SolveResult } from '../contracts/solver';
import type { IExperimentComponent } from '../contracts/component';
import type { ReactionRule } from '../contracts/rule';
import type { ReactionEvent } from '../contracts/events';

export interface InteractionTickReport<TResult extends SolveResult> {
  /** Events applied this tick, in order. */
  events: ReactionEvent[];
  /** Number of inner solve iterations (1 for a no-reaction case, more if reactions chain). */
  iterations: number;
  /** The final (post-reaction) solve result. */
  finalSolution: TResult;
  /** True if MAX_ITER was hit before stabilisation — indicates oscillating rules. */
  unstable: boolean;
}

const DEFAULT_MAX_ITER = 8;

export class InteractionEngine<
  TGraph extends DomainGraph,
  TResult extends SolveResult,
> {
  private rules: ReactionRule<TGraph, TResult>[] = [];

  constructor(
    private readonly solver: IDomainSolver<TGraph, TResult>,
    private readonly maxIter: number = DEFAULT_MAX_ITER,
  ) {}

  register(rule: ReactionRule<TGraph, TResult>): this {
    if (rule.domain !== this.solver.domain) {
      throw new Error(
        `InteractionEngine: rule "${rule.id}" has domain "${rule.domain}" but solver is "${this.solver.domain}"`,
      );
    }
    this.rules.push(rule);
    return this;
  }

  registerAll(rules: ReactionRule<TGraph, TResult>[]): this {
    for (const r of rules) this.register(r);
    return this;
  }

  /** Run one full "tick": solve → react → re-solve loop until stable. */
  tick(graph: TGraph): InteractionTickReport<TResult> {
    const appliedEvents: ReactionEvent[] = [];
    let iterations = 0;
    let unstable = false;
    let solution = this.solver.solve(graph);

    while (iterations < this.maxIter) {
      iterations += 1;

      // Collect events from every rule for the current solution
      const newEvents: ReactionEvent[] = [];
      for (const rule of this.rules) {
        try {
          newEvents.push(...rule.evaluate(graph, solution));
        } catch (err) {
          // A rule bug must not crash the whole solve. Log + skip.
          // eslint-disable-next-line no-console
          console.error(`[InteractionEngine] rule "${rule.id}" threw:`, err);
        }
      }

      // De-duplicate events that would re-apply the same mutation
      const filtered = dedupeEvents(newEvents, appliedEvents);
      if (filtered.length === 0) {
        break; // stable
      }

      this.applyEvents(graph, filtered);
      appliedEvents.push(...filtered);
      solution = this.solver.solve(graph);
    }

    if (iterations >= this.maxIter) {
      unstable = true;
      // eslint-disable-next-line no-console
      console.warn(
        `[InteractionEngine] reached MAX_ITER=${this.maxIter}; rules may oscillate. Events: ${appliedEvents.length}`,
      );
    }

    return {
      events: appliedEvents,
      iterations,
      finalSolution: solution,
      unstable,
    };
  }

  /** Apply events to the graph. Public so tests can exercise event application directly. */
  applyEvents(graph: TGraph, events: ReactionEvent[]): void {
    for (const ev of events) {
      switch (ev.kind) {
        case 'spawn':
          if (ev.newComponent) {
            // Graph type is DomainGraph<C>; the new component must match C.
            // We trust the rule to emit a correctly-typed component for its domain.
            graph.add(ev.newComponent as Parameters<TGraph['add']>[0]);
          }
          break;
        case 'remove':
          if (ev.targetId) graph.remove(ev.targetId);
          break;
        case 'mutate':
          if (ev.targetId && ev.mutation) {
            const c = graph.get(ev.targetId);
            if (c) {
              Object.assign(c.props as Record<string, unknown>, ev.mutation);
            }
          }
          break;
        case 'annotate':
          // Annotations don't mutate props; a lightweight side-channel for UI hints.
          if (ev.targetId && ev.annotation) {
            const c = graph.get(ev.targetId);
            if (c) {
              const holder = c as unknown as { _annotations?: Record<string, unknown>[] };
              holder._annotations ??= [];
              holder._annotations.push({ ...ev.annotation, _sourceRule: ev.sourceRuleId });
            }
          }
          break;
      }
    }
  }

  get registeredRules(): readonly ReactionRule<TGraph, TResult>[] {
    return this.rules;
  }
}

/**
 * Drop events that would re-apply an already-applied mutation (idempotence).
 * A spawn is idempotent by new-component id; a mutate by (target,field) tuple.
 */
function dedupeEvents(candidates: ReactionEvent[], already: ReactionEvent[]): ReactionEvent[] {
  const alreadySigs = new Set(already.map(eventSignature));
  const out: ReactionEvent[] = [];
  const seen = new Set<string>();
  for (const ev of candidates) {
    const sig = eventSignature(ev);
    if (alreadySigs.has(sig) || seen.has(sig)) continue;
    seen.add(sig);
    out.push(ev);
  }
  return out;
}

function eventSignature(ev: ReactionEvent): string {
  switch (ev.kind) {
    case 'spawn':
      return `spawn:${ev.newComponent?.id ?? '?'}`;
    case 'remove':
      return `remove:${ev.targetId ?? '?'}`;
    case 'mutate':
      return `mutate:${ev.targetId}:${Object.keys(ev.mutation ?? {}).sort().join(',')}`;
    case 'annotate':
      return `annotate:${ev.targetId}:${ev.sourceRuleId}`;
  }
}
