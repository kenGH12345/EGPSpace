/**
 * 实验计算引擎 - 浏览器版本
 * 简化版，用于前端直接计算
 */

import { CalculationResult } from './experiment-types';

// 内置计算函数
const mathFunctions: Record<string, number | ((...args: number[]) => number)> = {
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

// 计算数值（返回数字或默认值）
export function calculateValue(
  value: number | string,
  params: Record<string, number>,
  defaultValue: number = 0
): number {
  if (typeof value === 'number') return value;
  const result = evaluateExpression(value, params);
  return typeof result === 'number' ? result : defaultValue;
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

// 计算合力
export function calculateResultantForce(
  force1: number,
  angle1: number,
  force2: number,
  angle2: number
): {
  resultForce: number;
  resultAngle: number;
  xComponent: number;
  yComponent: number;
} {
  const rad1 = (angle1 * Math.PI) / 180;
  const rad2 = (angle2 * Math.PI) / 180;

  const rx = force1 * Math.cos(rad1) + force2 * Math.cos(rad2);
  const ry = force1 * Math.sin(rad1) + force2 * Math.sin(rad2);
  const resultForce = Math.sqrt(rx * rx + ry * ry);
  const resultAngle = (Math.atan2(ry, rx) * 180) / Math.PI;

  return {
    resultForce,
    resultAngle,
    xComponent: rx,
    yComponent: ry,
  };
}

// 计算化学反应速率
export function calculateReactionRate(
  temperature: number,
  concentration: number,
  catalyst: number
): {
  reactionRate: number;
  halfLife: number;
  activationState: string;
} {
  // 阿伦尼乌斯方程简化
  const baseRate = concentration * 0.1;
  const tempFactor = Math.exp((temperature - 25) / 50);
  const catalystFactor = 1 + catalyst * 0.5;
  const rate = baseRate * tempFactor * catalystFactor;

  return {
    reactionRate: rate,
    halfLife: 1 / Math.max(rate, 0.001),
    activationState: temperature > 60 ? '高' : temperature > 40 ? '中' : '低',
  };
}

// 计算单摆周期
export function calculatePendulumPeriod(
  length: number,
  gravity: number
): {
  period: number;
  frequency: number;
  angularFrequency: number;
} {
  const omega = Math.sqrt(gravity / length);
  const T = 2 * Math.PI / omega;

  return {
    period: T,
    frequency: 1 / T,
    angularFrequency: omega,
  };
}

// 计算弹簧振子周期
export function calculateSpringPeriod(
  mass: number,
  springConstant: number
): {
  period: number;
  frequency: number;
  angularFrequency: number;
} {
  const omega = Math.sqrt(springConstant / mass);
  const T = 2 * Math.PI / omega;

  return {
    period: T,
    frequency: 1 / T,
    angularFrequency: omega,
  };
}

// 导出所有计算函数
export const experimentCalculations = {
  convexLens: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const { objectDistance, focalLength, objectHeight } = params;

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
        unit: '',
      },
      imageHeight: { value: objectHeight * m, unit: 'cm' },
    };
  },

  refraction: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const { incidentAngle, n1, n2 } = params;
    const result = determineRefraction(incidentAngle, n1, n2);

    return {
      refractionAngle: {
        value: result.refractionAngle ?? 0,
        unit: '°',
      },
      type: {
        value: result.type,
        unit: result.type === '全反射' ? `(临界角${result.criticalAngle?.toFixed(1)}°)` : '',
      },
      criticalAngle: { value: result.criticalAngle ?? 0, unit: '°' },
    };
  },

  pendulum: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const { length, gravity } = params;
    const { period, frequency, angularFrequency } = calculatePendulumPeriod(length, gravity);

    return {
      period: { value: period, unit: 's' },
      frequency: { value: frequency, unit: 'Hz' },
      angularFrequency: { value: angularFrequency, unit: 'rad/s' },
    };
  },

  springMass: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const { mass, springConstant } = params;
    const { period, frequency, angularFrequency } = calculateSpringPeriod(mass, springConstant);

    return {
      period: { value: period, unit: 's' },
      frequency: { value: frequency, unit: 'Hz' },
      angularFrequency: { value: angularFrequency, unit: 'rad/s' },
    };
  },

  forceComposition: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const { force1, angle1, force2, angle2 } = params;
    const { resultForce, resultAngle, xComponent, yComponent } =
      calculateResultantForce(force1, angle1, force2, angle2);

    return {
      resultForce: { value: resultForce, unit: 'N' },
      resultAngle: { value: resultAngle, unit: '°' },
      xComponent: { value: xComponent, unit: 'N' },
      yComponent: { value: yComponent, unit: 'N' },
    };
  },

  reaction: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const { temperature, concentration, catalyst } = params;
    const { reactionRate, halfLife, activationState } = calculateReactionRate(
      temperature,
      concentration,
      catalyst
    );

    return {
      reactionRate: { value: reactionRate, unit: 'mol/(L·s)' },
      halfLife: { value: halfLife, unit: 's' },
      activationState: { value: activationState, unit: '' },
    };
  },

  // 欧姆定律
  ohmsLaw: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const { voltage, resistance } = params;
    const current = voltage / resistance;
    const power = voltage * current;

    return {
      电流: { value: current, unit: 'A' },
      功率: { value: power, unit: 'W' },
      电路状态: { value: current > 1 ? '高电流' : '正常', unit: '' },
    };
  },

  // 自由落体
  freeFall: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const { height, gravity, time } = params;
    const distance = 0.5 * gravity * time * time;
    const velocity = gravity * time;
    const fallTime = Math.sqrt(2 * height / gravity);

    return {
      下落距离: { value: Math.min(distance, height), unit: 'm' },
      瞬时速度: { value: velocity, unit: 'm/s' },
      下落时间: { value: fallTime, unit: 's' },
    };
  },

  // 波的干涉
  waveInterference: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const { wavelength, slitDistance, screenDistance } = params;
    const fringeSpacing = (wavelength * screenDistance) / slitDistance;
    const waveSpeed = wavelength * 100; // 假设频率100Hz
    const frequency = waveSpeed / wavelength;

    return {
      干涉条纹间距: { value: fringeSpacing * 1000, unit: 'mm' },
      波速: { value: waveSpeed, unit: 'm/s' },
      频率: { value: frequency, unit: 'Hz' },
    };
  },

  // 理想气体
  idealGas: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const R = 8.314; // 气体常数 J/(mol·K)
    const { pressure, temperature, moles } = params;
    const volume = (moles * R * temperature) / pressure; // m³
    const avogadro = 6.022e23;
    const molecules = moles * avogadro;

    return {
      体积: { value: volume * 1000, unit: 'L' },
      分子数: { value: molecules, unit: '个' },
      状态: { value: pressure > 1e5 ? '高压' : pressure < 1e4 ? '低压' : '常压', unit: '' },
    };
  },

  // 酸碱滴定
  acidBaseTitration: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const { acidConcentration, baseVolume, addedVolume } = params;
    const totalVolume = baseVolume + addedVolume;
    const molesAcid = acidConcentration * addedVolume / 1000;
    const molesBase = 0.1 * baseVolume / 1000; // 假设碱浓度0.1mol/L
    const remaining = molesBase - molesAcid;
    let pH = 7;

    if (remaining > 0) {
      const OH = remaining / (totalVolume / 1000);
      pH = 14 + Math.log10(OH);
    } else if (remaining < 0) {
      const H = -remaining / (totalVolume / 1000);
      pH = -Math.log10(H);
    }

    const progress = Math.min(100, (addedVolume / (baseVolume / acidConcentration * 1000)) * 100);

    return {
      pH值: { value: Math.max(0, Math.min(14, pH)), unit: '' },
      反应进程: { value: progress, unit: '%' },
      滴定终点: { value: progress > 95 && progress < 105 ? '已到达' : '未到达', unit: '' },
    };
  },

  // 碰撞
  collision: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const { mass1, velocity1, mass2, velocity2, restitution } = params;

    // 完全非弹性碰撞后的速度
    const v1 = velocity1 * restitution + velocity2 * (1 - restitution) * mass2 / (mass1 + mass2);
    const v2 = velocity2 * restitution + velocity1 * (1 - restitution) * mass1 / (mass1 + mass2);

    const totalMomentum = mass1 * velocity1 + mass2 * velocity2;
    const kineticEnergyBefore = 0.5 * mass1 * velocity1 * velocity1 + 0.5 * mass2 * velocity2 * velocity2;
    const kineticEnergyAfter = 0.5 * mass1 * v1 * v1 + 0.5 * mass2 * v2 * v2;
    const energyLoss = kineticEnergyBefore - kineticEnergyAfter;

    return {
      系统总动量: { value: totalMomentum, unit: 'kg·m/s' },
      碰撞后速度1: { value: v1, unit: 'm/s' },
      碰撞后速度2: { value: v2, unit: 'm/s' },
      动能损失: { value: Math.max(0, energyLoss), unit: 'J' },
    };
  },

  // 多普勒效应
  dopplerEffect: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const { sourceFrequency, waveSpeed, observerVelocity, sourceVelocity } = params;

    let observedFrequency = sourceFrequency;
    let relativeMotion = '';

    if (observerVelocity > 0 && sourceVelocity === 0) {
      // 观察者靠近
      observedFrequency = sourceFrequency * (waveSpeed + observerVelocity) / waveSpeed;
      relativeMotion = '观察者靠近';
    } else if (observerVelocity < 0 && sourceVelocity === 0) {
      // 观察者远离
      observedFrequency = sourceFrequency * waveSpeed / (waveSpeed - observerVelocity);
      relativeMotion = '观察者远离';
    } else if (sourceVelocity > 0 && observerVelocity === 0) {
      // 波源远离
      observedFrequency = sourceFrequency * waveSpeed / (waveSpeed + sourceVelocity);
      relativeMotion = '波源远离';
    } else if (sourceVelocity < 0 && observerVelocity === 0) {
      // 波源靠近
      observedFrequency = sourceFrequency * waveSpeed / (waveSpeed + sourceVelocity);
      relativeMotion = '波源靠近';
    }

    return {
      接收频率: { value: observedFrequency, unit: 'Hz' },
      频率变化: { value: observedFrequency - sourceFrequency, unit: 'Hz' },
      相对运动: { value: relativeMotion || '静止', unit: '' },
    };
  },

  // 电磁感应
  electromagneticInduction: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const { magneticField, coilArea, coilTurns, changeRate } = params;
    const areaM2 = coilArea / 10000; // cm² -> m²
    const flux = magneticField * areaM2; // Wb
    const emf = Math.abs(coilTurns * flux * changeRate / 100); // V
    const resistance = 10; // 假设电阻10Ω
    const current = emf / resistance;

    return {
      磁通量: { value: flux * 1000, unit: 'mWb' },
      感应电动势: { value: emf, unit: 'V' },
      感应电流: { value: current, unit: 'A' },
    };
  },

  // 向心力
  centripetalForce: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const { mass, radius, angularVelocity } = params;
    const velocity = angularVelocity * radius;
    const force = mass * velocity * velocity / radius;
    const period = 2 * Math.PI / angularVelocity;

    return {
      向心力: { value: force, unit: 'N' },
      线速度: { value: velocity, unit: 'm/s' },
      周期: { value: period, unit: 's' },
    };
  },

  // 溶解度
  solubility: (
    params: Record<string, number>
  ): Record<string, CalculationResult> => {
    const { temperature, solventMass, soluteType } = params;

    // 不同溶质的溶解度特性
    const solubilityData: Record<number, { a: number; b: number }> = {
      1: { a: 35.7, b: 0.1 },   // NaCl
      2: { a: 13.3, b: 0.6 },   // KNO₃
      3: { a: 29.4, b: 0.2 },   // NH₄Cl
      4: { a: 0.2, b: -0.002 }, // CaSO₄
    };

    const data = solubilityData[soluteType] || solubilityData[1];
    const solubility = data.a + data.b * temperature; // g/100g水
    const dissolvedMass = Math.min(solubility * solventMass / 100, solubility * 2);

    return {
      溶解度: { value: solubility, unit: 'g/100g水' },
      已溶解质量: { value: dissolvedMass, unit: 'g' },
      溶液状态: { value: dissolvedMass >= solubility ? '饱和' : '未饱和', unit: '' },
    };
  },
};

// 根据实验ID获取计算结果
export function getExperimentResults(
  experimentId: string,
  params: Record<string, number>
): Record<string, CalculationResult> {
  switch (experimentId) {
    case 'convex-lens-imaging':
      return experimentCalculations.convexLens(params);
    case 'light-refraction':
      return experimentCalculations.refraction(params);
    case 'simple-pendulum':
      return experimentCalculations.pendulum(params);
    case 'spring-mass-oscillator':
      return experimentCalculations.springMass(params);
    case 'force-composition':
      return experimentCalculations.forceComposition(params);
    case 'chemical-reaction-rate':
      return experimentCalculations.reaction(params);
    case 'ohms-law':
      return experimentCalculations.ohmsLaw(params);
    case 'free-fall':
      return experimentCalculations.freeFall(params);
    case 'wave-interference':
      return experimentCalculations.waveInterference(params);
    case 'ideal-gas-law':
      return experimentCalculations.idealGas(params);
    case 'acid-base-titration':
      return experimentCalculations.acidBaseTitration(params);
    case 'collision':
      return experimentCalculations.collision(params);
    case 'doppler-effect':
      return experimentCalculations.dopplerEffect(params);
    case 'electromagnetic-induction':
      return experimentCalculations.electromagneticInduction(params);
    case 'centripetal-force':
      return experimentCalculations.centripetalForce(params);
    case 'solubility':
      return experimentCalculations.solubility(params);
    default:
      return {};
  }
}

export default experimentCalculations;

// Adapter: compute physics from ExperimentSchema's PhysicsConfig
export function computePhysicsFromSchema(
  physicsConfig: import('./experiment-schema').PhysicsConfig,
  paramValues: Record<string, number>
): Record<string, number> {
  const { computePhysics } = require('./physics-engine') as typeof import('./physics-engine');
  const result = computePhysics(physicsConfig, paramValues);
  return result.results;
}
