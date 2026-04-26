/**
 * Chemistry: Reaction Rate Engine (STUB)
 *
 * Simulates reaction kinetics for a generic A → B reaction:
 * - Rate = k[A]ⁿ (simplified to n=1 for junior high)
 * - Arrhenius equation for temperature dependence: k = A·exp(-Ea/RT)
 * - Catalyst lowers Ea
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

export class ReactionRateEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'chemistry/reaction-rate',
    subject: 'chemistry',
    displayName: '化学反应速率',
    description: '探究浓度、温度、催化剂对化学反应速率的影响',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['beaker', 'text'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const temp = params.temperature ?? 25;
    const conc = params.initial_concentration ?? 1;

    if (temp < -273) errors.push({ field: 'temperature', message: '温度低于绝对零度', severity: 'error' });
    if (temp > 500) errors.push({ field: 'temperature', message: '温度过高（>500°C），注意安全', severity: 'warning' });
    if (conc <= 0) errors.push({ field: 'initial_concentration', message: '初始浓度必须大于0', severity: 'error' });

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const temp = params.temperature ?? 25;          // °C
    const tempK = temp + 273.15;                     // K
    const conc0 = params.initial_concentration ?? 1; // mol/L
    const time = params.time ?? 10;                  // s
    const catalyst = params.catalyst ?? 0;           // 0-1

    // Arrhenius: k = A·exp(-Ea/RT)
    // A = 1e10 (pre-exponential factor)
    // Ea = 75000 J/mol without catalyst, 50000 with catalyst
    const A = 1e10;
    const Ea = catalyst > 0.5 ? 50000 : 75000; // J/mol
    const R = 8.314;

    const k = A * Math.exp(-Ea / (R * tempK));
    const rate = k * conc0;

    // For first-order: [A] = [A]₀·exp(-kt)
    const conc = conc0 * Math.exp(-k * time);
    const reacted = conc0 - conc;
    const conversion = (reacted / conc0) * 100;

    // Compare: with vs without catalyst at same conditions
    const kNoCat = A * Math.exp(-75000 / (R * tempK));
    const rateNoCat = kNoCat * conc0;
    const speedup = rateNoCat > 0 ? rate / rateNoCat : 1;

    return {
      values: {
        concentration: conc,
        initialConcentration: conc0,
        reacted,
        conversion,
        rate,
        rateConstant: k,
        temperature: temp,
        time,
        catalyst,
        speedup,
      },
      state: conversion > 90 ? '反应完全' : conversion > 50 ? '反应过半' : conversion > 10 ? '反应进行' : '反应开始',
      explanation: `[STUB] ${temp}°C，初始浓度 ${conc0}M，${time}s：速率常数 k=${k.toExponential(2)}，已转化 ${conversion.toFixed(1)}%。催化剂提速 ${speedup.toFixed(1)} 倍。`,
      trace: {
        rate: { formula: 'k × [A]₀', inputs: { k, conc0 }, result: rate },
        concentration: { formula: '[A]₀·exp(-kt)', inputs: { conc0, k, time }, result: conc },
      },
    };
  }
}

const reactionRateEngine = new ReactionRateEngine();
export default reactionRateEngine;