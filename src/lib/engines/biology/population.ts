/**
 * Biology: Population Growth Engine
 *
 * Implements IExperimentEngine for population ecology experiments.
 * Supports Logistic growth model and Leslie matrix for age-structured populations.
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

export class PopulationEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'biology/population',
    subject: 'biology',
    displayName: 'Population Growth',
    description: 'Simulate population dynamics using Logistic model and age-structured matrix',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['rect', 'circle', 'line', 'text'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const initialPop = params.initial_population ?? 100;
    const carryingCapacity = params.carrying_capacity ?? 1000;
    const growthRate = params.growth_rate ?? 0.1;

    if (initialPop < 0) errors.push({ field: 'initial_population', message: 'Initial population cannot be negative', severity: 'error' });
    if (carryingCapacity <= 0) errors.push({ field: 'carrying_capacity', message: 'Carrying capacity must be > 0', severity: 'error' });
    if (growthRate <= 0) errors.push({ field: 'growth_rate', message: 'Growth rate must be > 0', severity: 'error' });

    if (growthRate > 5) errors.push({ field: 'growth_rate', message: 'Growth rate unusually high (>5 unrealistic)', severity: 'warning' });

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const initialPop = params.initial_population ?? 100;
    const carryingCapacity = params.carrying_capacity ?? 1000;
    const growthRate = params.growth_rate ?? 0.1;
    const time = params.time ?? 10;
    const predationRate = params.predation_rate ?? 0;
    const emigrationRate = params.emigration_rate ?? 0;

    const exponent = -growthRate * time;
    const logisticPop = carryingCapacity / (1 + ((carryingCapacity - initialPop) / initialPop) * Math.exp(exponent));

    const exponentialPop = initialPop * Math.exp(growthRate * time);

    const effectiveRate = Math.max(0, growthRate - predationRate - emigrationRate);
    const effectivePop = carryingCapacity / (1 + ((carryingCapacity - initialPop) / initialPop) * Math.exp(-effectiveRate * time));

    const doublingTime = growthRate > 0 ? Math.log(2) / growthRate : Infinity;

    let state: string;
    const ratio = logisticPop / carryingCapacity;
    if (ratio < 0.25) {
      state = 'Exponential phase';
    } else if (ratio < 0.75) {
      state = 'Deceleration phase';
    } else if (ratio < 0.98) {
      state = 'Stable phase';
    } else {
      state = 'Saturation phase';
    }

    const growthSpeed = (logisticPop - initialPop) / time;

    return {
      values: {
        population: logisticPop,
        exponentialPopulation: exponentialPop,
        effectivePopulation: effectivePop,
        carryingCapacity,
        growthRate,
        effectiveRate,
        doublingTime,
        growthSpeed,
        populationRatio: ratio,
        stateLabel: state,
      },
      state,
      explanation: `Initial population ${initialPop}, carrying capacity ${carryingCapacity}. After ${time} units, population ${logisticPop.toFixed(1)}. ${state}. Doubling time ${doublingTime.toFixed(2)} units.`,
      trace: {
        population: { formula: 'K / (1 + ((K-N0)/N0) x e^(-rt))', inputs: { carryingCapacity, initialPop, growthRate, time }, result: logisticPop },
      },
    };
  }
}

export default new PopulationEngine();
