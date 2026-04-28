/**
 * Physics Engine Adapters — Declarative formula-driven computation
 *
 * Replaces the imperative PhysicsRules.calculate() function.
 * Each adapter interprets declarative formulas from ExperimentSchema.physics
 * and produces computed results, state, and visualization hints.
 *
 * Architecture decision: DEC-3 (declarative formulas + engine adapters)
 *
 * NOTE (T-1 Capability Atomization):
 * Engine implementations have been extracted to standalone capability files
 * under src/lib/engines/. This file retains adapter/wrapper functions
 * (computePhysics, getEngine) for backward compatibility with existing callers.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import type { PhysicsConfig, PhysicsEngineType } from './experiment-schema';

import { BuoyancyEngine as BuoyancyCapability } from './engines/physics/buoyancy';
import { LeverEngine as LeverCapability } from './engines/physics/lever';
import { RefractionEngine as RefractionCapability } from './engines/physics/refraction';
import { CircuitEngine as CircuitCapability } from './engines/physics/circuit';
import { GenericEngine as GenericCapability } from './engines/generic';

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

// ============ Capability Adapters ============
// Each adapter wraps an IExperimentEngine (capability) back into the
// legacy PhysicsEngine interface for backward compatibility.

class BuoyancyEngine implements PhysicsEngine {
  private capability = new BuoyancyCapability();

  compute(params: Record<string, number>, _config: PhysicsConfig): PhysicsResult {
    const r = this.capability.compute(params);
    const v = r.values as Record<string, number>;
    return {
      results: {
        buoyantForce: v.buoyantForce * 1000,
        gravity: v.gravity * 1000,
        densityRatio: v.immersionRatio * 100,
        immersionRatio: v.immersionRatio * 100,
        netForce: v.netForce * 1000,
      },
      state: (r.state === '上浮' ? 'floating' : r.state === '下沉' ? 'sinking' : 'suspended') as PhysicsState,
      explanation: r.explanation ?? '',
      visualization: { objectImmersionRatio: v.immersionRatio },
    };
  }
}

class LeverEngine implements PhysicsEngine {
  private capability = new LeverCapability();

  compute(params: Record<string, number>, _config: PhysicsConfig): PhysicsResult {
    const r = this.capability.compute(params);
    const v = r.values as Record<string, number>;
    return {
      results: {
        leftTorque: v.leftTorque,
        rightTorque: v.rightTorque,
        torqueDifference: v.torqueDifference,
      },
      state: (r.state ?? 'normal') as PhysicsState,
      explanation: r.explanation ?? '',
      visualization: {},
    };
  }
}

class RefractionEngine implements PhysicsEngine {
  private capability = new RefractionCapability();

  compute(params: Record<string, number>, _config: PhysicsConfig): PhysicsResult {
    const r = this.capability.compute(params);
    const v = r.values as Record<string, number>;
    return {
      results: {
        refractionAngle: v.refractionAngle,
        incidentAngle: v.incidentAngle,
        criticalAngle: v.criticalAngle,
        isTotalReflection: v.isTotalReflection,
        n1: v.n1,
        n2: v.n2,
      },
      state: (r.state ?? 'normal') as PhysicsState,
      explanation: r.explanation ?? '',
      visualization: {},
    };
  }
}

class CircuitEngine implements PhysicsEngine {
  private capability = new CircuitCapability();

  compute(params: Record<string, number>, _config: PhysicsConfig): PhysicsResult {
    const r = this.capability.compute(params);
    const v = r.values as Record<string, number>;
    return {
      results: {
        voltage: v.voltage,
        resistance: v.resistance,
        current: v.current,
        power: v.power,
      },
      state: (r.state === 'shortCircuit' ? 'normal' : (r.state ?? 'normal')) as PhysicsState,
      explanation: r.explanation ?? '',
      visualization: {},
    };
  }
}

class GenericEngine implements PhysicsEngine {
  private capability = new GenericCapability();

  compute(params: Record<string, number>, config: PhysicsConfig): PhysicsResult {
    const r = this.capability.compute(params, { computedParams: config.computedParams?.map(cp => ({ name: cp.name, formula: cp.formula })) });
    const results: Record<string, number> = {};
    for (const [k, val] of Object.entries(r.values)) {
      if (typeof val === 'number') results[k] = val;
    }
    return {
      results,
      state: 'normal',
      explanation: r.explanation ?? '通用物理计算结果。',
      visualization: {},
    };
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
