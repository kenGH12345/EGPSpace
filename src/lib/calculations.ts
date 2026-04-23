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
};

// 导出所有模板
export default calculationTemplates;
