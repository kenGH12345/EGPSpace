/**
 * Physics: Generic Engine (Capability)
 *
 * A fallback engine that evaluates user-defined formulas.
 * Supports physics, chemistry, biology, math, and any subject
 * that can be expressed as parametric formulas.
 *
 * Extracted from physics-engine.ts as part of capability atomization (T-1).
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from './interface';

export interface GenericFormulaConfig {
  computedParams?: { name: string; formula: string }[];
}

export class GenericEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'generic/formula',
    subject: 'physics',
    displayName: '通用公式引擎',
    description: '通过用户定义的数学公式计算任意参数',
    version: '1.0.0',
    capabilities: ['compute'],
    supportedElementTypes: ['rect', 'text'],
  };

  validate(_params: Record<string, number>): ValidationResult {
    return { valid: true, errors: [] };
  }

  compute(
    params: Record<string, number>,
    config?: GenericFormulaConfig
  ): ComputationResult {
    const values: Record<string, number | string | boolean | object> = {};
    const trace: Record<string, { formula: string; inputs: Record<string, number>; result: number }> = {};

    if (config?.computedParams) {
      for (const cp of config.computedParams) {
        try {
          const result = this.evaluateFormula(cp.formula, params);
          values[cp.name] = result;
          trace[cp.name] = { formula: cp.formula, inputs: { ...params }, result };
        } catch {
          values[cp.name] = NaN;
        }
      }
    }

    return {
      values,
      state: 'normal',
      explanation: '通用物理计算结果。',
      trace,
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

const genericEngine = new GenericEngine();
export default genericEngine;
