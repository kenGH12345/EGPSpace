/**
 * Reaction Event Types — framework L0
 *
 * When components interact and produce new components (or mutate/remove existing
 * ones), a ReactionRule emits ReactionEvents. The InteractionEngine then applies
 * these events to the DomainGraph between solve iterations.
 *
 * Cross-domain examples:
 *  - Circuit:   overload bulb → mutate(bulb.resistance=Infinity, kind='burnt_bulb')
 *  - Chemistry: acid + base → remove(acid, base) + spawn(salt, water)
 *  - Optics:    prism + ray → spawn(7 rays) + remove(original_ray)
 *  - Biology:   cell + hypertonic_solution → spawn(plasmolysis_marker)
 */

import type { IExperimentComponent } from '../components/base';

/** All four kinds of topology-changing events a reaction can produce. */
export type ReactionEventKind = 'spawn' | 'remove' | 'mutate' | 'annotate';

/** A single mutation to be applied to a DomainGraph by the InteractionEngine. */
export interface ReactionEvent {
  kind: ReactionEventKind;
  /** For remove/mutate/annotate: which component to target. */
  targetId?: string;
  /** For spawn: the new component to add. */
  newComponent?: IExperimentComponent;
  /** For mutate: partial props patch to apply. */
  mutation?: Record<string, unknown>;
  /** For annotate: pure metadata the solver may read; doesn't mutate props. */
  annotation?: Record<string, unknown>;
  /** Human-readable reason ("过载烧毁" / "酸碱中和"). */
  reason: string;
  /** The ReactionRule.id that emitted this event (for debugging + UI traceability). */
  sourceRuleId: string;
}

/** Constructor helpers for cleaner rule code. */
export const ReactionEvents = {
  spawn(rule: string, newComponent: IExperimentComponent, reason: string): ReactionEvent {
    return { kind: 'spawn', newComponent, reason, sourceRuleId: rule };
  },
  remove(rule: string, targetId: string, reason: string): ReactionEvent {
    return { kind: 'remove', targetId, reason, sourceRuleId: rule };
  },
  mutate(rule: string, targetId: string, mutation: Record<string, unknown>, reason: string): ReactionEvent {
    return { kind: 'mutate', targetId, mutation, reason, sourceRuleId: rule };
  },
  annotate(rule: string, targetId: string, annotation: Record<string, unknown>, reason: string): ReactionEvent {
    return { kind: 'annotate', targetId, annotation, reason, sourceRuleId: rule };
  },
};
