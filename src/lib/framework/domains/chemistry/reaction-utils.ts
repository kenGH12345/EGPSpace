/**
 * Chemistry reaction utilities — pure helpers shared by every reaction rule.
 *
 * These sit BELOW the rule layer so they can't accidentally import rule state.
 * They are free of L1-engine calls; rules add those themselves.
 *
 * Anchor policy (post D-separation):
 *   Reaction-spawned components have NO canvas position of their own — callers
 *   (templates / renderers) supply position via LayoutSpec, not here. We still
 *   need an anchor on ComponentDTO to satisfy the interface, so we use a single
 *   `PLACEHOLDER_ANCHOR` constant to make the intent explicit.
 */

import { componentRegistry, type ComponentDTO, type ComponentAnchor } from '../../index';
import type { ChemistryComponent, Reagent, ChemistryPhase } from './components';
import { ChemistryGraph } from './chemistry-graph';

/**
 * Explicit placeholder used for reaction-spawned components. Not a visual
 * intent — renderers should consult LayoutSpec (or compute a fresh anchor)
 * before painting.
 */
const PLACEHOLDER_ANCHOR: ComponentAnchor = { x: 0, y: 0 };

/**
 * Return the first pair (componentA, componentB) in `flaskId` where
 * A satisfies `predA` and B satisfies `predB`. Returns null if no pair exists.
 */
export function findContainedPair<A extends ChemistryComponent, B extends ChemistryComponent>(
  graph: ChemistryGraph,
  flaskId: string,
  predA: (c: ChemistryComponent) => c is A,
  predB: (c: ChemistryComponent) => c is B,
): [A, B] | null {
  const contents = graph.contentsOf(flaskId);
  const a = contents.find(predA);
  if (!a) return null;
  const b = contents.find((c) => c.id !== a.id && predB(c));
  if (!b) return null;
  return [a, b];
}

/**
 * Reagent.props.moles, guarded against non-finite/negative values.
 */
export function molesOf(r: Reagent): number {
  const m = r.props.moles;
  if (!Number.isFinite(m) || m < 0) return 0;
  return m;
}

/**
 * Construct a new Reagent (as a ChemistryComponent) via the shared
 * componentRegistry so reactions can't drift from the canonical factory.
 */
export function makeReagent(
  id: string,
  formula: string,
  moles: number,
  phase: ChemistryPhase,
  concentration: number = 0,
): ChemistryComponent {
  const dto: ComponentDTO = {
    id,
    domain: 'chemistry',
    kind: 'reagent',
    props: { formula, moles, phase, concentration },
    anchor: PLACEHOLDER_ANCHOR,
  };
  return componentRegistry.create(dto) as ChemistryComponent;
}

/**
 * Construct a new Bubble via the shared registry.
 */
export function makeBubble(
  id: string,
  gas: string,
  rateMolPerTick: number,
  accumulatedMoles: number = 0,
): ChemistryComponent {
  const dto: ComponentDTO = {
    id,
    domain: 'chemistry',
    kind: 'bubble',
    props: { gas, rateMolPerTick, accumulatedMoles },
    anchor: PLACEHOLDER_ANCHOR,
  };
  return componentRegistry.create(dto) as ChemistryComponent;
}

/**
 * Construct a new Solid via the shared registry.
 */
export function makeSolid(
  id: string,
  formula: string,
  massG: number,
  state: 'intact' | 'rusting' | 'dissolved' = 'intact',
): ChemistryComponent {
  const dto: ComponentDTO = {
    id,
    domain: 'chemistry',
    kind: 'solid',
    props: { formula, massG, state },
    anchor: PLACEHOLDER_ANCHOR,
  };
  return componentRegistry.create(dto) as ChemistryComponent;
}

/**
 * Helper assumed by multiple rules: generate a unique id for a spawned component
 * based on parent flask + product index + formula. Must be deterministic so the
 * InteractionEngine's event-dedup signature is stable across ticks.
 */
export function spawnId(flaskId: string, productFormula: string, suffix: string = 'p'): string {
  return `${flaskId}-${suffix}-${productFormula}`;
}
