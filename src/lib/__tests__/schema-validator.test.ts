import {
  checkParamRanges,
  checkPhenomenon,
  checkFormulas,
  checkDimensions,
  validateWithKnowledge,
} from '../schema-validator';
import { createBuoyancyExperiment, createLeverExperiment, createRefractionExperiment, createCircuitExperiment } from '../experiment-schema';
import type { ExperimentSchema } from '../experiment-schema';

// ── Helpers ────────────────────────────────────────────────────────────────

function makeSchema(overrides: Partial<ExperimentSchema> = {}): ExperimentSchema {
  const base = createBuoyancyExperiment();
  return { ...base, ...overrides };
}

// ── checkParamRanges ───────────────────────────────────────────────────────

describe('checkParamRanges', () => {
  it('PASS: valid buoyancy params pass without changes', () => {
    const schema = createBuoyancyExperiment();
    const { results } = checkParamRanges(schema);
    expect(results.some(r => r.level === 'CRITICAL' || r.level === 'ERROR')).toBe(false);
  });

  it('CRITICAL: negative density triggers critical error', () => {
    const schema = createBuoyancyExperiment();
    schema.params[0].defaultValue = -100;
    const { results } = checkParamRanges(schema);
    expect(results.some(r => r.level === 'CRITICAL' && r.param === 'rho_object')).toBe(true);
  });

  it('ERROR: min >= max triggers error', () => {
    const schema = createBuoyancyExperiment();
    schema.params[0].min = 1000;
    schema.params[0].max = 500;
    const { results } = checkParamRanges(schema);
    expect(results.some(r => r.level === 'ERROR')).toBe(true);
  });

  it('autoFixed: defaultValue outside range is clamped', () => {
    const schema = createBuoyancyExperiment();
    schema.params[0].defaultValue = 99999; // above max 22590
    const { schema: fixed, results } = checkParamRanges(schema);
    const fixedResult = results.find(r => r.autoFixed === true);
    expect(fixedResult).toBeDefined();
    expect(fixed.params[0].defaultValue).toBeLessThanOrEqual(22590);
  });

  it('PASS: refraction params with valid values', () => {
    const schema = createRefractionExperiment();
    const { results } = checkParamRanges(schema);
    expect(results.some(r => r.level === 'CRITICAL')).toBe(false);
  });
});

// ── checkPhenomenon ────────────────────────────────────────────────────────

describe('checkPhenomenon', () => {
  it('PASS: normal buoyancy scenario passes', () => {
    const schema = createBuoyancyExperiment();
    const results = checkPhenomenon(schema);
    expect(results.some(r => r.level === 'CRITICAL' || r.level === 'ERROR')).toBe(false);
  });

  it('WARNING: object density far less than liquid (always floats)', () => {
    const schema = createBuoyancyExperiment();
    schema.params[0].defaultValue = 1;    // rho_object = 1
    schema.params[1].defaultValue = 1000; // rho_liquid = 1000
    const results = checkPhenomenon(schema);
    expect(results.some(r => r.level === 'WARNING' && r.checker === 'phenomenon')).toBe(true);
  });

  it('CRITICAL: refraction index < 1 triggers critical', () => {
    const schema = createRefractionExperiment();
    schema.params[1].defaultValue = 0.5; // n1 = 0.5 (impossible)
    const results = checkPhenomenon(schema);
    expect(results.some(r => r.level === 'CRITICAL')).toBe(true);
  });

  it('CRITICAL: circuit resistance = 0 triggers critical', () => {
    const schema = createCircuitExperiment();
    schema.params[1].defaultValue = 0; // resistance = 0
    const results = checkPhenomenon(schema);
    expect(results.some(r => r.level === 'CRITICAL')).toBe(true);
  });

  it('ERROR: lever arm <= 0 triggers error', () => {
    const schema = createLeverExperiment();
    schema.params[0].defaultValue = 0; // leftArm = 0
    const results = checkPhenomenon(schema);
    expect(results.some(r => r.level === 'ERROR')).toBe(true);
  });
});

// ── checkFormulas ──────────────────────────────────────────────────────────

describe('checkFormulas', () => {
  it('PASS: standard buoyancy formulas pass', () => {
    const schema = createBuoyancyExperiment();
    const { results } = checkFormulas(schema);
    expect(results.some(r => r.level === 'CRITICAL')).toBe(false);
  });

  it('PASS: standard circuit formulas pass', () => {
    const schema = createCircuitExperiment();
    const { results } = checkFormulas(schema);
    expect(results.some(r => r.level === 'CRITICAL')).toBe(false);
  });

  it('autoFixed: formula with missing key variables is replaced', () => {
    const schema = createCircuitExperiment();
    // Corrupt the formula: remove required variable 'resistance'
    schema.formulas[0].variables = ['voltage']; // missing 'resistance'
    const { schema: fixed, results } = checkFormulas(schema);
    const fixedResult = results.find(r => r.autoFixed === true);
    expect(fixedResult).toBeDefined();
    // After fix, variables should include resistance
    expect(fixed.formulas[0].variables).toContain('resistance');
  });

  it('PASS: generic physicsType skips formula check', () => {
    const schema = createBuoyancyExperiment();
    schema.meta.physicsType = 'generic';
    const { results } = checkFormulas(schema);
    expect(results[0].level).toBe('PASS');
  });
});

// ── checkDimensions ────────────────────────────────────────────────────────

describe('checkDimensions', () => {
  it('PASS: standard circuit params pass dimension check', () => {
    const schema = createCircuitExperiment();
    const results = checkDimensions(schema);
    expect(results.some(r => r.level === 'CRITICAL')).toBe(false);
  });

  it('WARNING: force param with kg unit triggers warning', () => {
    const schema = createBuoyancyExperiment();
    schema.params.push({
      name: 'buoyantForce',
      label: '浮力',
      unit: 'kg',  // wrong: should be N
      defaultValue: 10,
      min: 0,
      max: 100,
      step: 1,
      category: 'computed',
      description: '浮力大小',
    });
    const results = checkDimensions(schema);
    expect(results.some(r => r.level === 'WARNING' && r.param === 'buoyantForce')).toBe(true);
  });

  it('PASS: params without unit are skipped', () => {
    const schema = createRefractionExperiment();
    // n1 and n2 have empty unit — should not cause errors
    const results = checkDimensions(schema);
    expect(results.some(r => r.level === 'CRITICAL' || r.level === 'ERROR')).toBe(false);
  });
});

// ── validateWithKnowledge (integration) ───────────────────────────────────

describe('validateWithKnowledge', () => {
  it('PASS: valid buoyancy schema passes all checks', () => {
    const schema = createBuoyancyExperiment();
    const { report } = validateWithKnowledge(schema, '浮力');
    expect(report.criticalCount).toBe(0);
    expect(report.fallbackUsed).toBe(false);
  });

  it('fallback triggered on critical error', () => {
    const schema = createRefractionExperiment();
    schema.params[1].defaultValue = 0.3; // n1 < 1 → CRITICAL
    const { report } = validateWithKnowledge(schema, '折射');
    expect(report.criticalCount).toBeGreaterThan(0);
    expect(report.fallbackUsed).toBe(true);
    expect(report.fallbackReason).toBeDefined();
  });

  it('fail-safe: corrupted schema does not throw', () => {
    const broken = {} as ExperimentSchema;
    expect(() => validateWithKnowledge(broken)).not.toThrow();
  });

  it('report contains all 4 checker results', () => {
    const schema = createCircuitExperiment();
    const { report } = validateWithKnowledge(schema);
    const checkers = new Set(report.checks.map(c => c.checker));
    expect(checkers.has('paramRanges')).toBe(true);
    expect(checkers.has('phenomenon')).toBe(true);
    expect(checkers.has('formulas')).toBe(true);
    expect(checkers.has('dimensions')).toBe(true);
  });

  it('autoFixed params are preserved in returned schema', () => {
    const schema = createBuoyancyExperiment();
    schema.params[0].defaultValue = 99999; // will be clamped
    const { schema: fixed, report } = validateWithKnowledge(schema, '浮力');
    expect(fixed.params[0].defaultValue).toBeLessThanOrEqual(22590);
    expect(report.warningCount).toBeGreaterThan(0);
  });

  it('PASS: valid lever schema passes all checks', () => {
    const schema = createLeverExperiment();
    const { report } = validateWithKnowledge(schema, '杠杆');
    expect(report.criticalCount).toBe(0);
    expect(report.fallbackUsed).toBe(false);
  });
});
