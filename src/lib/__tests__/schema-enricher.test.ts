import {
  enrichFromTemplate,
  enrichSchema,
  generateSlidersFromParams,
  generateComputedParamsFromFormulas,
} from '../schema-enricher';
import { createDefaultSchema, validateSchema } from '../experiment-schema';

describe('enrichFromTemplate', () => {
  it('fills buoyancy template when physicsType=buoyancy', () => {
    const partial = createDefaultSchema({ physicsType: 'buoyancy', name: '自定义浮力' });
    const enriched = enrichFromTemplate(partial);
    expect(enriched.meta.name).toBe('自定义浮力');
    expect(enriched.physics.engine).toBe('buoyancy');
    expect(enriched.params.length).toBeGreaterThan(0);
    expect(enriched.interactions?.sliders?.length).toBeGreaterThan(0);
    expect(enriched.scenes?.length).toBeGreaterThan(0);
  });

  it('fills lever template when physicsType=lever', () => {
    const partial = createDefaultSchema({ physicsType: 'lever' });
    const enriched = enrichFromTemplate(partial);
    expect(enriched.physics.engine).toBe('lever');
    expect(enriched.params.some(p => p.name === 'leftArm')).toBe(true);
  });

  it('fills refraction template when physicsType=refraction', () => {
    const partial = createDefaultSchema({ physicsType: 'refraction' });
    const enriched = enrichFromTemplate(partial);
    expect(enriched.physics.engine).toBe('refraction');
    expect(enriched.params.some(p => p.name === 'incidentAngle')).toBe(true);
  });

  it('fills circuit template when physicsType=circuit', () => {
    const partial = createDefaultSchema({ physicsType: 'circuit' });
    const enriched = enrichFromTemplate(partial);
    expect(enriched.physics.engine).toBe('circuit');
    expect(enriched.params.some(p => p.name === 'voltage')).toBe(true);
  });

  it('uses generic fallback for unknown physicsType', () => {
    const partial = createDefaultSchema({ physicsType: 'generic' });
    const enriched = enrichFromTemplate(partial);
    expect(enriched.physics.engine).toBe('generic');
  });

  it('preserves user-provided params over template', () => {
    const partial = createDefaultSchema({ physicsType: 'buoyancy' });
    partial.params = [{
      name: 'custom_param',
      label: '自定义参数',
      unit: 'kg',
      defaultValue: 42,
      min: 0,
      max: 100,
      step: 1,
      category: 'input',
      description: '测试参数',
    }];
    const enriched = enrichFromTemplate(partial);
    expect(enriched.params[0].name).toBe('custom_param');
    expect(enriched.params[0].defaultValue).toBe(42);
  });

  it('enriched schema passes validation', () => {
    const partial = createDefaultSchema({ physicsType: 'buoyancy' });
    const enriched = enrichFromTemplate(partial);
    const result = validateSchema(enriched);
    expect(result.valid).toBe(true);
  });
});

describe('enrichSchema (full pipeline)', () => {
  it('handles partial schema with only meta', () => {
    const enriched = enrichSchema({ meta: { name: '浮力实验', subject: 'physics', topic: '浮力', description: '', icon: '🌊', gradient: 'from-cyan-500 to-blue-500', physicsType: 'buoyancy' } });
    expect(enriched.params.length).toBeGreaterThan(0);
    expect(enriched.physics.engine).toBe('buoyancy');
  });
});

describe('generateSlidersFromParams', () => {
  it('generates sliders for input params only', () => {
    const params = [
      { name: 'a', label: 'A', unit: 'kg', defaultValue: 1, min: 0, max: 10, step: 1, category: 'input' as const, description: '' },
      { name: 'b', label: 'B', unit: 'm', defaultValue: 2, min: 0, max: 20, step: 1, category: 'computed' as const, description: '' },
    ];
    const result = generateSlidersFromParams(params);
    expect(result.sliders).toHaveLength(1);
    expect(result.sliders[0].param).toBe('a');
  });
});

describe('generateComputedParamsFromFormulas', () => {
  it('maps formulas to computed params', () => {
    const formulas = [
      { name: '浮力', expression: 'F = ρ × g × V', description: '', variables: ['rho', 'g', 'V'], resultVariable: 'buoyantForce' },
    ];
    const result = generateComputedParamsFromFormulas(formulas);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('buoyantForce');
    expect(result[0].formula).toBe('F = ρ × g × V');
  });
});
