/**
 * Unified Experiment Schema — Single Source of Truth
 *
 * Consolidates three legacy Schema systems:
 *   1. ExperimentConfig  (DynamicExperiment.tsx) — LLM output + runtime rendering
 *   2. ExperimentSchema  (experiment-methodology.ts) — Declarative config
 *   3. ExperimentType    (experiment-types.ts) — Draw element types
 *
 * Architecture decisions: DEC-1 (unified structure), DEC-2 (dual-track rendering),
 * DEC-3 (declarative formulas + engine adapters)
 */

// ============ Meta ============

export type SubjectDomain = 'physics' | 'chemistry' | 'biology' | 'geography' | 'math';

// Physics engine types
type PhysicsType = 'buoyancy' | 'lever' | 'refraction' | 'circuit' | 'pendulum' | 'wave';
// Chemistry engine types
type ChemistryType = 'acid_base' | 'electrolysis' | 'reaction_rate' | 'titration';
// Biology engine types
type BiologyType = 'osmosis' | 'enzyme' | 'population' | 'photosynthesis';
// Math engine types
type MathType = 'function_graph' | 'geometry' | 'probability' | 'statistics';
// Fallback
type GenericType = 'generic';

export type PhysicsEngineType = PhysicsType | ChemistryType | BiologyType | MathType | GenericType;

export interface ExperimentMeta {
  name: string;
  subject: SubjectDomain;
  topic: string;
  description: string;
  icon: string;
  gradient: string;
  physicsType: PhysicsEngineType;
}

// ============ Params ============

export type ParamCategory = 'input' | 'computed' | 'reference';

export interface ParamDefinition {
  name: string;
  label: string;
  unit: string;
  defaultValue: number;
  min: number;
  max: number;
  step: number;
  category: ParamCategory;
  description: string;
}

// ============ Formulas ============

export interface FormulaDefinition {
  name: string;
  expression: string;
  description: string;
  variables: string[];
  resultVariable: string;
}

// ============ Canvas ============

export type ElementType =
  // Base geometry (original 8)
  | 'rect' | 'circle' | 'line' | 'arrow' | 'text' | 'polygon' | 'arc' | 'image'
  // Physics-specific (5 new)
  | 'spring' | 'wave' | 'pendulum' | 'forceArrow' | 'lightRay'
  // Chemistry-specific (4 new)
  | 'beaker' | 'molecule' | 'bubble' | 'reaction'
  // Math-specific (3 new)
  | 'axis' | 'functionPlot' | 'point'
  // Composite (1 new)
  | 'group';

export interface CanvasElement {
  id: string;
  type: ElementType;
  label?: string;
  x: number | string;
  y: number | string;
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  x2?: number | string;
  y2?: number | string;
  points?: { x: number | string; y: number | string }[];
  startAngle?: number | string;
  endAngle?: number | string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  fontSize?: number;
  text?: string;
  opacity?: number;
  visible?: boolean;
  dynamic?: {
    x?: string;
    y?: string;
    width?: string;
    height?: string;
    fill?: string;
    visible?: string;
  };
  children?: CanvasElement[];
  // Physics-specific fields
  length?: number | string;
  coils?: number;
  amplitude?: number | string;
  wavelength?: number | string;
  phase?: number | string;
  anchorX?: number | string;
  anchorY?: number | string;
  bobRadius?: number;
  angle?: number | string;
  magnitude?: number | string;
  // Chemistry-specific fields
  fillLevel?: number | string;
  liquidColor?: string;
  moleculeType?: string;
  // Math-specific fields
  fn?: string;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  // Composite fields
  transform?: string;
}

export interface CanvasLayout {
  width: number;
  height: number;
  background: string;
  grid?: { show: boolean; spacing: number; color: string };
  coordinateSystem?: { origin: 'center' | 'topLeft' | 'bottomLeft'; scaleX: number; scaleY: number };
}

export interface CanvasConfig {
  layout: CanvasLayout;
  elements: CanvasElement[];
  presetTemplate?: PhysicsEngineType;
}

// ============ Physics ============

export interface PhysicsConstraint {
  variable: string;
  min?: number;
  max?: number;
  condition?: string;
}

export interface ComputedParam {
  name: string;
  formula: string;
  dependsOn: string[];
}

export interface PhysicsConfig {
  engine: PhysicsEngineType;
  equations: FormulaDefinition[];
  constraints?: PhysicsConstraint[];
  computedParams?: ComputedParam[];
}

// ============ Interactions ============

export interface SliderConfig {
  param: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export interface DragConfig {
  elementId: string;
  constrainTo?: 'horizontal' | 'vertical' | 'circular';
  paramMapping: { dx?: string; dy?: string };
}

export interface AnimationConfig {
  type: 'oscillate' | 'rotate' | 'translate';
  target: string;
  params: Record<string, string>;
}

export interface InteractionConfig {
  sliders?: SliderConfig[];
  drag?: DragConfig[];
  animation?: AnimationConfig[];
}

// ============ Teaching ============

export interface UnderstandingDesign {
  objective: string;
  keyConcepts: string[];
  prerequisites: string[];
}

export interface ReasoningDesign {
  hypothesis: string;
  variables: string[];
  controlMethod: string;
}

export interface ExperimentDesign {
  steps: string[];
  dataCollection: string;
  analysisMethod: string;
}

export interface ErrorDesign {
  common: string[];
  prevention: string[];
}

export interface EvaluationDesign {
  questions: string[];
  criteria: string[];
}

export interface TeachingDesign {
  understanding?: UnderstandingDesign;
  reasoning?: ReasoningDesign;
  design?: ExperimentDesign;
  errors?: ErrorDesign;
  evaluation?: EvaluationDesign;
}

// ============ Scenes ============

export interface ExperimentScene {
  name: string;
  description: string;
  params: Record<string, number>;
}

// ============ Unified Schema ============

export interface ExperimentSchema {
  meta: ExperimentMeta;
  params: ParamDefinition[];
  formulas: FormulaDefinition[];
  canvas: CanvasConfig;
  physics: PhysicsConfig;
  interactions?: InteractionConfig;
  teaching?: TeachingDesign;
  scenes?: ExperimentScene[];
}

// ============ Default Values ============

const DEFAULT_CANVAS_LAYOUT: CanvasLayout = {
  width: 560,
  height: 280,
  background: '#ffffff',
};

const DEFAULT_META: ExperimentMeta = {
  name: '未命名实验',
  subject: 'physics',
  topic: '通用',
  description: '',
  icon: '🔬',
  gradient: 'from-blue-500 to-cyan-500',
  physicsType: 'generic',
};

// ============ Factory Functions ============

export function createDefaultSchema(overrides?: Partial<ExperimentMeta>): ExperimentSchema {
  const meta: ExperimentMeta = { ...DEFAULT_META, ...overrides };
  return {
    meta,
    params: [],
    formulas: [],
    canvas: {
      layout: { ...DEFAULT_CANVAS_LAYOUT },
      elements: [],
    },
    physics: {
      engine: meta.physicsType,
      equations: [],
    },
    teaching: {},
    scenes: [],
  };
}

export function createBuoyancyExperiment(): ExperimentSchema {
  return {
    meta: {
      name: '浮力实验',
      subject: 'physics',
      topic: '浮力',
      description: '探索物体在液体中的浮沉规律',
      icon: '🌊',
      gradient: 'from-cyan-500 to-blue-500',
      physicsType: 'buoyancy',
    },
    params: [
      {
        name: 'rho_object',
        label: '物体密度 (ρ物)',
        unit: 'kg/m³',
        defaultValue: 800,
        min: 200,
        max: 2000,
        step: 10,
        category: 'input',
        description: '物体本身的密度，决定浮沉状态',
      },
      {
        name: 'rho_liquid',
        label: '液体密度 (ρ液)',
        unit: 'kg/m³',
        defaultValue: 1000,
        min: 800,
        max: 13600,
        step: 50,
        category: 'input',
        description: '液体密度（水/盐水/汞等）',
      },
    ],
    formulas: [
      {
        name: '浮力公式',
        expression: 'F = ρ液 × g × V排',
        description: '阿基米德原理：浮力等于排开液体的重力',
        variables: ['rho_liquid', 'g', 'V_displaced'],
        resultVariable: 'buoyantForce',
      },
      {
        name: '重力公式',
        expression: 'G = ρ物 × g × V物',
        description: '物体所受重力',
        variables: ['rho_object', 'g', 'V_object'],
        resultVariable: 'gravity',
      },
    ],
    canvas: {
      layout: { ...DEFAULT_CANVAS_LAYOUT },
      elements: [],
      presetTemplate: 'buoyancy',
    },
    physics: {
      engine: 'buoyancy',
      equations: [
        {
          name: '浮力',
          expression: 'F = ρ液 × g × V排',
          description: '阿基米德原理',
          variables: ['rho_liquid', 'g', 'V_displaced'],
          resultVariable: 'buoyantForce',
        },
      ],
      computedParams: [
        {
          name: 'immersionRatio',
          formula: 'min(1, ρ物 / ρ液)',
          dependsOn: ['rho_object', 'rho_liquid'],
        },
        {
          name: 'buoyantForce',
          formula: 'ρ液 × g × V物 × immersionRatio',
          dependsOn: ['rho_liquid', 'g', 'V_object', 'immersionRatio'],
        },
        {
          name: 'gravity',
          formula: 'ρ物 × g × V物',
          dependsOn: ['rho_object', 'g', 'V_object'],
        },
      ],
    },
    interactions: {
      sliders: [
        { param: 'rho_object', label: '物体密度', min: 200, max: 2000, step: 10, unit: 'kg/m³' },
        { param: 'rho_liquid', label: '液体密度', min: 800, max: 13600, step: 50, unit: 'kg/m³' },
      ],
    },
    teaching: {
      understanding: {
        objective: '理解浮力产生的原因和浮沉条件',
        keyConcepts: ['阿基米德原理', '浮沉条件', '密度与浮力的关系'],
        prerequisites: ['力的基本概念', '密度的定义'],
      },
      reasoning: {
        hypothesis: '物体密度小于液体密度时上浮，大于时下沉',
        variables: ['物体密度', '液体密度'],
        controlMethod: '控制液体密度不变，改变物体密度',
      },
      design: {
        steps: ['选择不同密度的物体', '放入同种液体中观察', '记录浮沉状态和浸入比例'],
        dataCollection: '记录物体密度、液体密度、浮沉状态',
        analysisMethod: '比较物体密度与液体密度的比值',
      },
      errors: {
        common: ['混淆浮力和重力', '忽略浸入比例的物理意义'],
        prevention: ['强调浮沉条件的推导过程', '用具体数值验证'],
      },
      evaluation: {
        questions: ['为什么铁块在水中下沉，铁船却能浮在水面？'],
        criteria: ['能正确判断浮沉状态', '能解释浸入比例的物理含义'],
      },
    },
    scenes: [
      { name: '木块在水中', description: '低密度物体上浮', params: { rho_object: 600, rho_liquid: 1000 } },
      { name: '铁块在水中', description: '高密度物体下沉', params: { rho_object: 7800, rho_liquid: 1000 } },
      { name: '铁块在水银中', description: '高密度液体使铁块上浮', params: { rho_object: 7800, rho_liquid: 13600 } },
    ],
  };
}

export function createLeverExperiment(): ExperimentSchema {
  return {
    meta: {
      name: '杠杆实验',
      subject: 'physics',
      topic: '杠杆',
      description: '探索杠杆平衡的条件',
      icon: '⚖️',
      gradient: 'from-amber-500 to-orange-500',
      physicsType: 'lever',
    },
    params: [
      { name: 'leftArm', label: '左力臂', unit: 'cm', defaultValue: 20, min: 5, max: 50, step: 1, category: 'input', description: '支点左侧力臂长度' },
      { name: 'rightArm', label: '右力臂', unit: 'cm', defaultValue: 20, min: 5, max: 50, step: 1, category: 'input', description: '支点右侧力臂长度' },
      { name: 'leftMass', label: '左物重', unit: 'kg', defaultValue: 2, min: 0.1, max: 10, step: 0.1, category: 'input', description: '左侧物体质量' },
      { name: 'rightMass', label: '右物重', unit: 'kg', defaultValue: 2, min: 0.1, max: 10, step: 0.1, category: 'input', description: '右侧物体质量' },
    ],
    formulas: [
      { name: '杠杆平衡条件', expression: 'F1 × L1 = F2 × L2', description: '力矩平衡：动力×动力臂 = 阻力×阻力臂', variables: ['leftMass', 'leftArm', 'rightMass', 'rightArm'], resultVariable: 'torqueBalance' },
    ],
    canvas: { layout: { ...DEFAULT_CANVAS_LAYOUT }, elements: [], presetTemplate: 'lever' },
    physics: {
      engine: 'lever',
      equations: [
        { name: '力矩平衡', expression: 'F1 × L1 = F2 × L2', description: '杠杆平衡条件', variables: ['leftMass', 'leftArm', 'rightMass', 'rightArm'], resultVariable: 'torqueBalance' },
      ],
      computedParams: [
        { name: 'leftTorque', formula: 'leftMass * g * leftArm', dependsOn: ['leftMass', 'leftArm'] },
        { name: 'rightTorque', formula: 'rightMass * g * rightArm', dependsOn: ['rightMass', 'rightArm'] },
        { name: 'isBalanced', formula: 'abs(leftTorque - rightTorque) < 0.01', dependsOn: ['leftTorque', 'rightTorque'] },
      ],
    },
    interactions: {
      sliders: [
        { param: 'leftArm', label: '左力臂', min: 5, max: 50, step: 1, unit: 'cm' },
        { param: 'rightArm', label: '右力臂', min: 5, max: 50, step: 1, unit: 'cm' },
        { param: 'leftMass', label: '左物重', min: 0.1, max: 10, step: 0.1, unit: 'kg' },
        { param: 'rightMass', label: '右物重', min: 0.1, max: 10, step: 0.1, unit: 'kg' },
      ],
    },
    teaching: {
      understanding: { objective: '理解杠杆平衡条件', keyConcepts: ['力矩', '力臂', '平衡条件'], prerequisites: ['力的概念', '力矩的概念'] },
      reasoning: { hypothesis: '当动力×动力臂 = 阻力×阻力臂时，杠杆平衡', variables: ['力臂长度', '物体质量'], controlMethod: '保持一侧不变，改变另一侧' },
      design: { steps: ['调整左侧力臂和物重', '调整右侧力臂和物重', '观察平衡状态'], dataCollection: '记录左右力臂和物重', analysisMethod: '比较左右力矩大小' },
      errors: { common: ['混淆力和力矩', '忽略力臂的测量起点'], prevention: ['强调力臂的定义', '从支点开始测量'] },
      evaluation: { questions: ['为什么天平能测量质量？'], criteria: ['能正确判断平衡状态', '能计算未知量'] },
    },
    scenes: [
      { name: '等臂等重', description: '力臂和物重都相等', params: { leftArm: 20, rightArm: 20, leftMass: 2, rightMass: 2 } },
      { name: '不等臂平衡', description: '长臂轻物平衡短臂重物', params: { leftArm: 40, rightArm: 20, leftMass: 1, rightMass: 2 } },
    ],
  };
}

export function createRefractionExperiment(): ExperimentSchema {
  return {
    meta: {
      name: '折射实验',
      subject: 'physics',
      topic: '光的折射',
      description: '探索光从一种介质进入另一种介质时的折射规律',
      icon: '🔍',
      gradient: 'from-violet-500 to-purple-500',
      physicsType: 'refraction',
    },
    params: [
      { name: 'incidentAngle', label: '入射角', unit: '°', defaultValue: 30, min: 0, max: 89, step: 1, category: 'input', description: '光线入射角度' },
      { name: 'n1', label: '介质1折射率', unit: '', defaultValue: 1.0, min: 1.0, max: 2.5, step: 0.01, category: 'input', description: '入射介质折射率（空气=1.0）' },
      { name: 'n2', label: '介质2折射率', unit: '', defaultValue: 1.5, min: 1.0, max: 2.5, step: 0.01, category: 'input', description: '折射介质折射率（水≈1.33，玻璃≈1.5）' },
    ],
    formulas: [
      { name: '斯涅尔定律', expression: 'n1 × sin(θ1) = n2 × sin(θ2)', description: '折射定律', variables: ['n1', 'incidentAngle', 'n2'], resultVariable: 'refractionAngle' },
    ],
    canvas: { layout: { ...DEFAULT_CANVAS_LAYOUT }, elements: [], presetTemplate: 'refraction' },
    physics: {
      engine: 'refraction',
      equations: [
        { name: '斯涅尔定律', expression: 'n1 × sin(θ1) = n2 × sin(θ2)', description: '折射定律', variables: ['n1', 'incidentAngle', 'n2'], resultVariable: 'refractionAngle' },
      ],
      computedParams: [
        { name: 'refractionAngle', formula: 'asin(n1/n2 * sin(incidentAngle))', dependsOn: ['n1', 'n2', 'incidentAngle'] },
        { name: 'isTotalReflection', formula: 'n1 > n2 and incidentAngle > asin(n2/n1)', dependsOn: ['n1', 'n2', 'incidentAngle'] },
      ],
    },
    interactions: {
      sliders: [
        { param: 'incidentAngle', label: '入射角', min: 0, max: 89, step: 1, unit: '°' },
        { param: 'n1', label: '介质1折射率', min: 1.0, max: 2.5, step: 0.01, unit: '' },
        { param: 'n2', label: '介质2折射率', min: 1.0, max: 2.5, step: 0.01, unit: '' },
      ],
    },
    teaching: {
      understanding: { objective: '理解光的折射规律和斯涅尔定律', keyConcepts: ['折射率', '入射角', '折射角', '全反射'], prerequisites: ['光的直线传播', '角度测量'] },
      reasoning: { hypothesis: '光从光密介质进入光疏介质时折射角大于入射角', variables: ['入射角', '介质折射率'], controlMethod: '固定介质折射率，改变入射角' },
      design: { steps: ['设置两种介质的折射率', '改变入射角', '观察折射角变化'], dataCollection: '记录入射角和折射角', analysisMethod: '验证n1sinθ1=n2sinθ2' },
      errors: { common: ['混淆入射角和折射角', '忽略全反射条件'], prevention: ['标注法线', '强调临界角概念'] },
      evaluation: { questions: ['为什么水中的筷子看起来弯折？'], criteria: ['能正确计算折射角', '能判断全反射条件'] },
    },
    scenes: [
      { name: '空气→玻璃', description: '光从空气进入玻璃', params: { incidentAngle: 30, n1: 1.0, n2: 1.5 } },
      { name: '空气→水', description: '光从空气进入水', params: { incidentAngle: 45, n1: 1.0, n2: 1.33 } },
      { name: '接近全反射', description: '入射角接近临界角', params: { incidentAngle: 40, n1: 1.5, n2: 1.0 } },
    ],
  };
}

export function createCircuitExperiment(): ExperimentSchema {
  return {
    meta: {
      name: '电路实验',
      subject: 'physics',
      topic: '欧姆定律',
      description: '探索电流、电压和电阻的关系',
      icon: '⚡',
      gradient: 'from-yellow-500 to-amber-500',
      physicsType: 'circuit',
    },
    params: [
      { name: 'voltage', label: '电压', unit: 'V', defaultValue: 12, min: 0, max: 48, step: 0.5, category: 'input', description: '电源电压' },
      { name: 'resistance', label: '电阻', unit: 'Ω', defaultValue: 10, min: 1, max: 1000, step: 1, category: 'input', description: '电阻阻值' },
    ],
    formulas: [
      { name: '欧姆定律', expression: 'I = U / R', description: '电流等于电压除以电阻', variables: ['voltage', 'resistance'], resultVariable: 'current' },
      { name: '功率公式', expression: 'P = U × I', description: '电功率等于电压乘电流', variables: ['voltage', 'current'], resultVariable: 'power' },
    ],
    canvas: { layout: { ...DEFAULT_CANVAS_LAYOUT }, elements: [], presetTemplate: 'circuit' },
    physics: {
      engine: 'circuit',
      equations: [
        { name: '欧姆定律', expression: 'I = U / R', description: '电流等于电压除以电阻', variables: ['voltage', 'resistance'], resultVariable: 'current' },
        { name: '功率', expression: 'P = U² / R', description: '电功率', variables: ['voltage', 'resistance'], resultVariable: 'power' },
      ],
      computedParams: [
        { name: 'current', formula: 'voltage / resistance', dependsOn: ['voltage', 'resistance'] },
        { name: 'power', formula: 'voltage * voltage / resistance', dependsOn: ['voltage', 'resistance'] },
      ],
    },
    interactions: {
      sliders: [
        { param: 'voltage', label: '电压', min: 0, max: 48, step: 0.5, unit: 'V' },
        { param: 'resistance', label: '电阻', min: 1, max: 1000, step: 1, unit: 'Ω' },
      ],
    },
    teaching: {
      understanding: { objective: '理解欧姆定律和电路基本规律', keyConcepts: ['电压', '电流', '电阻', '欧姆定律'], prerequisites: ['电路的基本组成', '电流的概念'] },
      reasoning: { hypothesis: '电流与电压成正比，与电阻成反比', variables: ['电压', '电阻'], controlMethod: '固定电阻，改变电压' },
      design: { steps: ['设置电源电压', '改变电阻值', '观察电流变化'], dataCollection: '记录电压、电阻、电流', analysisMethod: '验证I=U/R' },
      errors: { common: ['混淆电压和电流', '忽略电阻的单位'], prevention: ['强调因果关系', '统一使用国际单位'] },
      evaluation: { questions: ['为什么短路很危险？'], criteria: ['能正确计算电流', '能解释电压和电阻对电流的影响'] },
    },
    scenes: [
      { name: '标准电路', description: '12V电源，10Ω电阻', params: { voltage: 12, resistance: 10 } },
      { name: '高电阻', description: '12V电源，100Ω电阻', params: { voltage: 12, resistance: 100 } },
    ],
  };
}

// ============ Validation ============

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSchema(schema: ExperimentSchema): ValidationResult {
  const errors: string[] = [];

  if (!schema.meta?.name) errors.push('meta.name is required');
  if (!schema.meta?.physicsType) errors.push('meta.physicsType is required');
  if (!schema.meta?.subject) errors.push('meta.subject is required');

  if (!Array.isArray(schema.params)) {
    errors.push('params must be an array');
  } else {
    const inputParams = schema.params.filter(p => p.category === 'input');
    if (inputParams.length === 0) errors.push('at least one input param is required');

    for (const p of inputParams) {
      if (!p.name) errors.push('input param missing name');
      if (p.min >= p.max) errors.push(`param "${p.name}": min must be less than max`);
    }
  }

  if (!Array.isArray(schema.formulas)) {
    errors.push('formulas must be an array');
  } else if (schema.formulas.length === 0) {
    errors.push('at least one formula is required');
  }

  if (!schema.canvas?.layout) errors.push('canvas.layout is required');
  if (!schema.physics?.engine) errors.push('physics.engine is required');

  return { valid: errors.length === 0, errors };
}

export function validatePhysicsRules(physics: PhysicsConfig): boolean {
  if (!physics.engine) return false;
  if (!Array.isArray(physics.equations)) return false;
  if (physics.equations.length === 0) return false;

  for (const eq of physics.equations) {
    if (!eq.expression) return false;
    if (!eq.resultVariable) return false;
  }

  return true;
}

// ============ Enrichment ============

const PRESET_TEMPLATES: Record<string, () => ExperimentSchema> = {
  buoyancy: createBuoyancyExperiment,
  lever: createLeverExperiment,
  refraction: createRefractionExperiment,
  circuit: createCircuitExperiment,
};

export function enrichSchema(schema: ExperimentSchema): ExperimentSchema {
  const physicsType = schema.meta.physicsType;
  const templateFactory = PRESET_TEMPLATES[physicsType];

  if (!templateFactory) return schema;

  const template = templateFactory();

  return {
    meta: { ...template.meta, ...schema.meta },
    params: schema.params.length > 0 ? schema.params : template.params,
    formulas: schema.formulas.length > 0 ? schema.formulas : template.formulas,
    canvas: {
      layout: schema.canvas.layout ?? template.canvas.layout,
      elements: schema.canvas.elements.length > 0 ? schema.canvas.elements : template.canvas.elements,
      presetTemplate: schema.canvas.presetTemplate ?? template.canvas.presetTemplate ?? physicsType,
    },
    physics: {
      engine: schema.physics.engine ?? template.physics.engine,
      equations: schema.physics.equations.length > 0 ? schema.physics.equations : template.physics.equations,
      constraints: schema.physics.constraints ?? template.physics.constraints,
      computedParams: schema.physics.computedParams ?? template.physics.computedParams,
    },
    interactions: schema.interactions ?? template.interactions,
    teaching: {
      ...template.teaching,
      ...schema.teaching,
    },
    scenes: schema.scenes?.length ? schema.scenes : template.scenes,
  };
}

export function fillDefaultValues(partial: Partial<ExperimentSchema>): ExperimentSchema {
  const meta: ExperimentMeta = { ...DEFAULT_META, ...partial.meta };
  return {
    meta,
    params: partial.params ?? [],
    formulas: partial.formulas ?? [],
    canvas: {
      layout: partial.canvas?.layout ?? { ...DEFAULT_CANVAS_LAYOUT },
      elements: partial.canvas?.elements ?? [],
      presetTemplate: partial.canvas?.presetTemplate,
    },
    physics: {
      engine: partial.physics?.engine ?? meta.physicsType,
      equations: partial.physics?.equations ?? [],
      constraints: partial.physics?.constraints,
      computedParams: partial.physics?.computedParams,
    },
    interactions: partial.interactions,
    teaching: partial.teaching ?? {},
    scenes: partial.scenes ?? [],
  };
}
