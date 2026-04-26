/**
 * 预置实验配置
 * 参考 Eureka 的完整实验定义格式
 */

import { ExperimentConfig } from './experiment-types';
import { calculationTemplates } from './calculations';
import { additionalExperiments } from './additional-experiments';

// ========== 1. 凸透镜成像实验 ==========

export const convexLensExperiment: ExperimentConfig = {
  id: 'convex-lens-imaging',
  title: '凸透镜成像实验',
  description: '探究凸透镜成像规律，观察物距、像距与像大小的关系',
  theory: '当物体位于凸透镜不同位置时，会形成不同性质的像。物距大于2倍焦距时成倒立缩小实像；物距在1-2倍焦距之间时成倒立放大实像；物距小于焦距时成正立放大虚像。',
  formula: '1/u + 1/v = 1/f',
  formulaExplanation: 'u为物距，v为像距，f为焦距',
  params: [
    {
      key: 'objectDistance',
      name: '物距',
      unit: 'cm',
      min: 5,
      max: 50,
      default: 15,
      step: 1,
      description: '物体到透镜的距离',
      gestureControl: {
        finger: 'index',
        direction: 'horizontal',
        sensitivity: 0.5,
      },
    },
    {
      key: 'focalLength',
      name: '焦距',
      unit: 'cm',
      min: 5,
      max: 20,
      default: 10,
      step: 1,
      description: '透镜的焦距长度',
    },
    {
      key: 'objectHeight',
      name: '物体高度',
      unit: 'cm',
      min: 1,
      max: 10,
      default: 4,
      step: 1,
      description: '物体的高度',
    },
  ],
  statusItems: [
    {
      label: '像距',
      value: 0, // 动态计算
      unit: 'cm',
      color: '#6366F1',
    },
    {
      label: '放大率',
      value: 0,
      unit: '×',
      color: '#10B981',
    },
    {
      label: '像的性质',
      value: '',
      unit: '',
      color: '#F59E0B',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '拖动滑块或使用手势改变物距，观察像的变化',
    },
    {
      icon: 'warning',
      text: '物距小于焦距时成虚像，无法在光屏上呈现',
    },
    {
      icon: 'success',
      text: '物距大于2倍焦距时成倒立缩小实像',
    },
  ],
  examples: [
    {
      title: '观察缩小实像',
      desc: '设置物距大于20cm，观察倒立缩小实像',
    },
    {
      title: '观察放大实像',
      desc: '设置物距在10-20cm之间，观察倒立放大实像',
    },
    {
      title: '观察虚像',
      desc: '设置物距小于焦距10cm，观察正立放大虚像',
    },
  ],
};

// ========== 2. 光的折射实验 ==========

export const refractionExperiment: ExperimentConfig = {
  id: 'light-refraction',
  title: '光的折射实验',
  description: '探究光的折射规律，观察入射角与折射角的关系',
  theory: '光从一种介质斜射入另一种介质时，传播方向发生改变的现象叫折射。折射定律（斯涅尔定律）：入射角的正弦与折射角的正弦之比等于两种介质的折射率之比。',
  formula: 'n₁·sinθ₁ = n₂·sinθ₂',
  formulaExplanation: 'n₁、n₂为两种介质的折射率，θ₁为入射角，θ₂为折射角',
  params: [
    {
      key: 'incidentAngle',
      name: '入射角',
      unit: '°',
      min: 0,
      max: 89,
      default: 30,
      step: 1,
      description: '入射光线与法线的夹角',
      gestureControl: {
        finger: 'index',
        direction: 'horizontal',
        sensitivity: 0.5,
      },
    },
    {
      key: 'n1',
      name: '入射介质折射率',
      unit: '',
      min: 1.0,
      max: 2.5,
      default: 1.0,
      step: 0.1,
      description: '光从该介质射入',
    },
    {
      key: 'n2',
      name: '折射介质折射率',
      unit: '',
      min: 1.0,
      max: 2.5,
      default: 1.5,
      step: 0.1,
      description: '光射入该介质',
    },
  ],
  statusItems: [
    {
      label: '折射角',
      value: 0,
      unit: '°',
      color: '#10B981',
    },
    {
      label: '折射类型',
      value: '',
      unit: '',
      color: '#EF4444',
    },
    {
      label: '临界角',
      value: 0,
      unit: '°',
      color: '#8B5CF6',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '入射角增大时，折射角也增大',
    },
    {
      icon: 'warning',
      text: '当入射角大于临界角时发生全反射',
    },
    {
      icon: 'success',
      text: '垂直入射时光线不发生偏折',
    },
  ],
  examples: [
    {
      title: '观察折射偏折',
      desc: '设置入射角为30°，观察光线的偏折',
    },
    {
      title: '观察全反射',
      desc: '逐渐增大入射角直到发生全反射',
    },
  ],
};

// ========== 3. 单摆周期实验 ==========

export const pendulumExperiment: ExperimentConfig = {
  id: 'simple-pendulum',
  title: '单摆周期实验',
  description: '探究单摆周期与摆长、重力加速度的关系',
  theory: '单摆在小角度摆动时，其周期只与摆长和重力加速度有关，与振幅和摆球质量无关。公式：T = 2π√(L/g)',
  formula: 'T = 2π√(L/g)',
  formulaExplanation: 'T为周期，L为摆长，g为重力加速度',
  params: [
    {
      key: 'length',
      name: '摆长',
      unit: 'm',
      min: 0.2,
      max: 2.0,
      default: 1.0,
      step: 0.1,
      description: '摆球中心到支点的距离',
      gestureControl: {
        finger: 'index',
        direction: 'vertical',
        sensitivity: 0.5,
      },
    },
    {
      key: 'angle',
      name: '初始角度',
      unit: '°',
      min: 5,
      max: 45,
      default: 15,
      step: 1,
      description: '摆锤初始偏离平衡位置的角度',
    },
    {
      key: 'gravity',
      name: '重力加速度',
      unit: 'm/s²',
      min: 1.0,
      max: 20.0,
      default: 9.8,
      step: 0.1,
      description: '当地的重力加速度',
    },
  ],
  statusItems: [
    {
      label: '周期',
      value: 0,
      unit: 's',
      color: '#3B82F6',
    },
    {
      label: '频率',
      value: 0,
      unit: 'Hz',
      color: '#10B981',
    },
    {
      label: '角频率',
      value: 0,
      unit: 'rad/s',
      color: '#8B5CF6',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '摆长越长，周期越大',
    },
    {
      icon: 'warning',
      text: '小角度摆动时周期近似恒定',
    },
    {
      icon: 'success',
      text: '周期与摆球质量无关',
    },
  ],
  examples: [
    {
      title: '测量重力加速度',
      desc: '测量摆长和周期，计算g',
    },
    {
      title: '验证周期公式',
      desc: '改变摆长观察周期变化',
    },
  ],
};

// ========== 4. 弹簧振子实验 ==========

export const springExperiment: ExperimentConfig = {
  id: 'spring-mass-oscillator',
  title: '弹簧振子实验',
  description: '探究弹簧振子周期与质量和劲度系数的关系',
  theory: '弹簧振子做简谐运动时，其周期由质量和劲度系数决定：T = 2π√(m/k)。振幅决定了振动的能量大小。',
  formula: 'T = 2π√(m/k)',
  formulaExplanation: 'T为周期，m为质量，k为劲度系数',
  params: [
    {
      key: 'mass',
      name: '质量',
      unit: 'kg',
      min: 0.1,
      max: 2.0,
      default: 0.5,
      step: 0.1,
      description: '振子的质量',
      gestureControl: {
        finger: 'thumb',
        direction: 'vertical',
        sensitivity: 0.3,
      },
    },
    {
      key: 'springConstant',
      name: '劲度系数',
      unit: 'N/m',
      min: 1,
      max: 50,
      default: 10,
      step: 1,
      description: '弹簧的劲度系数',
    },
    {
      key: 'displacement',
      name: '初始位移',
      unit: 'm',
      min: -0.3,
      max: 0.3,
      default: 0.1,
      step: 0.01,
      description: '振子初始偏离平衡位置的距离',
    },
  ],
  statusItems: [
    {
      label: '周期',
      value: 0,
      unit: 's',
      color: '#3B82F6',
    },
    {
      label: '频率',
      value: 0,
      unit: 'Hz',
      color: '#10B981',
    },
    {
      label: '角频率',
      value: 0,
      unit: 'rad/s',
      color: '#8B5CF6',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '质量越大，周期越大',
    },
    {
      icon: 'warning',
      text: '劲度系数越大，周期越小',
    },
    {
      icon: 'success',
      text: '周期与振幅无关',
    },
  ],
  examples: [
    {
      title: '观察振动',
      desc: '设置初始位移，观察振子振动',
    },
    {
      title: '改变质量',
      desc: '改变质量观察周期变化',
    },
  ],
};

// ========== 5. 力的合成实验 ==========

export const forceCompositionExperiment: ExperimentConfig = {
  id: 'force-composition',
  title: '力的合成与分解',
  description: '探究两个力的合成遵循平行四边形定则',
  theory: '求两个共点力的合力，可以通过平移使两个力首尾相连，连接首尾即得合力。合力大小可用余弦定理计算，方向由平行四边形对角线决定。',
  formula: 'F = √(F₁² + F₂² + 2F₁F₂cosθ)',
  formulaExplanation: 'θ为两力的夹角',
  params: [
    {
      key: 'force1',
      name: '力F₁',
      unit: 'N',
      min: 1,
      max: 20,
      default: 8,
      step: 1,
      description: '第一个力的大小',
      gestureControl: {
        finger: 'index',
        direction: 'horizontal',
        sensitivity: 0.5,
      },
    },
    {
      key: 'angle1',
      name: '方向θ₁',
      unit: '°',
      min: 0,
      max: 360,
      default: 30,
      step: 1,
      description: 'F₁的方向角度',
    },
    {
      key: 'force2',
      name: '力F₂',
      unit: 'N',
      min: 1,
      max: 20,
      default: 6,
      step: 1,
      description: '第二个力的大小',
      gestureControl: {
        finger: 'middle',
        direction: 'horizontal',
        sensitivity: 0.5,
      },
    },
    {
      key: 'angle2',
      name: '方向θ₂',
      unit: '°',
      min: 0,
      max: 360,
      default: -45,
      step: 1,
      description: 'F₂的方向角度',
    },
  ],
  statusItems: [
    {
      label: '合力',
      value: 0,
      unit: 'N',
      color: '#10B981',
    },
    {
      label: '合力方向',
      value: 0,
      unit: '°',
      color: '#3B82F6',
    },
    {
      label: 'X分量',
      value: 0,
      unit: 'N',
      color: '#EF4444',
    },
    {
      label: 'Y分量',
      value: 0,
      unit: 'N',
      color: '#8B5CF6',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '用平行四边形法则求合力',
    },
    {
      icon: 'warning',
      text: '两力夹角越大，合力越小',
    },
    {
      icon: 'success',
      text: '夹角为0°时合力最大，夹角为180°时合力最小',
    },
  ],
  examples: [
    {
      title: '同向合力',
      desc: '设置两力同向，观察最大合力',
    },
    {
      title: '反向合力',
      desc: '设置两力反向，观察合力减小',
    },
  ],
};

// ========== 6. 化学反应速率实验 ==========

export const chemicalReactionExperiment: ExperimentConfig = {
  id: 'chemical-reaction-rate',
  title: '化学反应速率实验',
  description: '探究温度和浓度对化学反应速率的影响',
  theory: '反应速率受温度、浓度、催化剂等因素影响。温度升高或浓度增大，反应速率加快。阿伦尼乌斯方程描述了温度对反应速率常数的影响。',
  formula: 'k = A·e^(-Ea/RT)',
  formulaExplanation: 'k为速率常数，A为指前因子，Ea为活化能，R为气体常数，T为温度',
  params: [
    {
      key: 'temperature',
      name: '温度',
      unit: '°C',
      min: 20,
      max: 100,
      default: 25,
      step: 1,
      description: '反应温度',
      gestureControl: {
        finger: 'index',
        direction: 'horizontal',
        sensitivity: 0.5,
      },
    },
    {
      key: 'concentration',
      name: '反应物浓度',
      unit: 'mol/L',
      min: 0.1,
      max: 2.0,
      default: 0.5,
      step: 0.1,
      description: '反应物的初始浓度',
    },
    {
      key: 'catalyst',
      name: '催化剂用量',
      unit: 'g',
      min: 0,
      max: 5,
      default: 0,
      step: 0.5,
      description: '催化剂的用量',
    },
  ],
  statusItems: [
    {
      label: '反应速率',
      value: 0,
      unit: 'mol/(L·s)',
      color: '#3B82F6',
    },
    {
      label: '半衰期',
      value: 0,
      unit: 's',
      color: '#EF4444',
    },
    {
      label: '活化状态',
      value: '',
      unit: '',
      color: '#10B981',
    },
  ],
  tips: [
    {
      icon: 'info',
      text: '温度升高，反应速率加快',
    },
    {
      icon: 'warning',
      text: '催化剂可降低活化能，加快反应',
    },
    {
      icon: 'success',
      text: '浓度增大，反应速率加快',
    },
  ],
  examples: [
    {
      title: '温度影响',
      desc: '改变温度观察速率变化',
    },
    {
      title: '催化剂作用',
      desc: '添加催化剂观察加速效果',
    },
  ],
};

// ========== 导出所有实验 ==========

export const presetExperiments: ExperimentConfig[] = [
  convexLensExperiment,
  refractionExperiment,
  pendulumExperiment,
  springExperiment,
  forceCompositionExperiment,
  chemicalReactionExperiment,
  ...additionalExperiments,
];

// 根据ID获取实验
export function getExperimentById(id: string): ExperimentConfig | undefined {
  return presetExperiments.find((exp) => exp.id === id);
}

// 获取实验计算结果
export function getExperimentCalculations(
  experimentId: string,
  params: Record<string, number>
): Record<string, { value: number | string; unit: string }> {
  switch (experimentId) {
    case 'convex-lens-imaging':
      return calculationTemplates.convexLens(params);
    case 'light-refraction':
      return calculationTemplates.refraction(params);
    case 'simple-pendulum':
      return calculationTemplates.pendulum(params);
    case 'spring-mass-oscillator':
      return calculationTemplates.springMass(params);
    case 'force-composition':
      return calculationTemplates.forceComposition(params);
    case 'chemical-reaction-rate':
      return calculationTemplates.reaction(params);
    default:
      return {};
  }
}

export default presetExperiments;

// ========== Unified Schema exports (Phase 2 migration) ==========

import {
  createBuoyancyExperiment,
  createLeverExperiment,
  createRefractionExperiment,
  createCircuitExperiment,
  createAcidBaseTitrationExperiment,
  createElectrolysisExperiment,
  createReactionRateExperiment,
  createCombustionExperiment,
  ExperimentSchema,
} from './experiment-schema';
// import { enrichSchema } from './schema-enricher'; // Not used in current module
// import { validateParams } from './ai-validator'; // Module not yet implemented

export interface EnrichedExperiment {
  id: string;
  name: string;
  type: string;
  schema: ExperimentSchema;
}

export type { ExperimentSchema };

export const presetExperimentSchemas: ExperimentSchema[] = [
  createBuoyancyExperiment(),
  createLeverExperiment(),
  createRefractionExperiment(),
  createCircuitExperiment(),
];

export function getExperimentSchemaByType(physicsType: string): ExperimentSchema | undefined {
  return presetExperimentSchemas.find(s => s.meta.physicsType === physicsType);
}

export const experimentFactories = [
  { id: 'buoyancy', name: '浮力实验', type: '物理', create: createBuoyancyExperiment },
  { id: 'lever', name: '杠杆实验', type: '物理', create: createLeverExperiment },
  { id: 'refraction', name: '折射实验', type: '物理', create: createRefractionExperiment },
  { id: 'circuit', name: '电路实验', type: '物理', create: createCircuitExperiment },

  // 化学实验 (Phase 2 — 统一框架迁移)
  { id: 'acid-base-titration', name: '酸碱滴定实验', type: '化学', create: createAcidBaseTitrationExperiment },
  { id: 'electrolysis', name: '电解水实验', type: '化学', create: createElectrolysisExperiment },
  { id: 'reaction-rate', name: '化学反应速率实验', type: '化学', create: createReactionRateExperiment },
  { id: 'combustion', name: '燃烧条件探究实验', type: '化学', create: createCombustionExperiment },
];
