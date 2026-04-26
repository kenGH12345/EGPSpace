/**
 * Schema Enricher — Auto-complete ExperimentSchema from templates
 *
 * When LLM generates a partial Schema (only meta+params+formulas+teaching),
 * this module auto-fills canvas, physics, interactions, and scenes based on
 * the physicsType field.
 *
 * Architecture: Layer design — LLM generates core layer, system fills default layer.
 */

import type {
  ExperimentSchema,
  PhysicsConfig,
  PhysicsEngineType,
  ComputedParam,
  SliderConfig,
} from './experiment-schema';
import {
  createBuoyancyExperiment,
  createLeverExperiment,
  createRefractionExperiment,
  createCircuitExperiment,
  createDefaultSchema,
  createAcidBaseTitrationExperiment,
  createElectrolysisExperiment,
  createReactionRateExperiment,
  createCombustionExperiment,
} from './experiment-schema';

// ============ Template Registry ============

const TEMPLATES: Record<string, () => ExperimentSchema> = {
  buoyancy: createBuoyancyExperiment,
  lever: createLeverExperiment,
  refraction: createRefractionExperiment,
  circuit: createCircuitExperiment,
  // Chemistry experiments (Phase 2 — Unified Schema)
  'acid-base-titration': createAcidBaseTitrationExperiment,
  electrolysis: createElectrolysisExperiment,
  'reaction-rate': createReactionRateExperiment,
  combustion: createCombustionExperiment,
};

// ============ Enrichment Logic ============

export function enrichFromTemplate(schema: ExperimentSchema): ExperimentSchema {
  const physicsType = schema.meta.physicsType;
  const templateFactory = TEMPLATES[physicsType];

  if (!templateFactory) {
    return enrichGeneric(schema);
  }

  const template = templateFactory();

  return {
    meta: { ...template.meta, ...schema.meta },
    params: schema.params.length > 0 ? schema.params : template.params,
    formulas: schema.formulas.length > 0 ? schema.formulas : template.formulas,
    canvas: {
      layout: schema.canvas?.layout ?? template.canvas.layout,
      elements: (schema.canvas?.elements?.length ?? 0) > 0 ? schema.canvas.elements : template.canvas.elements,
      presetTemplate: schema.canvas?.presetTemplate ?? template.canvas.presetTemplate ?? physicsType,
    },
    physics: mergePhysics(schema.physics, template.physics),
    interactions: schema.interactions ?? template.interactions,
    teaching: { ...template.teaching, ...schema.teaching },
    scenes: schema.scenes?.length ? schema.scenes : template.scenes,
  };
}

function mergePhysics(schema: PhysicsConfig, template: PhysicsConfig): PhysicsConfig {
  return {
    engine: schema.engine ?? template.engine,
    equations: schema.equations.length > 0 ? schema.equations : template.equations,
    constraints: schema.constraints ?? template.constraints,
    computedParams: schema.computedParams ?? template.computedParams,
  };
}

function enrichGeneric(schema: ExperimentSchema): ExperimentSchema {
  const defaults = createDefaultSchema({ physicsType: 'generic' });

  return {
    meta: schema.meta,
    params: schema.params.length > 0 ? schema.params : defaults.params,
    formulas: schema.formulas.length > 0 ? schema.formulas : defaults.formulas,
    canvas: {
      layout: schema.canvas?.layout ?? defaults.canvas.layout,
      elements: schema.canvas?.elements ?? defaults.canvas.elements,
      presetTemplate: schema.canvas?.presetTemplate,
    },
    physics: {
      engine: 'generic',
      equations: schema.physics.equations.length > 0 ? schema.physics.equations : [],
      constraints: schema.physics.constraints,
      computedParams: schema.physics.computedParams,
    },
    interactions: schema.interactions ?? generateSlidersFromParams(schema.params),
    teaching: schema.teaching ?? {},
    scenes: schema.scenes ?? [],
  };
}

// ============ Auto-generation Helpers ============

export function generateSlidersFromParams(params: ExperimentSchema['params']): { sliders: SliderConfig[] } {
  const sliders = params
    .filter(p => p.category === 'input')
    .map(p => ({
      param: p.name,
      label: p.label,
      min: p.min,
      max: p.max,
      step: p.step,
      unit: p.unit,
    }));

  return { sliders };
}

export function generateComputedParamsFromFormulas(
  formulas: ExperimentSchema['formulas']
): ComputedParam[] {
  return formulas.map(f => ({
    name: f.resultVariable,
    formula: f.expression,
    dependsOn: f.variables,
  }));
}

// ============ Full Enrichment Pipeline ============

export function enrichSchema(schema: Partial<ExperimentSchema>): ExperimentSchema {
  const defaults = createDefaultSchema(schema.meta);
  const partial: ExperimentSchema = {
    meta: defaults.meta,
    params: schema.params ?? defaults.params,
    formulas: schema.formulas ?? defaults.formulas,
    canvas: schema.canvas ?? defaults.canvas,
    physics: schema.physics ?? defaults.physics,
    interactions: schema.interactions,
    teaching: schema.teaching,
    scenes: schema.scenes,
  };

  return enrichFromTemplate(partial);
}
