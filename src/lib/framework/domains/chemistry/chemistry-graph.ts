/**
 * ChemistryGraph — chemistry-domain specialisation of DomainGraph.
 *
 * Adds query helpers that interpret `ports` + `connections` as
 * container-content relationships (Flask.contents ← Reagent.in etc.)
 * instead of electrical edges.
 *
 * Solver-level concerns (limiting reagent, reaction candidates) live in
 * `solver.ts`; this file stays a pure topology view.
 */

import { DomainGraph, type ComponentDomain } from '../../index';
import type {
  ChemistryComponent,
  Flask,
  Reagent,
  Bubble,
  Solid,
  Thermometer,
} from './components';

export class ChemistryGraph extends DomainGraph<ChemistryComponent> {
  constructor() {
    super('chemistry' satisfies ComponentDomain);
  }

  /**
   * All Flasks (containers) currently in the graph.
   */
  flasks(): Flask[] {
    return this.components().filter((c): c is Flask => c.kind === 'flask');
  }

  /**
   * All components inside a given flask (any kind). Uses connections only —
   * a component is "in" the flask iff there is a connection from its `'in'`
   * port to the flask's `'contents'` port.
   */
  contentsOf(flaskId: string): ChemistryComponent[] {
    const inside: ChemistryComponent[] = [];
    for (const conn of this.connections()) {
      const toFlask =
        conn.to.componentId === flaskId && conn.to.portName === 'contents';
      const fromFlask =
        conn.from.componentId === flaskId && conn.from.portName === 'contents';
      if (!toFlask && !fromFlask) continue;
      const otherId = toFlask ? conn.from.componentId : conn.to.componentId;
      const c = this.get(otherId);
      if (c) inside.push(c);
    }
    return inside;
  }

  /** Convenience: only Reagents in the flask. */
  reagentsIn(flaskId: string): Reagent[] {
    return this.contentsOf(flaskId).filter(
      (c): c is Reagent => c.kind === 'reagent',
    );
  }

  /** Convenience: only Solids in the flask. */
  solidsIn(flaskId: string): Solid[] {
    return this.contentsOf(flaskId).filter(
      (c): c is Solid => c.kind === 'solid',
    );
  }

  /** Convenience: only Bubbles in the flask. */
  bubblesIn(flaskId: string): Bubble[] {
    return this.contentsOf(flaskId).filter(
      (c): c is Bubble => c.kind === 'bubble',
    );
  }

  /** Convenience: thermometers inserted into the flask (0 or more). */
  thermometersIn(flaskId: string): Thermometer[] {
    return this.contentsOf(flaskId).filter(
      (c): c is Thermometer => c.kind === 'thermometer',
    );
  }

  /**
   * Given any non-flask component, return the Flask(s) that contain it.
   * In well-formed graphs this is a single flask, but tolerate multiple
   * (a Thermometer might be wired between two flasks, etc.).
   */
  containersOf(componentId: string): Flask[] {
    const out: Flask[] = [];
    for (const conn of this.connections()) {
      const isFromMe = conn.from.componentId === componentId;
      const isToMe = conn.to.componentId === componentId;
      if (!isFromMe && !isToMe) continue;
      const otherId = isFromMe ? conn.to.componentId : conn.from.componentId;
      const other = this.get(otherId);
      if (other && other.kind === 'flask') out.push(other as Flask);
    }
    return out;
  }
}
