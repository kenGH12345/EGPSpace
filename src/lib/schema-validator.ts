import type { ExperimentSchema } from './experiment-schema';
import { enrichSchema, fillDefaultValues } from './experiment-schema';
import paramRangeValidator from './validators/param-range-validator';
import phenomenonValidator from './validators/phenomenon-validator';
import formulaValidator from './validators/formula-validator';
import dimensionValidator from './validators/dimension-validator';

// ── Types ──────────────────────────────────────────────────────────────────

export type CheckLevel = 'CRITICAL' | 'ERROR' | 'WARNING' | 'PASS';

export interface CheckResult {
  checker: string;
  level: CheckLevel;
  message: string;
  param?: string;
  autoFixed?: boolean;
}

export interface ValidationReport {
  checks: CheckResult[];
  criticalCount: number;
  errorCount: number;
  warningCount: number;
  passCount: number;
  fallbackUsed: boolean;
  fallbackReason?: string;
}

export interface ValidationOutput {
  schema: ExperimentSchema;
  report: ValidationReport;
}

// ── Facade: Delegated to Capability instances ──────────────────────────────

export function checkParamRanges(schema: ExperimentSchema): { schema: ExperimentSchema; results: CheckResult[] } {
  return paramRangeValidator.validate(schema);
}

export function checkPhenomenon(schema: ExperimentSchema): CheckResult[] {
  return phenomenonValidator.validate(schema);
}

export function checkFormulas(schema: ExperimentSchema): { schema: ExperimentSchema; results: CheckResult[] } {
  return formulaValidator.validate(schema);
}

export function checkDimensions(schema: ExperimentSchema): CheckResult[] {
  return dimensionValidator.validate(schema);
}

// ── Main Entry Point (Facade, unchanged signature) ─────────────────────────

export function validateWithKnowledge(schema: ExperimentSchema, concept?: string): ValidationOutput {
  try {
    let current = schema;
    const allChecks: CheckResult[] = [];

    // Run phenomenon check FIRST (on original values, before auto-fix)
    const phenomenonResults = checkPhenomenon(current);
    allChecks.push(...phenomenonResults);

    // Then param range check (may auto-fix defaultValues)
    const paramResult = checkParamRanges(current);
    current = paramResult.schema;
    allChecks.push(...paramResult.results);

    const formulaResult = checkFormulas(current);
    current = formulaResult.schema;
    allChecks.push(...formulaResult.results);

    const dimensionResults = checkDimensions(current);
    allChecks.push(...dimensionResults);

    const criticalCount = allChecks.filter(c => c.level === 'CRITICAL').length;
    const errorCount = allChecks.filter(c => c.level === 'ERROR').length;
    const warningCount = allChecks.filter(c => c.level === 'WARNING').length;
    const passCount = allChecks.filter(c => c.level === 'PASS').length;

    // Fallback to rule-based schema if critical errors found
    if (criticalCount >= 1) {
      const fallbackReason = allChecks
        .filter(c => c.level === 'CRITICAL')
        .map(c => c.message)
        .join('; ');

      const fallbackSchema = buildFallbackSchema(schema, concept);

      return {
        schema: fallbackSchema,
        report: {
          checks: allChecks,
          criticalCount, errorCount, warningCount, passCount,
          fallbackUsed: true,
          fallbackReason,
        },
      };
    }

    return {
      schema: current,
      report: { checks: allChecks, criticalCount, errorCount, warningCount, passCount, fallbackUsed: false },
    };
  } catch {
    // fail-safe: return original schema unchanged
    return {
      schema,
      report: {
        checks: [{ checker: 'validator', level: 'WARNING', message: '验证层内部错误，已跳过验证' }],
        criticalCount: 0, errorCount: 0, warningCount: 1, passCount: 0,
        fallbackUsed: false,
      },
    };
  }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function buildFallbackSchema(original: ExperimentSchema, concept?: string): ExperimentSchema {
  const partial = {
    meta: {
      ...original.meta,
      name: concept ? `${concept}探究实验` : original.meta.name,
    },
    params: [],
    formulas: [],
  };
  const filled = fillDefaultValues(partial);
  return enrichSchema(filled);
}
