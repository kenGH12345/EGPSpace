/**
 * Validation: Dimension Validator (Capability)
 *
 * Validates unit / dimension consistency of parameters.
 * Extracted from schema-validator.ts checkDimensions() as T-2.
 */

import type { ExperimentSchema } from '../experiment-schema';

export type CheckLevel = 'CRITICAL' | 'ERROR' | 'WARNING' | 'PASS';

export interface CheckResult {
  checker: string;
  level: CheckLevel;
  message: string;
  param?: string;
  autoFixed?: boolean;
}

export class DimensionValidator {
  static readonly checkerName = 'dimensions';

  validate(schema: ExperimentSchema): CheckResult[] {
    const results: CheckResult[] = [];

    for (const param of schema.params) {
      if (!param.unit) continue;

      // Detect force/mass confusion: if param name suggests force but unit is kg
      const forceNames = ['force', 'buoyantForce', 'gravity', 'tension', 'weight'];
      if (forceNames.some(n => param.name.toLowerCase().includes(n.toLowerCase())) && param.unit === 'kg') {
        results.push({
          checker: 'dimensions', level: 'WARNING',
          message: `参数 "${param.name}" 看起来是力（N），但单位为 "kg"（质量），请检查单位是否正确`,
          param: param.name,
        });
      }

      // Detect current/resistance confusion
      if (param.name.toLowerCase() === 'current' && param.unit === 'Ω') {
        results.push({
          checker: 'dimensions', level: 'WARNING',
          message: `参数 "${param.name}" 是电流，但单位为 "Ω"（电阻），请检查单位是否正确`,
          param: param.name,
        });
      }

      // Detect angle in wrong unit
      if (['incidentAngle', 'refractionAngle', 'angle'].includes(param.name) && param.unit === 'rad') {
        results.push({
          checker: 'dimensions', level: 'WARNING',
          message: `参数 "${param.name}" 使用弧度(rad)，系统期望角度(°)，请确认计算逻辑`,
          param: param.name,
        });
      }
    }

    if (results.length === 0) {
      results.push({ checker: 'dimensions', level: 'PASS', message: '量纲一致性检查通过' });
    }

    return results;
  }
}

const dimensionValidator = new DimensionValidator();
export default dimensionValidator;
