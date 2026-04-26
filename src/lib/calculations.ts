/**
 * 实验计算引擎
 * 用于处理实验中的物理/化学计算
 */

import { CalculationResult } from './experiment-types';

// 内置计算函数
const mathFunctions = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  asin: Math.asin,
  acos: Math.acos,
  atan: Math.atan,
  atan2: Math.atan2,
  sqrt: Math.sqrt,
  abs: Math.abs,
  min: Math.min,
  max: Math.max,
  pow: Math.pow,
  log: Math.log,
  log10: Math.log10,
  exp: Math.exp,
  PI: Math.PI,
  E: Math.E,
  round: Math.round,
  floor: Math.floor,
  ceil: Math.ceil,
};

// =============================================================================
// Chemistry helpers
// =============================================================================

/**
 * Calculate pH from hydrogen ion concentration (mol/L).
 * pH = -log10([H+])
 */
export function phFromHPlus(hPlusConc: number): number {
  if (hPlusConc <= 0) return 14;
  return -Math.log10(hPlusConc);
}

/**
 * Calculate [H+] from pH.
 * [H+] = 10^(-pH)
 */
export function hPlusFromPh(pH: number): number {
  return Math.pow(10, -pH);
}

/**
 * Calculate pOH from hydroxide ion concentration.
 */
export function pohFromOHMinus(ohMinusConc: number): number {
  if (ohMinusConc <= 0) return 14;
  return -Math.log10(ohMinusConc);
}

/**
 * Convert between pH and pOH at 25°C.
 */
export function phFromPoh(pOH: number): number {
  return 14 - pOH;
}

/**
 * Henderson-Hasselbalch buffer equation.
 * pH = pKa + log([base]/[acid])
 */
export function hendersonHasselbalch(
  pKa: number,
  baseConc: number,
  acidConc: number
): number {
  if (acidConc <= 0 || baseConc < 0) return pKa;
  return pKa + Math.log10(baseConc / acidConc);
}

/**
 * Ideal gas law — moles from P, V, T.
 * n = PV / RT, R = 0.0821 L·atm/(mol·K)
 */
export function idealGasMoles(
  pressureAtm: number,
  volumeL: number,
  tempK: number
): number {
  const R = 0.08206;
  if (tempK <= 0) return 0;
  return (pressureAtm * volumeL) / (R * tempK);
}

// =============================================================================
// Original evaluateExpression
// =============================================================================

// 计算表达式
export function evaluateExpression(
  expression: string,
  params: Record<string, number>
): number | string {
  // 如果是纯数字或纯字符串，直接返回
  if (typeof expression === 'number') return expression;
  if (typeof expression === 'string' && !isNaN(Number(expression))) {
    return Number(expression);
  }

  // 替换参数引用 ${key} 或 {key}
  let evalStr = expression.toString();
  
  // 替换 ${paramKey} 格式
  evalStr = evalStr.replace(/\$\{(\w+)\}/g, (_, key) => {
    if (params[key] !== undefined) {
      return params[key].toString();
    }
    return '0';
  });

  // 替换 {paramKey} 格式（不带 $）
  evalStr = evalStr.replace(/\{(\w+)\}/g, (_, key) => {
    if (params[key] !== undefined) {
      return params[key].toString();
    }
    return '0';
  });

  try {
    // 使用 Function 构造计算函数
    const paramKeys = Object.keys(params);
    const paramValues = Object.values(params);
    const mathKeys = Object.keys(mathFunctions);
    const mathValues = Object.values(mathFunctions);

    const fn = new Function(
      ...paramKeys,
      ...mathKeys,
      `return ${evalStr}`
    );

    const result = fn(...paramValues, ...mathValues);
    return typeof result === 'number' && isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}

// 判断像的性质
export function determineImageType(
  objectDistance: number,
  focalLength: number
): {
  realOrVirtual: string;
  size: string;
  orientation: string;
} {
  if (objectDistance <= focalLength) {
    return {
      realOrVirtual: '虚像',
      size: objectDistance < focalLength ? '放大' : '等大',
      orientation: '正立',
    };
  }
  
  const magnification = focalLength / (objectDistance - focalLength);
  
  return {
    realOrVirtual: '实像',
    size: Math.abs(magnification) > 1 ? '放大' : Math.abs(magnification) < 1 ? '缩小' : '等大',
    orientation: '倒立',
  };
}

// 判断折射情况
export function determineRefraction(
  incidentAngle: number,
  n1: number,
  n2: number
): {
  type: string;
  refractionAngle?: number;
  criticalAngle?: number;
} {
  const sinRefraction = (n1 * Math.sin((incidentAngle * Math.PI) / 180)) / n2;
  
  if (Math.abs(sinRefraction) > 1) {
    return {
      type: '全反射',
      criticalAngle: (Math.asin(n2 / n1) * 180) / Math.PI,
    };
  }
  
  const refractionAngle = (Math.asin(sinRefraction) * 180) / Math.PI;
  
  return {
    type: '折射',
    refractionAngle,
  };
}

// 预定义计算模板
export const calculationTemplates = {
  // 凸透镜成像
  convexLens: (params: Record<string, number>) => {
    const { objectDistance, focalLength } = params;
    
    if (objectDistance <= focalLength) {
      return {
        imageDistance: { value: '无法成像', unit: 'cm' },
        magnification: { value: '∞', unit: '×' },
        imageType: { value: '虚像', unit: '' },
      };
    }
    
    const v = (focalLength * objectDistance) / (objectDistance - focalLength);
    const m = -v / objectDistance;
    const imageInfo = determineImageType(objectDistance, focalLength);
    
    return {
      imageDistance: { value: v, unit: 'cm' },
      magnification: { value: Math.abs(m), unit: '×' },
      imageType: { 
        value: `${imageInfo.realOrVirtual} ${imageInfo.orientation} ${imageInfo.size}`, 
        unit: '' 
      },
    };
  },

  // 光的折射
  refraction: (params: Record<string, number>) => {
    const { incidentAngle, n1, n2 } = params;
    const result = determineRefraction(incidentAngle, n1, n2);
    
    return {
      refractionAngle: { 
        value: result.refractionAngle ?? 0, 
        unit: '°' 
      },
      type: { 
        value: result.type, 
        unit: result.type === '全反射' ? `(临界角${result.criticalAngle?.toFixed(1)}°)` : '' 
      },
    };
  },

  // 单摆周期
  pendulum: (params: Record<string, number>) => {
    const { length, gravity } = params;
    const T = 2 * Math.PI * Math.sqrt(length / gravity);
    
    return {
      period: { value: T, unit: 's' },
      frequency: { value: 1 / T, unit: 'Hz' },
    };
  },

  // 弹簧振子
  springMass: (params: Record<string, number>) => {
    const { mass, springConstant } = params;
    const omega = Math.sqrt(springConstant / mass);
    const T = 2 * Math.PI / omega;
    
    return {
      period: { value: T, unit: 's' },
      frequency: { value: 1 / T, unit: 'Hz' },
      angularFrequency: { value: omega, unit: 'rad/s' },
    };
  },

  // 力的合成
  forceComposition: (params: Record<string, number>) => {
    const { force1, angle1, force2, angle2 } = params;
    const rad1 = (angle1 * Math.PI) / 180;
    const rad2 = (angle2 * Math.PI) / 180;
    
    const rx = force1 * Math.cos(rad1) + force2 * Math.cos(rad2);
    const ry = force1 * Math.sin(rad1) + force2 * Math.sin(rad2);
    const resultForce = Math.sqrt(rx * rx + ry * ry);
    const resultAngle = (Math.atan2(ry, rx) * 180) / Math.PI;
    
    return {
      resultForce: { value: resultForce, unit: 'N' },
      resultAngle: { value: resultAngle, unit: '°' },
      xComponent: { value: rx, unit: 'N' },
      yComponent: { value: ry, unit: 'N' },
    };
  },

  // 化学反应速率
  reaction: (params: Record<string, number>) => {
    const { temperature, concentration, catalyst } = params;
    
    // 阿伦尼乌斯方程简化
    const baseRate = concentration * 0.1;
    const tempFactor = Math.exp((temperature - 25) / 50);
    const catalystFactor = 1 + catalyst * 0.5;
    const rate = baseRate * tempFactor * catalystFactor;
    
    return {
      reactionRate: { value: rate, unit: 'mol/(L·s)' },
      halfLife: { value: 1 / Math.max(rate, 0.001), unit: 's' },
    };
  },

  // ─── Phase 2: Biology templates ─────────────────────────

  // 渗透作用 (Osmosis)
  osmosis: (params: Record<string, number>) => {
    const { external_concentration = 0.3, cell_concentration = 0.3, temperature = 298 } = params;
    const R = 0.0821;
    const pressure = Math.abs(cell_concentration - external_concentration) * R * temperature;
    const diff = cell_concentration - external_concentration;
    let state = '等渗';
    if (diff > 0.01) state = '低渗（细胞吸水）';
    else if (diff < -0.01) state = '高渗（细胞失水）';
    return {
      osmoticPressure: { value: pressure, unit: 'atm' },
      waterFlowDirection: { value: state, unit: '' },
    };
  },

  // Michaelis-Menten 酶动力学
  enzymeKinetics: (params: Record<string, number>) => {
    const { substrate = 10, vmax = 100, km = 50 } = params;
    const rate = (vmax * substrate) / (km + substrate);
    const saturation = substrate / (km + substrate);
    return {
      reactionRate: { value: rate, unit: '\u03BCM/s' },
      saturation: { value: saturation, unit: '' },
      catalyticEfficiency: { value: (vmax / km), unit: 's\u207B\u00B9' },
    };
  },

  // Logistic 种群增长
  logisticGrowth: (params: Record<string, number>) => {
    const { initial = 100, capacity = 1000, rate = 0.1, time = 10 } = params;
    const pop = capacity / (1 + ((capacity - initial) / initial) * Math.exp(-rate * time));
    return {
      population: { value: pop, unit: 'individuals' },
      growthRate: { value: rate, unit: 'per time unit' },
      isStable: { value: (pop / capacity) > 0.95, unit: '' },
    };
  },

  // ─── Phase 2: Math templates ─────────────────────────

  // 函数求值
  functionEvaluate: (params: Record<string, number>) => {
    const { x = 0, amplitude = 1, frequency = 1, phase = 0, type = 0 } = params;
    let y = 0;
    if (type === 0) y = amplitude * Math.sin(frequency * x + phase);
    else if (type === 1) y = amplitude * Math.cos(frequency * x + phase);
    else if (type === 2) y = amplitude * x * x + frequency * x + phase;
    else if (type === 3) y = amplitude * Math.exp(frequency * x);
    return {
      y: { value: y, unit: '' },
      derivative: { value: amplitude * frequency * Math.cos(frequency * x + phase), unit: '' },
    };
  },

  // 线段/圆几何计算
  geometryCompute: (params: Record<string, number>) => {
    const { x1 = 0, y1 = 0, x2 = 4, y2 = 3 } = params;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    return {
      length: { value: length, unit: '' },
      midpoint: { value: `(${midX.toFixed(2)}, ${midY.toFixed(2)})`, unit: '' },
      slope: { value: dx !== 0 ? dy / dx : Infinity, unit: '' },
    };
  },

  // 正态分布概率密度
  normalDistribution: (params: Record<string, number>) => {
    const { x = 0, mean = 0, std = 1 } = params;
    const coeff = 1 / (std * Math.sqrt(2 * Math.PI));
    const z = (x - mean) / std;
    const pdf = coeff * Math.exp(-0.5 * z * z);
    // Approximate CDF using Abramowitz & Stegun formula for erf
    const absZ = Math.abs(z / Math.sqrt(2));
    const t = 1 / (1 + 0.3275911 * absZ);
    const erfApprox = 1 - (((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t) * Math.exp(-absZ * absZ);
    const cdf = 0.5 * (1 + Math.sign(z) * erfApprox);
    return {
      pdf: { value: pdf, unit: '' },
      zScore: { value: z, unit: '' },
      percentile: { value: cdf, unit: '' },
    };
  },

  // ─── Phase 2: Geography templates ─────────────────────────

  // 板块构造
  plateTectonics: (params: Record<string, number>) => {
    const { plate_speed = 5, density1 = 3.0, density2 = 2.8 } = params;
    const isConvergent = params.boundary_type === 0;
    const trench = isConvergent && density1 > density2 ? 2 + params.oceanic_age * 0.1 + plate_speed * 0.3 : 0;
    const mountain = !isConvergent || Math.abs(density1 - density2) < 0.2 ? 0 : (Math.abs(density1 - density2) * 10 + plate_speed * 0.5);
    return {
      trenchDepth: { value: trench, unit: 'km' },
      mountainHeight: { value: mountain, unit: 'km' },
      stress: { value: plate_speed * Math.abs(density1 - density2) * 10, unit: 'MPa' },
    };
  },

  // 洋流速度
  oceanCurrent: (params: Record<string, number>) => {
    const { wind_speed = 10, latitude = 30 } = params;
    const speed = wind_speed * 0.03;
    const omega = 7.292e-5;
    const f = 2 * omega * Math.sin((latitude * Math.PI) / 180);
    const ekmanDepth = f !== 0 ? 7.6 / Math.sqrt(Math.abs(f)) : 100;
    return {
      currentSpeed: { value: speed, unit: 'm/s' },
      ekmanDepth: { value: ekmanDepth, unit: 'm' },
      transport: { value: wind_speed * 0.0127 / (Math.abs(f) + 1e-10), unit: 'm\u00B2/s' },
    };
  },

  // 地震波传播
  seismicWave: (params: Record<string, number>) => {
    const { epicenter_distance = 100, magnitude = 5 } = params;
    const vp = 6.5;
    const vs = 3.7;
    const pTime = epicenter_distance / vp;
    const sTime = epicenter_distance / vs;
    const mmi = Math.min(12, 1.5 * magnitude - 3.0 * Math.log10(epicenter_distance) + 3.0);
    const energy = Math.pow(10, 1.5 * magnitude + 4.8);
    return {
      pWaveArrival: { value: pTime, unit: 's' },
      sWaveArrival: { value: sTime, unit: 's' },
      spDelay: { value: sTime - pTime, unit: 's' },
      intensity: { value: mmi, unit: 'MMI' },
      energy: { value: energy, unit: 'J' },
    };
  },
};

// 导出所有模板
export default calculationTemplates;
