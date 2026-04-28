/**
 * Validation: Param Range Validator (Capability)
 *
 * Validates parameter ranges against physical rules.
 * Extracted from schema-validator.ts checkParamRanges() as T-2.
 */

import type { ExperimentSchema } from '../experiment-schema';
import { findParamRule } from '../physics-knowledge';

export type CheckLevel = 'CRITICAL' | 'ERROR' | 'WARNING' | 'PASS';

export interface CheckResult {
  checker: string;
  level: CheckLevel;
  message: string;
  param?: string;
  autoFixed?: boolean;
}

export class ParamRangeValidator {
  static readonly checkerName = 'paramRanges';

  validate(schema: ExperimentSchema): { schema: ExperimentSchema; results: CheckResult[] } {
    const results: CheckResult[] = [];
    const physicsType = schema.meta.physicsType;
    let modified = false;
    const params = schema.params.map(p => ({ ...p }));

    for (const param of params) {
      const rule = findParamRule(param.name, physicsType);
      if (!rule) continue;

      // min > max structural error
      if (param.min >= param.max) {
        results.push({ checker: 'paramRanges', level: 'ERROR', message: `参数 "${param.name}" 的 min(${param.min}) >= max(${param.max})，配置无效`, param: param.name });
      }

      // negative value for physically non-negative quantity
      if (rule.criticalIfNegative && param.defaultValue < 0) {
        results.push({ checker: 'paramRanges', level: 'CRITICAL', message: `参数 "${param.name}" 默认值 ${param.defaultValue} 为负数，物理上不合理`, param: param.name });
      }

      // defaultValue outside physical range — auto-clamp
      if (param.defaultValue < rule.min || param.defaultValue > rule.max) {
        const clamped = Math.min(rule.max, Math.max(rule.min, param.defaultValue));
        results.push({
          checker: 'paramRanges', level: 'WARNING',
          message: `参数 "${param.name}" 默认值 ${param.defaultValue} 超出物理合理范围 [${rule.min}, ${rule.max}]，已自动修正为 ${clamped}`,
          param: param.name, autoFixed: true,
        });
        param.defaultValue = clamped;
        modified = true;
      }

      // min below physical minimum
      if (param.min < rule.min) {
        results.push({ checker: 'paramRanges', level: 'WARNING', message: `参数 "${param.name}" 的 min(${param.min}) 低于物理最小值 ${rule.min}`, param: param.name });
      }

      // max above physical maximum
      if (param.max > rule.max) {
        results.push({ checker: 'paramRanges', level: 'WARNING', message: `参数 "${param.name}" 的 max(${param.max}) 超过物理最大值 ${rule.max}`, param: param.name });
      }
    }

    if (results.length === 0) {
      results.push({ checker: 'paramRanges', level: 'PASS', message: '所有参数范围检查通过' });
    }

    const newSchema = modified ? { ...schema, params } : schema;
    return { schema: newSchema, results };
  }
}

const paramRangeValidator = new ParamRangeValidator();
export default paramRangeValidator;
