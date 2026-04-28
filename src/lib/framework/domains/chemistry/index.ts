/**
 * Chemistry domain — public barrel.
 *
 * Responsibilities:
 *   1. Re-export components / graph / solver types for consumers
 *   2. Register every chemistry component kind with the shared componentRegistry
 *      so that DTO → live-instance roundtripping works across postMessage
 *
 * Side effect: importing this module registers five factories. Registry is
 * idempotent-with-warning, so hot reload in dev stays safe.
 */

import { componentRegistry, type ComponentDTO } from '../../index';

// Re-export the shared registry so consumers of this barrel can use it without
// reaching into the framework root import path.
export { componentRegistry } from '../../index';
import {
  Flask,
  Reagent,
  Bubble,
  Solid,
  Thermometer,
  type FlaskProps,
  type ReagentProps,
  type BubbleProps,
  type SolidProps,
  type ThermometerProps,
} from './components';

// ── Components ────────────────────────────────────────────────────────────
export {
  Flask,
  Reagent,
  Bubble,
  Solid,
  Thermometer,
  createFlask,
  createReagent,
  createBubble,
  createSolid,
  createThermometer,
} from './components';
export type {
  ChemistryComponent,
  ChemistryPhase,
  FlaskShape,
  SolidState,
  FlaskProps,
  ReagentProps,
  BubbleProps,
  SolidProps,
  ThermometerProps,
} from './components';

// ── Graph ─────────────────────────────────────────────────────────────────
export { ChemistryGraph } from './chemistry-graph';

// ── Solver ────────────────────────────────────────────────────────────────
export { StoichiometrySolver } from './solver';
export type {
  ChemistryPerComponent,
  ChemistrySolveResult,
  ReactionCandidate,
  ChemistryComponentState,
} from './solver';

// ── Reactions registry (data only) ────────────────────────────────────────
export {
  REACTION_REGISTRY,
  ACIDS,
  BASES,
  ACTIVE_METALS,
  isAcid,
  isBase,
  isActiveMetal,
} from './reactions/registry';
export type {
  ReactionFormula,
  ReactantTemplate,
  ProductTemplate,
  AcidFormula,
  BaseFormula,
  ActiveMetalFormula,
} from './reactions/registry';

// ── Reaction rules (behavioural) ──────────────────────────────────────────
export {
  acidBaseNeutralizationRule,
  metalAcidRule,
  ironRustingRule,
  CHEMISTRY_REACTIONS,
} from './reactions';

// ── Assembly (Spec + Assembler + Builder) ─────────────────────────────────
export * from './assembly';

// ── Reaction utils ────────────────────────────────────────────────────────
export {
  findContainedPair,
  molesOf,
  makeReagent,
  makeBubble,
  makeSolid,
  spawnId,
} from './reaction-utils';

// ── componentRegistry side-effect registration ────────────────────────────
componentRegistry.register('chemistry', 'flask', (dto: ComponentDTO) => {
  return new Flask(dto.id, dto.props as unknown as FlaskProps, dto.anchor);
});
componentRegistry.register('chemistry', 'reagent', (dto: ComponentDTO) => {
  return new Reagent(dto.id, dto.props as unknown as ReagentProps, dto.anchor);
});
componentRegistry.register('chemistry', 'bubble', (dto: ComponentDTO) => {
  return new Bubble(dto.id, dto.props as unknown as BubbleProps, dto.anchor);
});
componentRegistry.register('chemistry', 'solid', (dto: ComponentDTO) => {
  return new Solid(dto.id, dto.props as unknown as SolidProps, dto.anchor);
});
componentRegistry.register('chemistry', 'thermometer', (dto: ComponentDTO) => {
  return new Thermometer(dto.id, dto.props as unknown as ThermometerProps, dto.anchor);
});
