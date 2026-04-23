/**
 * 交互实验生成的通用方法论
 *
 * 来源分析：Eureka 平台的实验生成系统
 *
 * 核心问题：如何让 AI 生成高质量的、交互式的、可视化的实验？
 *
 * 答案：不是写更长的提示词，而是建立正确的"实验Schema"和"生成流程"
 */

// Re-export unified ExperimentSchema as the single source of truth
export type { ExperimentSchema } from '@/lib/experiment-schema';
import type { ExperimentSchema } from '@/lib/experiment-schema';

// ============ Legacy Schema (kept for internal rule generation only) ============

interface LegacyCanvasElement {
  type: string;
  key?: string;
  position?: { x?: number; y?: number };
  draggable?: boolean;
  axis?: 'x' | 'y';
  [key: string]: unknown;
}

// ============ Data Flow Architecture ============

export interface DataFlow {
  input: {
    source: 'slider' | 'drag' | 'input';
    target: 'param.*';
  };
  compute: {
    formula: string;
    output: string[];
  };
  render: {
    state: string;
    targets: ('value-card' | 'animation' | 'chart')[];
  };
  reset: {
    action: string;
    targets: string[];
  };
}

// ============ Generation Rules ============

export interface GenerationRule {
  domain: string;
  conceptPattern: RegExp;
  params: string[];
  formulas: string[];
  canvas: LegacyCanvasElement[];
  interactions: string[];
}

export const generationRules: GenerationRule[] = [
  {
    domain: 'physics.mechanics',
    conceptPattern: /落体|自由落体|抛体/,
    params: ['height', 'gravity', 'mass'],
    formulas: ['h = ½gt²', 'v = gt'],
    canvas: [
      { type: 'scale', position: { x: 0 }, range: [0, 100] },
      { type: 'ball', key: 'object', draggable: true, axis: 'y' },
      { type: 'ground' },
      { type: 'chart', key: 'vt-chart', xAxis: 'time', yAxis: 'velocity' },
    ],
    interactions: ['start', 'reset'],
  },
  {
    domain: 'physics.mechanics',
    conceptPattern: /弹簧|振子|简谐/,
    params: ['mass', 'stiffness', 'displacement'],
    formulas: ['T = 2π√(m/k)', 'F = -kx'],
    canvas: [
      { type: 'spring', key: 'spring' },
      { type: 'mass', key: 'mass', draggable: true, axis: 'y' },
      { type: 'ground' },
    ],
    interactions: ['start', 'reset'],
  },
  {
    domain: 'physics.optics',
    conceptPattern: /透镜|成像|凸透镜|凹透镜/,
    params: ['objectDistance', 'focalLength', 'objectHeight'],
    formulas: ['1/u + 1/v = 1/f', 'm = -v/u'],
    canvas: [
      { type: 'axis', key: 'principal-axis' },
      { type: 'lens', key: 'lens' },
      { type: 'focus', key: 'f' },
      { type: 'object', key: 'object', draggable: true, axis: 'x' },
    ],
    interactions: ['reset'],
  },
  {
    domain: 'physics.electromagnetism',
    conceptPattern: /欧姆|电阻|电路/,
    params: ['voltage', 'resistance'],
    formulas: ['V = IR', 'P = UI'],
    canvas: [
      { type: 'circuit', key: 'circuit' },
      { type: 'ammeter', key: 'ammeter' },
      { type: 'voltmeter', key: 'voltmeter' },
    ],
    interactions: ['reset'],
  },
  {
    domain: 'chemistry.kinetics',
    conceptPattern: /反应|速率|催化剂/,
    params: ['temperature', 'concentration', 'catalyst'],
    formulas: ['v = k[A]^m[B]^n'],
    canvas: [
      { type: 'beaker', key: 'beaker' },
      { type: 'molecule', key: 'molecules' },
      { type: 'thermometer', key: 'temp' },
      { type: 'chart', key: 'rate-chart', xAxis: 'time', yAxis: 'concentration' },
    ],
    interactions: ['start', 'reset'],
  },
];

export function matchGenerationRule(concept: string): GenerationRule | null {
  for (const rule of generationRules) {
    if (rule.conceptPattern.test(concept)) {
      return rule;
    }
  }
  return null;
}

export function generateFromRule(concept: string, rule: GenerationRule): ExperimentSchema {
  return {
    meta: {
      name: concept,
      subject: rule.domain.startsWith('chemistry') ? 'chemistry' : 'physics',
      topic: concept,
      description: `理解${concept}的交互式实验`,
      icon: '🔬',
      gradient: 'from-blue-500 to-cyan-500',
      physicsType: 'generic',
    },
    params: rule.params.map((key) => ({
      name: key,
      label: key,
      unit: '',
      defaultValue: 50,
      min: 0,
      max: 100,
      step: 1,
      category: 'input' as const,
      description: '',
    })),
    formulas: rule.formulas.map((f, i) => ({
      name: `公式${i + 1}`,
      expression: f,
      description: '',
      variables: [],
      resultVariable: `result${i}`,
    })),
    canvas: {
      layout: { width: 560, height: 280, background: '#ffffff' },
      elements: [],
    },
    physics: {
      engine: 'generic',
      equations: rule.formulas.map((f, i) => ({
        name: `公式${i + 1}`,
        expression: f,
        description: '',
        variables: [],
        resultVariable: `result${i}`,
      })),
    },
    interactions: {
      sliders: rule.params.map((key) => ({
        param: key,
        label: key,
        min: 0,
        max: 100,
        step: 1,
        unit: '',
      })),
    },
    teaching: {},
    scenes: [],
  };
}

export const qualityCriteria = {
  mustHave: [
    '至少1个可拖拽/可调节的参数',
    '有物理公式支撑',
    '参数变化有视觉反馈',
    '有重置功能',
  ],
  shouldHave: [
    '实时数据显示',
    'v-t 或 s-t 图表',
    '公式解释',
    '易错点提示',
  ],
  niceToHave: [
    '手势控制',
    '历史记录',
    '导出数据',
    '对比模式',
  ],
};

export function validateExperiment(exp: ExperimentSchema): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (exp.params.filter(p => p.category === 'input').length === 0) {
    missing.push('无可配置参数');
  }

  if (exp.formulas.length === 0) {
    missing.push('无核心公式');
  }

  if (!exp.interactions?.sliders?.length && !exp.interactions?.drag?.length) {
    missing.push('无交互控件');
  }

  return { valid: missing.length === 0, missing };
}

export const metaPrompt = `生成一个关于 "{concept}" 的交互实验。

## 你需要产出什么

1. **参数定义** - 列出用户可以调节的参数（1-3个），每个参数的范围和默认值
2. **物理公式** - 核心公式（这个现象背后的物理规律）
3. **交互设计** - 哪些参数可以拖拽调节，哪些参数需要滑块调节
4. **可视化元素** - 需要哪些图形元素，需要哪些图表

## 格式要求

按 ExperimentSchema 格式输出 JSON。

## 约束

- 交互必须直观（至少一个参数可以拖拽）
- 公式必须物理正确
- 视觉必须清晰（不超过5种颜色）
`;
