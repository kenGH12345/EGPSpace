/**
 * Chemistry: Iron Rusting Engine (STUB)
 *
 * Simulates iron nail rusting under different conditions:
 * - Dry air (no rust)
 * - Water + air (moderate rust)
 * - Salt water + air (fast rust)
 *
 * Tracked: rustLevel (0-100%), days elapsed, oxygen concentration
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

export class IronRustingEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'chemistry/iron-rusting',
    subject: 'chemistry',
    displayName: '铁生锈条件探究',
    description: '探究铁生锈的条件：水分、氧气、电解质对锈蚀速率的影响',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['beaker', 'text'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const days = params.days ?? 7;
    const o2 = params.oxygen_concentration ?? 21;

    if (days < 0) errors.push({ field: 'days', message: '天数不能为负数', severity: 'error' });
    if (days > 365) errors.push({ field: 'days', message: '模拟天数超过一年，结果可能不准确', severity: 'warning' });
    if (o2 < 0 || o2 > 100) errors.push({ field: 'oxygen_concentration', message: '氧气浓度应在 0-100% 范围内', severity: 'error' });

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const days = params.days ?? 7;
    const o2 = (params.oxygen_concentration ?? 21) / 100;
    const hasWater = params.has_water ?? 1;
    const hasSalt = params.has_salt ?? 0;
    const temperature = params.temperature ?? 25;

    // Rusting rate model (simplified):
    // baseRate = 0.5%/day at 25°C, 21% O2, with water
    // No water → rate ≈ 0
    // Salt doubles the rate
    // O2 proportional
    // Temperature: Arrhenius-like, doubled per 10°C

    let baseRate = 0.5; // % per day
    if (!hasWater) baseRate = 0.02; // trace rust in dry air
    if (hasSalt) baseRate *= 2.5;

    const tempFactor = Math.pow(2, (temperature - 25) / 10);
    const o2Factor = o2 / 0.21;

    const rate = baseRate * tempFactor * o2Factor;
    const rustLevel = Math.min(100, rate * days);

    // Three test tubes: dry, water, salt water
    const rustDry = Math.min(100, 0.02 * tempFactor * o2Factor * days);
    const rustWater = Math.min(100, 0.5 * tempFactor * o2Factor * days);
    const rustSalt = Math.min(100, 1.25 * tempFactor * o2Factor * days);

    return {
      values: {
        rustLevel,
        rustDry,
        rustWater,
        rustSalt,
        rate,
        days,
        temperature,
        oxygenConcentration: o2 * 100,
      },
      state: rustLevel > 80 ? '严重锈蚀' : rustLevel > 30 ? '明显锈蚀' : rustLevel > 5 ? '轻微锈蚀' : '几乎无锈',
      explanation: `[STUB] ${days}天，${temperature}°C，氧气${(o2 * 100).toFixed(0)}%：干燥试管${rustDry.toFixed(1)}%，水试管${rustWater.toFixed(1)}%，盐水试管${rustSalt.toFixed(1)}%锈蚀。`,
      trace: {
        rustLevel: { formula: 'rate × days', inputs: { rate, days }, result: rustLevel },
      },
    };
  }
}

const ironRustingEngine = new IronRustingEngine();
export default ironRustingEngine;