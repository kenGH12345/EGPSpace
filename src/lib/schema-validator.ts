import type { ExperimentSchema, ParamDefinition, PhysicsEngineType } from './experiment-schema';
import { enrichSchema, fillDefaultValues } from './experiment-schema';
import { getFormulaKnowledge, findParamRule } from './physics-knowledge';

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

// ── T-2a: Param Range Checker ──────────────────────────────────────────────

export function checkParamRanges(schema: ExperimentSchema): { schema: ExperimentSchema; results: CheckResult[] } {
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

// ── T-2a: Phenomenon Checker ───────────────────────────────────────────────

export function checkPhenomenon(schema: ExperimentSchema): CheckResult[] {
  const results: CheckResult[] = [];
  const physicsType = schema.meta.physicsType;
  const paramMap = Object.fromEntries(schema.params.map(p => [p.name, p.defaultValue]));

  if (physicsType === 'buoyancy') {
    const rhoObj = findParamValue(paramMap, ['rho_object', 'density', 'objectDensity', 'rho_obj']);
    const rhoLiq = findParamValue(paramMap, ['rho_liquid', 'liquidDensity', 'rho_liq', 'fluidDensity']);

    if (rhoObj !== undefined && rhoLiq !== undefined) {
      if (rhoObj < rhoLiq * 0.01) {
        results.push({ checker: 'phenomenon', level: 'WARNING', message: `浮力实验：物体密度(${rhoObj}) 远小于液体密度(${rhoLiq})，物体将完全漂浮，无法演示沉浮变化` });
      }
      if (rhoObj > rhoLiq * 100) {
        results.push({ checker: 'phenomenon', level: 'WARNING', message: `浮力实验：物体密度(${rhoObj}) 远大于液体密度(${rhoLiq})，物体将完全下沉，无法演示浮力效果` });
      }
    }
  }

  if (physicsType === 'refraction') {
    const n1 = findParamValue(paramMap, ['n1', 'refractiveIndex1', 'n_1']);
    const n2 = findParamValue(paramMap, ['n2', 'refractiveIndex2', 'n_2']);
    const angle = findParamValue(paramMap, ['incidentAngle', 'incident_angle', 'theta1']);

    if (n1 !== undefined && n1 < 1.0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `折射实验：介质1折射率(${n1}) < 1，物理上不可能（真空折射率=1为最小值）` });
    }
    if (n2 !== undefined && n2 < 1.0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `折射实验：介质2折射率(${n2}) < 1，物理上不可能` });
    }
    if (n1 !== undefined && n2 !== undefined && angle !== undefined) {
      const sinRefraction = (n1 / n2) * Math.sin((angle * Math.PI) / 180);
      if (n1 > n2 && sinRefraction > 1) {
        results.push({ checker: 'phenomenon', level: 'WARNING', message: `折射实验：当前参数会发生全反射（入射角 ${angle}° 超过临界角），折射光线不存在` });
      }
    }
  }

  if (physicsType === 'circuit') {
    const resistance = findParamValue(paramMap, ['resistance', 'R', 'ohm']);
    if (resistance !== undefined && resistance <= 0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `电路实验：电阻值(${resistance}) <= 0，会导致短路或除零错误` });
    }
  }

  if (physicsType === 'lever') {
    const leftArm = findParamValue(paramMap, ['leftArm', 'left_arm', 'L1']);
    const rightArm = findParamValue(paramMap, ['rightArm', 'right_arm', 'L2']);
    if (leftArm !== undefined && leftArm <= 0) {
      results.push({ checker: 'phenomenon', level: 'ERROR', message: `杠杆实验：左力臂(${leftArm}) <= 0，力矩计算无意义` });
    }
    if (rightArm !== undefined && rightArm <= 0) {
      results.push({ checker: 'phenomenon', level: 'ERROR', message: `杠杆实验：右力臂(${rightArm}) <= 0，力矩计算无意义` });
    }
  }

  // ── Chemistry ──────────────────────────────────────────────────────────────

  if (physicsType === 'acid_base') {
    const pH = findParamValue(paramMap, ['pH', 'ph', 'pH_value', 'acidity']);
    if (pH !== undefined && (pH < 0 || pH > 14)) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `酸碱实验：pH值(${pH}) 超出合法范围 [0, 14]，物理上不可能` });
    }
    const conc = findParamValue(paramMap, ['concentration', 'c', 'molarity', 'conc']);
    if (conc !== undefined && conc <= 0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `酸碱实验：浓度(${conc}) <= 0，溶液不存在` });
    }
  }

  if (physicsType === 'reaction_rate') {
    const temp = findParamValue(paramMap, ['temperature', 'T', 'temp', 'celsius']);
    if (temp !== undefined && temp < -273.15) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `反应速率实验：温度(${temp}°C) 低于绝对零度，物理上不可能` });
    }
    const conc = findParamValue(paramMap, ['concentration', 'c', 'reactantConc']);
    if (conc !== undefined && conc <= 0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `反应速率实验：反应物浓度(${conc}) <= 0，反应无法进行` });
    }
  }

  if (physicsType === 'titration') {
    const vol = findParamValue(paramMap, ['volume', 'V', 'vol', 'titrantVolume']);
    if (vol !== undefined && vol < 0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `滴定实验：滴定体积(${vol}) < 0，操作上不可能` });
    }
  }

  if (physicsType === 'electrolysis') {
    const voltage = findParamValue(paramMap, ['voltage', 'U', 'V', 'emf']);
    if (voltage !== undefined && voltage <= 0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `电解实验：电压(${voltage}) <= 0，电解无法进行` });
    }
  }

  // ── Biology ────────────────────────────────────────────────────────────────

  if (physicsType === 'enzyme') {
    const temp = findParamValue(paramMap, ['temperature', 'T', 'temp', 'celsius']);
    const pH = findParamValue(paramMap, ['pH', 'ph', 'pH_value']);
    if (temp !== undefined && temp > 80) {
      results.push({ checker: 'phenomenon', level: 'WARNING', message: `酶促反应：温度(${temp}°C) 超过80°C，大多数酶将变性失活，反应速率趋近于零` });
    }
    if (pH !== undefined && (pH < 0 || pH > 14)) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `酶促反应：pH值(${pH}) 超出合法范围 [0, 14]` });
    }
    const substrate = findParamValue(paramMap, ['substrateConc', 'substrate', 'S', 'concentration']);
    if (substrate !== undefined && substrate <= 0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `酶促反应：底物浓度(${substrate}) <= 0，反应无法进行` });
    }
  }

  if (physicsType === 'osmosis') {
    const extConc = findParamValue(paramMap, ['soluteConc', 'concentration', 'externalConc']);
    const cellConc = findParamValue(paramMap, ['cellConc', 'internalConc', 'cytoplasm']);
    if (extConc !== undefined && extConc < 0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `渗透实验：外部溶液浓度(${extConc}) < 0，物理上不可能` });
    }
    if (extConc !== undefined && cellConc !== undefined && extConc === cellConc) {
      results.push({ checker: 'phenomenon', level: 'WARNING', message: `渗透实验：内外浓度相等(${extConc} mol/L)，细胞处于等渗状态，无渗透现象可观察` });
    }
  }

  if (physicsType === 'population') {
    const N0 = findParamValue(paramMap, ['initialPopulation', 'N0', 'N', 'population']);
    const K = findParamValue(paramMap, ['carryingCapacity', 'K', 'maxPopulation']);
    if (N0 !== undefined && N0 <= 0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `种群增长：初始种群数量(${N0}) <= 0，种群不存在` });
    }
    if (N0 !== undefined && K !== undefined && N0 > K) {
      results.push({ checker: 'phenomenon', level: 'WARNING', message: `种群增长：初始种群(${N0}) 超过环境容纳量K(${K})，种群将下降而非增长` });
    }
  }

  if (physicsType === 'photosynthesis') {
    const light = findParamValue(paramMap, ['lightIntensity', 'light', 'lux']);
    const co2 = findParamValue(paramMap, ['CO2Concentration', 'co2', 'CO2']);
    if (light !== undefined && light < 0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `光合作用：光照强度(${light}) < 0，物理上不可能` });
    }
    if (co2 !== undefined && co2 <= 0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `光合作用：CO₂浓度(${co2}) <= 0，暗反应无法进行` });
    }
  }

  // ── Math ───────────────────────────────────────────────────────────────────

  if (physicsType === 'probability') {
    const p = findParamValue(paramMap, ['probability', 'p', 'P', 'prob', 'chance']);
    if (p !== undefined && (p < 0 || p > 1)) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `概率实验：概率值(${p}) 超出合法范围 [0, 1]，数学上不合法` });
    }
    const n = findParamValue(paramMap, ['trials', 'n', 'sampleSize', 'count']);
    if (n !== undefined && n <= 0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `概率实验：试验次数(${n}) <= 0，实验无意义` });
    }
  }

  if (physicsType === 'geometry') {
    const angle = findParamValue(paramMap, ['angle', 'theta', 'alpha', 'angleA', 'angleB', 'angleC']);
    if (angle !== undefined && (angle < 0 || angle > 360)) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `几何实验：角度(${angle}°) 超出合法范围 [0°, 360°]` });
    }
    const side = findParamValue(paramMap, ['sideLength', 'side', 'a', 'b', 'c', 'length']);
    if (side !== undefined && side <= 0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `几何实验：边长(${side}) <= 0，图形不存在` });
    }
  }

  if (physicsType === 'statistics') {
    const stdDev = findParamValue(paramMap, ['stdDev', 'sigma', 'std', 'standardDeviation']);
    if (stdDev !== undefined && stdDev < 0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `统计实验：标准差(${stdDev}) < 0，数学上不合法（标准差必须 >= 0）` });
    }
    const n = findParamValue(paramMap, ['sampleSize', 'n', 'count', 'N']);
    if (n !== undefined && n <= 0) {
      results.push({ checker: 'phenomenon', level: 'CRITICAL', message: `统计实验：样本量(${n}) <= 0，统计无意义` });
    }
  }

  if (results.length === 0) {
    results.push({ checker: 'phenomenon', level: 'PASS', message: '现象合理性检查通过' });
  }

  return results;
}

// ── T-2b: Formula Checker ──────────────────────────────────────────────────

export function checkFormulas(schema: ExperimentSchema): { schema: ExperimentSchema; results: CheckResult[] } {
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

// ── T-2b: Dimension Checker ────────────────────────────────────────────────

export function checkDimensions(schema: ExperimentSchema): CheckResult[] {
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

// ── T-2b: Main Entry Point ─────────────────────────────────────────────────

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

function findParamValue(paramMap: Record<string, number>, aliases: string[]): number | undefined {
  for (const alias of aliases) {
    if (alias in paramMap) return paramMap[alias];
    const key = Object.keys(paramMap).find(k => k.toLowerCase() === alias.toLowerCase());
    if (key !== undefined) return paramMap[key];
  }
  return undefined;
}

function normalizeExpression(expr: string): string {
  return expr.replace(/\s+/g, '').replace(/[×*]/g, '*').toLowerCase();
}

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
