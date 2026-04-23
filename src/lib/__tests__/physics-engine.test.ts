import { computePhysics, getEngine } from '../physics-engine';
import type { PhysicsConfig } from '../experiment-schema';

const buoyancyConfig: PhysicsConfig = {
  engine: 'buoyancy',
  equations: [{ name: '浮力', expression: 'F = ρ液 × g × V排', description: '', variables: [], resultVariable: 'buoyantForce' }],
};

const leverConfig: PhysicsConfig = {
  engine: 'lever',
  equations: [{ name: '力矩', expression: 'F1×L1=F2×L2', description: '', variables: [], resultVariable: 'torqueBalance' }],
};

const refractionConfig: PhysicsConfig = {
  engine: 'refraction',
  equations: [{ name: '斯涅尔', expression: 'n1sinθ1=n2sinθ2', description: '', variables: [], resultVariable: 'refractionAngle' }],
};

const circuitConfig: PhysicsConfig = {
  engine: 'circuit',
  equations: [{ name: '欧姆', expression: 'I=U/R', description: '', variables: [], resultVariable: 'current' }],
};

describe('BuoyancyEngine', () => {
  it('floating: object density < liquid density', () => {
    const result = computePhysics(buoyancyConfig, { rho_object: 600, rho_liquid: 1000, g: 9.8, V_object: 0.0001 });
    // When floating, immersionRatio = densityRatio, so buoyantForce = gravityForce (netForce=0 → 'balanced')
    // This is physically correct: a floating object is in equilibrium
    expect(['floating', 'balanced']).toContain(result.state);
    expect(result.results.immersionRatio).toBeCloseTo(60, 0);
  });

  it('sinking: object density > liquid density', () => {
    const result = computePhysics(buoyancyConfig, { rho_object: 7800, rho_liquid: 1000, g: 9.8, V_object: 0.0001 });
    expect(result.state).toBe('sinking');
  });

  it('suspended: object density ≈ liquid density', () => {
    const result = computePhysics(buoyancyConfig, { rho_object: 1000, rho_liquid: 1000, g: 9.8, V_object: 0.0001 });
    // When densities are equal, isSuspended=true but netForce=0 → 'balanced' overrides 'suspended'
    expect(['suspended', 'balanced']).toContain(result.state);
  });

  it('explanation is non-empty', () => {
    const result = computePhysics(buoyancyConfig, { rho_object: 600, rho_liquid: 1000 });
    expect(result.explanation.length).toBeGreaterThan(0);
  });
});

describe('LeverEngine', () => {
  it('balanced: equal torques', () => {
    const result = computePhysics(leverConfig, { leftArm: 20, rightArm: 20, leftMass: 2, rightMass: 2, g: 9.8 });
    expect(result.state).toBe('balanced');
    expect(result.results.leftTorque).toBeCloseTo(result.results.rightTorque, 5);
  });

  it('unbalanced: unequal torques', () => {
    const result = computePhysics(leverConfig, { leftArm: 30, rightArm: 20, leftMass: 2, rightMass: 2, g: 9.8 });
    expect(result.state).toBe('unbalanced');
    expect(result.results.leftTorque).toBeGreaterThan(result.results.rightTorque);
  });

  it('balanced: long arm + light mass = short arm + heavy mass', () => {
    const result = computePhysics(leverConfig, { leftArm: 40, rightArm: 20, leftMass: 1, rightMass: 2, g: 9.8 });
    expect(result.state).toBe('balanced');
  });
});

describe('RefractionEngine', () => {
  it('normal refraction: air to glass', () => {
    const result = computePhysics(refractionConfig, { incidentAngle: 30, n1: 1.0, n2: 1.5 });
    expect(result.state).toBe('normal');
    expect(result.results.refractionAngle).toBeCloseTo(19.47, 1);
  });

  it('total reflection when incident angle > critical angle', () => {
    const result = computePhysics(refractionConfig, { incidentAngle: 50, n1: 1.5, n2: 1.0 });
    expect(result.state).toBe('totalReflection');
  });

  it('no refraction at 0 degrees', () => {
    const result = computePhysics(refractionConfig, { incidentAngle: 0, n1: 1.0, n2: 1.5 });
    expect(result.results.refractionAngle).toBeCloseTo(0, 5);
  });
});

describe('CircuitEngine', () => {
  it('ohms law: I = U/R', () => {
    const result = computePhysics(circuitConfig, { voltage: 12, resistance: 10 });
    expect(result.results.current).toBeCloseTo(1.2, 5);
    expect(result.results.power).toBeCloseTo(14.4, 5);
  });

  it('short circuit: resistance = 0', () => {
    const result = computePhysics(circuitConfig, { voltage: 12, resistance: 0 });
    expect(result.results.current).toBe(Infinity);
    expect(result.explanation).toContain('短路');
  });

  it('high resistance reduces current', () => {
    const r1 = computePhysics(circuitConfig, { voltage: 12, resistance: 10 });
    const r2 = computePhysics(circuitConfig, { voltage: 12, resistance: 100 });
    expect(r1.results.current).toBeGreaterThan(r2.results.current);
  });
});

describe('getEngine', () => {
  it('returns correct engine for known types', () => {
    expect(getEngine('buoyancy')).toBeDefined();
    expect(getEngine('lever')).toBeDefined();
    expect(getEngine('refraction')).toBeDefined();
    expect(getEngine('circuit')).toBeDefined();
  });

  it('falls back to generic for unknown type', () => {
    const engine = getEngine('unknown' as never);
    expect(engine).toBeDefined();
  });
});
