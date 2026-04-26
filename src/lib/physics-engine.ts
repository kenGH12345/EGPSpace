/**
 * Physics Engine Adapters — Declarative formula-driven computation
 *
 * Replaces the imperative PhysicsRules.calculate() function.
 * Each adapter interprets declarative formulas from ExperimentSchema.physics
 * and produces computed results, state, and visualization hints.
 *
 * Architecture decision: DEC-3 (declarative formulas + engine adapters)
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PhysicsConfig, PhysicsEngineType } from './experiment-schema';

// ============ Result Types ============

export type PhysicsState =
  | 'floating' | 'sinking' | 'suspended' | 'balanced'
  | 'unbalanced' | 'normal'
  | 'totalReflection';

export interface ForceArrow {
  direction: 'up' | 'down';
  magnitude: number;
  label: string;
}

export interface PhysicsVisualization {
  objectY?: number;
  objectImmersionRatio?: number;
  forceArrows?: ForceArrow[];
}

export interface PhysicsResult {
  results: Record<string, number>;
  state: PhysicsState;
  explanation: string;
  visualization: PhysicsVisualization;
}

// ============ Engine Interface ============

export interface PhysicsEngine {
  compute(params: Record<string, number>, config: PhysicsConfig): PhysicsResult;
}

// ============ Buoyancy Engine ============

class BuoyancyEngine implements PhysicsEngine {
  compute(params: Record<string, number>, _config: PhysicsConfig): PhysicsResult {
    const rawObjectDensity =
      params.objectDensity ?? params.object_density ?? params.rho_object ?? params.density ?? 800;
    const objectDensity = typeof rawObjectDensity === 'number' ? rawObjectDensity : 800;

    const liquidDensity =
      params.liquidDensity ?? params.liquid_density ?? params.rho_liquid ?? 1000;

    const g = params.g ?? 9.8;
    const objectVolume =
      params.objectVolume ?? params.object_volume ?? params.V_object ?? params.volume ?? 0.0001;

    const densityRatio = objectDensity / liquidDensity;
    const isFloating = densityRatio < 1;
    const isSinking = densityRatio > 1;
    const isSuspended = Math.abs(densityRatio - 1) < 0.01;

    let immersionRatio: number;
    if (isFloating) {
      immersionRatio = densityRatio;
    } else {
      immersionRatio = 1;
    }
    immersionRatio = Math.max(0, Math.min(1, immersionRatio));

    const buoyantForce = liquidDensity * g * objectVolume * immersionRatio;
    const gravityForce = objectDensity * g * objectVolume;
    const netForce = buoyantForce - gravityForce;

    let state: PhysicsState = 'suspended';
    if (isFloating) state = 'floating';
    if (isSinking) state = 'sinking';
    if (isSuspended) state = 'suspended';
    if (Math.abs(netForce) < 0.001) state = 'balanced';

    let explanation = '';
    if (state === 'floating') {
      explanation = `物体密度(${objectDensity.toFixed(0)}kg/m³) < 液体密度(${liquidDensity.toFixed(0)}kg/m³)，物体上浮至平衡位置。`;
      explanation += ` 浸入比例由密度比自动决定：ρ物/ρ液 = ${densityRatio.toFixed(2)}，即 ${(densityRatio * 100).toFixed(1)}% 浸入。`;
    } else if (state === 'sinking') {
      explanation = `物体密度(${objectDensity.toFixed(0)}kg/m³) > 液体密度(${liquidDensity.toFixed(0)}kg/m³)，物体下沉。`;
      explanation += ` 浮力(${buoyantForce.toFixed(3)}N) < 重力(${gravityForce.toFixed(3)}N)。`;
    } else if (state === 'suspended') {
      explanation = '物体密度 ≈ 液体密度，物体悬浮在任意位置。';
    } else {
      explanation = '物体处于平衡状态，浮力 ≈ 重力。';
    }

    return {
      results: {
        buoyantForce: buoyantForce * 1000,
        gravity: gravityForce * 1000,
        densityRatio: densityRatio * 100,
        immersionRatio: immersionRatio * 100,
        netForce: netForce * 1000,
      },
      state,
      explanation,
      visualization: { objectImmersionRatio: immersionRatio },
    };
  }
}

// ============ Lever Engine ============

class LeverEngine implements PhysicsEngine {
  compute(params: Record<string, number>, _config: PhysicsConfig): PhysicsResult {
    const leftArm = params.leftArm ?? 20;
    const rightArm = params.rightArm ?? 20;
    const leftMass = params.leftMass ?? 2;
    const rightMass = params.rightMass ?? 2;
    const g = params.g ?? 9.8;

    const leftTorque = leftMass * g * leftArm;
    const rightTorque = rightMass * g * rightArm;
    const isBalanced = Math.abs(leftTorque - rightTorque) < 0.01;

    const state: PhysicsState = isBalanced ? 'balanced' : 'unbalanced';

    let explanation = '';
    if (isBalanced) {
      explanation = `左力矩(${leftTorque.toFixed(2)}N·cm) = 右力矩(${rightTorque.toFixed(2)}N·cm)，杠杆平衡。`;
    } else {
      const heavier = leftTorque > rightTorque ? '左' : '右';
      explanation = `左力矩(${leftTorque.toFixed(2)}N·cm) ≠ 右力矩(${rightTorque.toFixed(2)}N·cm)，${heavier}侧更重，杠杆${heavier}倾。`;
    }

    return {
      results: {
        leftTorque,
        rightTorque,
        torqueDifference: Math.abs(leftTorque - rightTorque),
      },
      state,
      explanation,
      visualization: {},
    };
  }
}

// ============ Refraction Engine ============

class RefractionEngine implements PhysicsEngine {
  compute(params: Record<string, number>, _config: PhysicsConfig): PhysicsResult {
    const incidentAngle = params.incidentAngle ?? 30;
    const n1 = params.n1 ?? 1.0;
    const n2 = params.n2 ?? 1.5;

    const incidentRad = (incidentAngle * Math.PI) / 180;
    const sinRefracted = (n1 / n2) * Math.sin(incidentRad);

    const isTotalReflection = sinRefracted > 1;
    let refractionAngle: number;
    let state: PhysicsState = 'normal';

    if (isTotalReflection) {
      refractionAngle = incidentAngle;
      state = 'totalReflection';
    } else {
      refractionAngle = (Math.asin(sinRefracted) * 180) / Math.PI;
    }

    const criticalAngle = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : 90;

    let explanation = '';
    if (isTotalReflection) {
      explanation = `入射角(${incidentAngle.toFixed(1)}°) > 临界角(${criticalAngle.toFixed(1)}°)，发生全反射。`;
    } else {
      explanation = `n₁×sin(θ₁) = n₂×sin(θ₂)，${n1.toFixed(2)}×sin(${incidentAngle.toFixed(1)}°) = ${n2.toFixed(2)}×sin(${refractionAngle.toFixed(1)}°)。`;
      if (n2 > n1) {
        explanation += ' 光从光疏介质进入光密介质，折射角 < 入射角。';
      } else {
        explanation += ' 光从光密介质进入光疏介质，折射角 > 入射角。';
      }
    }

    return {
      results: {
        refractionAngle,
        incidentAngle,
        criticalAngle,
        isTotalReflection: isTotalReflection ? 1 : 0,
        n1,
        n2,
      },
      state,
      explanation,
      visualization: {},
    };
  }
}

// ============ Circuit Engine ============

class CircuitEngine implements PhysicsEngine {
  compute(params: Record<string, number>, _config: PhysicsConfig): PhysicsResult {
    const voltage = params.voltage ?? 12;
    const resistance = params.resistance ?? 10;

    if (resistance === 0) {
      return {
        results: { voltage, resistance: 0, current: Infinity, power: Infinity },
        state: 'normal',
        explanation: '电阻为零，电路短路！电流趋于无穷大。',
        visualization: {},
      };
    }

    const current = voltage / resistance;
    const power = (voltage * voltage) / resistance;

    return {
      results: {
        voltage,
        resistance,
        current,
        power,
      },
      state: 'normal',
      explanation: `U = ${voltage.toFixed(1)}V，R = ${resistance.toFixed(1)}Ω，I = U/R = ${current.toFixed(3)}A，P = U²/R = ${power.toFixed(2)}W。`,
      visualization: {},
    };
  }
}

// ============ Generic Engine ============

class GenericEngine implements PhysicsEngine {
  compute(params: Record<string, number>, config: PhysicsConfig): PhysicsResult {
    const results: Record<string, number> = {};

    if (config.computedParams) {
      for (const cp of config.computedParams) {
        try {
          results[cp.name] = this.evaluateFormula(cp.formula, params);
        } catch {
          results[cp.name] = NaN;
        }
      }
    }

    return {
      results,
      state: 'normal',
      explanation: '通用物理计算结果。',
      visualization: {},
    };
  }

  private evaluateFormula(formula: string, params: Record<string, number>): number {
    try {
      const expr = formula
        .replace(/min\(/g, 'Math.min(')
        .replace(/max\(/g, 'Math.max(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/asin\(/g, 'Math.asin(')
        .replace(/pow\(/g, 'Math.pow(');
      const keys = Object.keys(params);
      const values = Object.values(params);
      const fn = new Function(...keys, `return ${expr};`);
      return fn(...values);
    } catch {
      return NaN;
    }
  }
}

// ============ Engine Registry ============

const ENGINES: Record<PhysicsEngineType, PhysicsEngine> = {
  // Physics
  buoyancy: new BuoyancyEngine(),
  lever: new LeverEngine(),
  refraction: new RefractionEngine(),
  circuit: new CircuitEngine(),
  generic: new GenericEngine(),
  pendulum: new GenericEngine(),
  wave: new GenericEngine(),
  // Chemistry
  acid_base: new GenericEngine(),
  electrolysis: new GenericEngine(),
  reaction_rate: new GenericEngine(),
  titration: new GenericEngine(),
  combustion: new GenericEngine(),
  // Biology
  osmosis: new GenericEngine(),
  enzyme: new GenericEngine(),
  population: new GenericEngine(),
  photosynthesis: new GenericEngine(),
  // Math
  function_graph: new GenericEngine(),
  geometry: new GenericEngine(),
  probability: new GenericEngine(),
  statistics: new GenericEngine(),
};

// ============ Public API ============

export function computePhysics(
  config: PhysicsConfig,
  paramValues: Record<string, number>
): PhysicsResult {
  const engine = ENGINES[config.engine] ?? ENGINES.generic;
  return engine.compute(paramValues, config);
}

export function getEngine(type: PhysicsEngineType): PhysicsEngine {
  return ENGINES[type] ?? ENGINES.generic;
}
