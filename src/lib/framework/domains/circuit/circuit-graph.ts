/**
 * CircuitGraph — circuit-domain specialisation of DomainGraph.
 *
 * Adds the ability to:
 *  - Identify which intra-component edges are "shorts" (wire/closed switch) for
 *    equipotential node collapse.
 *  - Collect CircuitStampEntry list across all components for the MNA solver.
 */

import { DomainGraph, type ComponentDomain } from '../../index';
import type { CircuitStampEntry } from './stamp';
import type { CircuitComponent } from './components';

export class CircuitGraph extends DomainGraph<CircuitComponent> {
  constructor() {
    super('circuit' satisfies ComponentDomain);
  }

  /**
   * Collect every stamp entry from every component, tagged with its originating
   * componentId. This is the input to the MNA solver.
   */
  collectStamps(): Array<{ componentId: string; entry: CircuitStampEntry }> {
    const out: Array<{ componentId: string; entry: CircuitStampEntry }> = [];
    for (const c of this.components()) {
      const stamp = c.toStamp();
      for (const e of stamp.entries) {
        out.push({ componentId: stamp.componentId, entry: e });
      }
    }
    return out;
  }

  /**
   * Produce the short-edge filter that DomainGraph.buildEquipotentialNodes consumes.
   * Short = wire (always), closed switch, or ammeter. These cause their two ports
   * to belong to the same node.
   */
  shortEdgeFilter(c: CircuitComponent): Array<[string, string]> {
    const shorts: Array<[string, string]> = [];
    for (const e of c.toStamp().entries) {
      if (e.kind === 'short' || e.kind === 'ammeter') {
        shorts.push([e.fromPort, e.toPort]);
      }
    }
    return shorts;
  }
}
