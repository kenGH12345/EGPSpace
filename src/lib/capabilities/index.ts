/**
 * Capability Registry — Unified Entry Point (T-5)
 *
 * Aggregates all atomic capabilities for cross-module discovery.
 * Consumers should import from this file rather than deep-importing individual modules.
 *
 * Architecture:
 *   ┌─────────────────────────────────────────┐
 *   │        CapabilityRegistry               │
 *   │  (this file — unified discovery)       │
 *   └─────────────────────────────────────────┘
 *              │
 *   ┌──────────┼──────────┬──────────┐
 *   ▼          ▼          ▼          ▼
 *  Engines  Validators  Templates  Mappings
 *   │          │          │          │
 *   ▼          ▼          ▼          ▼
 *  Physics   ParamRange  Physics    Physics
 *  Chemistry Phenomenon  Chemistry  Chemistry
 *  Biology   Formula     Biology
 *  Math      Dimension   Geography
 *            ...         Math
 */

// ── Engine Capabilities (T-1) ──────────────────────────────────────────────
export { default as BuoyancyEngine } from '../engines/physics/buoyancy';
export { default as LeverEngine } from '../engines/physics/lever';
export { default as RefractionEngine } from '../engines/physics/refraction';
export { default as CircuitEngine } from '../engines/physics/circuit';
export { default as GenericEngine } from '../engines/generic';
export { type IExperimentEngine } from '../engines/interface';

// ── Validation Capabilities (T-2) ──────────────────────────────────────────
export { default as ParamRangeValidator } from '../validators/param-range-validator';
export { default as PhenomenonValidator } from '../validators/phenomenon-validator';
export { default as FormulaValidator } from '../validators/formula-validator';
export { default as DimensionValidator } from '../validators/dimension-validator';
export { type CheckResult } from '../validators/param-range-validator';

// ── Generation Capabilities (T-3) ──────────────────────────────────────────
export {
  getTemplate,
  getTemplateUnsafe,
  listApprovedTemplates,
  listAllTemplates,
  getTemplateUrl,
  isApprovedTemplate,
  validateTemplateFile,
  PHYSICS_REGISTRY,
  CHEMISTRY_REGISTRY,
  BIOLOGY_REGISTRY,
  GEOGRAPHY_REGISTRY,
  MATH_REGISTRY,
  ALL_SUBJECT_REGISTRIES,
  type TemplateMetadata,
  type TemplateParameter,
  type SubjectKey,
  type AuditStatus,
} from '../template-registry';

// ── Mapping Capabilities (T-4) ─────────────────────────────────────────────
export {
  conceptToTemplateId,
  templateIdToConceptKeywords,
  listAllMappedConcepts,
  PHYSICS_CONCEPTS,
  CHEMISTRY_CONCEPTS,
  ALL_SUBJECT_CONCEPTS,
} from '../concept-to-template';

// ── Physics Engine Facade (backward compatible) ────────────────────────────
export {
  computePhysics,
  getEngine,
  type PhysicsState,
  type ForceArrow,
  type PhysicsVisualization,
  type PhysicsResult,
  type PhysicsEngine,
} from '../physics-engine';

// ── Validation Facade (backward compatible) ────────────────────────────────
export {
  validateWithKnowledge,
  checkParamRanges,
  checkPhenomenon,
  checkFormulas,
  checkDimensions,
  type CheckLevel,
  type ValidationReport,
  type ValidationOutput,
} from '../schema-validator';
