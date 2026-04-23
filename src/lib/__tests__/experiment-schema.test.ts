import {
  createDefaultSchema,
  createBuoyancyExperiment,
  createLeverExperiment,
  createRefractionExperiment,
  createCircuitExperiment,
  validateSchema,
  enrichSchema,
  fillDefaultValues,
} from '../experiment-schema';

describe('createDefaultSchema', () => {
  it('returns a schema with required fields', () => {
    const schema = createDefaultSchema();
    expect(schema.meta.name).toBe('未命名实验');
    expect(schema.meta.subject).toBe('physics');
    expect(schema.params).toEqual([]);
    expect(schema.formulas).toEqual([]);
    expect(schema.canvas.layout.width).toBe(560);
    expect(schema.canvas.layout.height).toBe(280);
    expect(schema.physics.engine).toBe('generic');
  });

  it('accepts meta overrides', () => {
    const schema = createDefaultSchema({ name: '测试实验', physicsType: 'buoyancy' });
    expect(schema.meta.name).toBe('测试实验');
    expect(schema.meta.physicsType).toBe('buoyancy');
    expect(schema.physics.engine).toBe('buoyancy');
  });
});

describe('validateSchema', () => {
  it('passes for a valid buoyancy schema', () => {
    const schema = createBuoyancyExperiment();
    const result = validateSchema(schema);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when meta.name is missing', () => {
    const schema = createDefaultSchema();
    schema.meta.name = '';
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('meta.name is required');
  });

  it('fails when no input params', () => {
    const schema = createDefaultSchema();
    schema.formulas = [{ name: 'test', expression: 'x=1', description: '', variables: [], resultVariable: 'x' }];
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('input param'))).toBe(true);
  });

  it('fails when formulas is empty', () => {
    const schema = createBuoyancyExperiment();
    schema.formulas = [];
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('at least one formula is required');
  });

  it('fails when param min >= max', () => {
    const schema = createBuoyancyExperiment();
    schema.params[0].min = 100;
    schema.params[0].max = 50;
    const result = validateSchema(schema);
    expect(result.valid).toBe(false);
  });
});

describe('enrichSchema', () => {
  it('fills canvas from buoyancy template when canvas.elements is empty', () => {
    const partial = createDefaultSchema({ physicsType: 'buoyancy', name: '浮力测试' });
    const enriched = enrichSchema(partial);
    expect(enriched.meta.name).toBe('浮力测试');
    expect(enriched.physics.engine).toBe('buoyancy');
    expect(enriched.interactions?.sliders?.length).toBeGreaterThan(0);
  });

  it('preserves user-provided params over template', () => {
    const schema = createBuoyancyExperiment();
    schema.params[0].defaultValue = 999;
    const enriched = enrichSchema(schema);
    expect(enriched.params[0].defaultValue).toBe(999);
  });
});

describe('fillDefaultValues', () => {
  it('fills missing fields with defaults', () => {
    const filled = fillDefaultValues({ meta: { name: '测试', subject: 'physics', topic: '力学', description: '', icon: '🔬', gradient: 'from-blue-500 to-cyan-500', physicsType: 'generic' } });
    expect(filled.params).toEqual([]);
    expect(filled.formulas).toEqual([]);
    expect(filled.canvas.layout.width).toBe(560);
  });
});

describe('preset experiment factories', () => {
  it('createBuoyancyExperiment returns valid schema', () => {
    const schema = createBuoyancyExperiment();
    expect(validateSchema(schema).valid).toBe(true);
    expect(schema.meta.physicsType).toBe('buoyancy');
    expect(schema.scenes?.length).toBeGreaterThan(0);
  });

  it('createLeverExperiment returns valid schema', () => {
    const schema = createLeverExperiment();
    expect(validateSchema(schema).valid).toBe(true);
    expect(schema.meta.physicsType).toBe('lever');
  });

  it('createRefractionExperiment returns valid schema', () => {
    const schema = createRefractionExperiment();
    expect(validateSchema(schema).valid).toBe(true);
    expect(schema.meta.physicsType).toBe('refraction');
  });

  it('createCircuitExperiment returns valid schema', () => {
    const schema = createCircuitExperiment();
    expect(validateSchema(schema).valid).toBe(true);
    expect(schema.meta.physicsType).toBe('circuit');
  });
});
