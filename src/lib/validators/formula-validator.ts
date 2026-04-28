/**
 * Validation: Formula Validator (Capability)
 *
 * Validates formulas against knowledge-base canonical expressions.
 * Extracted from schema-validator.ts checkFormulas() as T-2.
 */

import type { ExperimentSchema } from '../experiment-schema';
import { getFormulaKnowledge } from '../physics-knowledge';

export type CheckLevel = 'CRITICAL' | 'ERROR' | 'WARNING' | 'PASS';

export interface CheckResult {
  checker: string;
  level: CheckLevel;
  message: string;
  param?: string;
  autoFixed?: boolean;
}

function normalizeExpression(expr: string): string {
  return expr.replace(/\s+/g, '').replace(/[×*]/g, '*').toLowerCase();
}

export class FormulaValidator {
  static readonly checkerName = 'formulas';

  validate(schema: ExperimentSchema): { schema: ExperimentSchema; results: CheckResult[] } {
    const results: CheckResult[] = [];
    const physicsType = schema.meta.physicsType;
    const knowledgeFormulas = getFormulaKnowledge(physicsType);

    if (knowledgeFormulas.length === 0) {
      results.push({ checker: 'formulas', level: 'PASS', message: '该物理类型无公式知识库，跳过验证' });
      return { schema, results };
    }

    let modified = false;
    const formulas = schema.formulas.map(f => ({ ...f }));

    for (const knowledge of knowledgeFormulas) {
      const match = formulas.find(f =>
        f.resultVariable === knowledge.resultVariable ||
        normalizeExpression(f.expression).includes(normalizeExpression(knowledge.resultVariable))
      );

      if (!match) continue;

      const schemaVars = new Set(match.variables.map(v => v.toLowerCase()));
      const knowledgeVars = new Set(knowledge.keyVariables.map(v => v.toLowerCase()));
      const missingVars = [...knowledgeVars].filter(v => !schemaVars.has(v));

      if (missingVars.length > 0) {
        const formulaIdx = formulas.indexOf(match);
        results.push({
          checker: 'formulas', level: 'ERROR',
          message: `公式 "${match.name}" 缺少关键变量 [${missingVars.join(', ')}]，已替换为标准公式`,
          autoFixed: true,
        });
        formulas[formulaIdx] = {
          ...match,
          expression: knowledge.canonicalExpression,
          variables: knowledge.keyVariables,
        };
        modified = true;
      }
    }

    if (results.filter(r => r.level !== 'PASS').length === 0) {
      results.push({ checker: 'formulas', level: 'PASS', message: '公式验证通过' });
    }

    const newSchema = modified ? { ...schema, formulas } : schema;
    return { schema: newSchema, results };
  }
}

const formulaValidator = new FormulaValidator();
export default formulaValidator;
