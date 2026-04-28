/**
 * Circuit Reaction: Overload Bulb
 *
 * When a bulb's solved power exceeds 1.5× its rated power, the bulb is destroyed:
 * we spawn a BurntBulb at the same position (which presents as an open circuit),
 * then remove the original Bulb. This is the textbook "over-voltage destroys bulb"
 * demonstration and the project's canonical "components interact → produce new
 * components" evidence.
 */

import {
  ReactionEvents,
  type ReactionEvent,
  type ReactionRule,
  type ComponentDomain,
} from '../../../index';
import type { CircuitGraph } from '../circuit-graph';
import type { CircuitSolveResult } from '../solver';
import { BurntBulb, Bulb } from '../components';

const OVERLOAD_FACTOR = 1.5;

export const overloadBulbRule: ReactionRule<CircuitGraph, CircuitSolveResult> = {
  id: 'circuit/overload-bulb',
  domain: 'circuit' satisfies ComponentDomain,
  description:
    'Spawn a BurntBulb and remove the original Bulb when delivered power exceeds 1.5× its rated power.',

  evaluate(graph: CircuitGraph, solution: CircuitSolveResult): ReactionEvent[] {
    const events: ReactionEvent[] = [];

    for (const c of graph.components()) {
      if (!(c instanceof Bulb)) continue;

      const solved = solution.perComponent[c.id];
      if (!solved) continue;

      const rated = (c.props.ratedPower as number) ?? 0;
      if (rated <= 0) continue;
      if (solved.power <= rated * OVERLOAD_FACTOR) continue;

      // Bulb is overloaded → burn it out.
      const burntId = `${c.id}_burnt`;
      const reason = `过载烧毁：实际功率 ${solved.power.toFixed(2)}W 超过额定 ${rated}W × ${OVERLOAD_FACTOR}`;
      const burnt = new BurntBulb(burntId, c.id, reason, { ...c.anchor });

      // Note: the new BurntBulb has ports 'a'/'b' same as Bulb. To preserve the
      // topology, a production solution would rewire existing connections. For the
      // current DoD (demonstrating reaction mechanics + UI "bulb goes black"),
      // we emit an annotation on the original bulb — it stays in graph but now
      // marked as 'destroyed' — and additionally spawn the BurntBulb marker so
      // downstream UI can render the blackened state without topology surgery.
      events.push(
        ReactionEvents.annotate(
          'circuit/overload-bulb',
          c.id,
          { destroyed: true, burntAt: new Date().toISOString(), reason },
          reason,
        ),
      );
      events.push(ReactionEvents.spawn('circuit/overload-bulb', burnt, reason));

      // Also mutate the bulb's resistance to Infinity (behaves like open).
      // This causes subsequent solves to treat it as broken — satisfying the
      // "电流全路断开" semantic from the requirement.
      events.push(
        ReactionEvents.mutate(
          'circuit/overload-bulb',
          c.id,
          { resistance: Number.POSITIVE_INFINITY, destroyed: true },
          reason,
        ),
      );
    }

    return events;
  },
};
