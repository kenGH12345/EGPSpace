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
type ChemistryType = 'acid_base' | 'electrolysis' | 'reaction_rate' | 'titration' | 'combustion';
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
  fontWeight?: string;
  text?: string;
  opacity?: number;
  visible?: boolean;
  dynamic?: {
    x?: string;
    y?: string;
    x2?: string;
    y2?: string;
    width?: string;
    height?: string;
    fill?: string;
    stroke?: string;
    opacity?: string;
    visible?: string;
    text?: string;
    magnitude?: string;
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
  /**
   * Ambient (background) animations decoupled from foreground elements.
   * Examples: water waves on a container, bubbles rising, current particles.
   * Driven by the rAF loop via AmbientAnimator. Optional — omit for static scenes.
   */
  ambientAnimations?: AmbientAnimation[];
}

export type AmbientAnimationType = 'wave' | 'bubble' | 'particle' | 'ripple';

export interface AmbientAnimation {
  type: AmbientAnimationType;
  /** Optional id of a canvas element that anchors/clips this animation (e.g. a water container). */
  target?: string;
  /**
   * Type-specific parameters. Common keys by type:
   *   wave:    { amplitude, frequency, speed, color, y }
   *   bubble:  { count, minRadius, maxRadius, speed, color }
   *   particle:{ count, speed, color, size }
   *   ripple:  { maxRadius, speed, color }
   * Values may reference runtime variables via expression strings when the renderer supports it.
   */
  params: Record<string, number | string>;
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
  /**
   * Optional runtime dynamics (spring-damper integration) for smooth transitions
   * between user input and displayed state. When omitted or disabled=false, the
   * renderer evaluates computedParams directly (static path) — fully backward compatible.
   */
  dynamics?: DynamicsConfig;
}

export interface DynamicsConfig {
  enabled: boolean;
  /** Spring stiffness. Higher = faster convergence. Buoyancy default ≈ 0.06. */
  stiffness: number;
  /** Velocity damping per step (0..1). Higher = more overshoot. Buoyancy default ≈ 0.88. */
  damping: number;
  /**
   * Names of runtime variables that participate in the dynamics loop.
   * Each listed variable will be smoothly interpolated toward its target value each frame.
   * Variables NOT listed here are evaluated statically (old behavior).
   */
  variables: string[];
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
  /**
   * One-shot onboarding hint shown on the first render. Dismissed on first interaction.
   * Example: '拖动物体改变浸没深度'. Omit to disable the hint.
   */
  firstTimeHint?: string;
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
  // Canvas geometry constants (keep in sync with renderer preset)
  const CANVAS_W = 560;
  const CANVAS_H = 280;
  const CONTAINER_X = 160;
  const CONTAINER_Y = 40;
  const CONTAINER_W = 240;
  const CONTAINER_H = 200;
  const WATER_SURFACE_Y = CONTAINER_Y + 50;  // top of liquid inside container
  const OBJ_SIZE = 50;
  const OBJ_DEFAULT_X = CONTAINER_X + (CONTAINER_W - OBJ_SIZE) / 2;
  const OBJ_DEFAULT_Y = WATER_SURFACE_Y - OBJ_SIZE / 2;  // half-submerged at rest

  return {
    meta: {
      name: '浮力实验',
      subject: 'physics',
      topic: '浮力',
      description: '探索物体在液体中的浮沉规律，理解阿基米德原理',
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
        max: 3000,
        step: 10,
        category: 'input',
        description: '物体本身的密度，决定浮沉状态',
      },
      {
        name: 'rho_liquid',
        label: '液体密度 (ρ液)',
        unit: 'kg/m³',
        defaultValue: 1000,
        min: 700,
        max: 13600,
        step: 100,
        category: 'input',
        description: '液体密度（水=1000, 盐水≈1200, 汞=13600）',
      },
      {
        name: 'vol',
        label: '物体体积 (V)',
        unit: 'm³',
        defaultValue: 0.01,
        min: 0.001,
        max: 0.05,
        step: 0.001,
        category: 'input',
        description: '物体的体积，影响排开液体的量',
      },
      {
        name: 'g',
        label: '重力加速度 (g)',
        unit: 'm/s²',
        defaultValue: 9.8,
        min: 1,
        max: 20,
        step: 0.1,
        category: 'input',
        description: '重力加速度（地球≈9.8，月球≈1.6）',
      },
    ],
    formulas: [
      {
        name: '浮力公式',
        expression: 'F = ρ液 × g × V排',
        description: '阿基米德原理：浮力等于排开液体的重力',
        variables: ['rho_liquid', 'g', 'vol'],
        resultVariable: 'buoyantForce',
      },
      {
        name: '重力公式',
        expression: 'G = ρ物 × g × V物',
        description: '物体所受重力',
        variables: ['rho_object', 'g', 'vol'],
        resultVariable: 'gravity',
      },
    ],
    canvas: {
      layout: { width: CANVAS_W, height: CANVAS_H, background: '#f0f9ff' },
      elements: [
        // Water container (glass beaker outline)
        {
          id: 'waterContainer',
          type: 'rect',
          label: '容器',
          x: CONTAINER_X,
          y: CONTAINER_Y,
          width: CONTAINER_W,
          height: CONTAINER_H,
          fill: 'rgba(200,235,255,0.3)',
          stroke: '#60a5fa',
          strokeWidth: 2,
        },
        // Liquid fill (height driven by container, color by liquid type)
        {
          id: 'liquidFill',
          type: 'rect',
          label: '液体',
          x: CONTAINER_X + 2,
          y: WATER_SURFACE_Y,
          width: CONTAINER_W - 4,
          height: CONTAINER_H - (WATER_SURFACE_Y - CONTAINER_Y) - 2,
          fill: 'rgba(96,165,250,0.25)',
          stroke: 'none',
          strokeWidth: 0,
        },
        // Object block (position driven by dynamics)
        {
          id: 'objectBlock',
          type: 'rect',
          label: '物体',
          x: OBJ_DEFAULT_X,
          y: OBJ_DEFAULT_Y,
          width: OBJ_SIZE,
          height: OBJ_SIZE,
          fill: '#f97316',
          stroke: '#ea580c',
          strokeWidth: 2,
          dynamic: {
            y: 'objY',
            fill: 'objColor',
          },
        },
        // Gravity force arrow (downward, magnitude proportional to gravity)
        {
          id: 'gravityArrow',
          type: 'forceArrow',
          label: 'G',
          x: OBJ_DEFAULT_X + OBJ_SIZE / 2,
          y: OBJ_DEFAULT_Y + OBJ_SIZE,
          x2: OBJ_DEFAULT_X + OBJ_SIZE / 2,
          y2: OBJ_DEFAULT_Y + OBJ_SIZE + 40,
          stroke: '#ef4444',
          strokeWidth: 2,
          dynamic: {
            y: 'objY + 50',
            y2: 'objY + 50 + gravity * 2',
          },
        },
        // Buoyant force arrow (upward, magnitude proportional to buoyantForce)
        {
          id: 'buoyantArrow',
          type: 'forceArrow',
          label: 'F浮',
          x: OBJ_DEFAULT_X + OBJ_SIZE / 2,
          y: OBJ_DEFAULT_Y,
          x2: OBJ_DEFAULT_X + OBJ_SIZE / 2,
          y2: OBJ_DEFAULT_Y - 40,
          stroke: '#22c55e',
          strokeWidth: 2,
          dynamic: {
            y: 'objY',
            y2: 'objY - buoyantForce * 2',
          },
        },
        // Status label
        {
          id: 'statusLabel',
          type: 'text',
          label: '状态',
          x: CONTAINER_X + CONTAINER_W + 10,
          y: CONTAINER_Y + 20,
          text: '浮沉状态',
          fontSize: 13,
          fill: '#374151',
          dynamic: {
            fill: 'floatState === "上浮" ? "#22c55e" : floatState === "下沉" ? "#ef4444" : "#f59e0b"',
          },
        },
      ],
      presetTemplate: 'buoyancy',
      ambientAnimations: [
        {
          type: 'wave',
          target: 'waterContainer',
          params: {
            amplitude: 2,
            frequency: 0.04,
            y: WATER_SURFACE_Y,
            x: CONTAINER_X + 2,
            width: CONTAINER_W - 4,
            color: 'rgba(96,165,250,0.7)',
          },
        },
        {
          type: 'bubble',
          target: 'liquidFill',
          params: {
            count: 6,
            minRadius: 2,
            maxRadius: 5,
            x: CONTAINER_X + 10,
            y: WATER_SURFACE_Y + 20,
            width: CONTAINER_W - 20,
            height: CONTAINER_H - (WATER_SURFACE_Y - CONTAINER_Y) - 30,
            color: 'rgba(186,230,253,0.7)',
          },
        },
      ],
    },
    physics: {
      engine: 'buoyancy',
      equations: [
        {
          name: '浮力',
          expression: 'F = ρ液 × g × V排',
          description: '阿基米德原理',
          variables: ['rho_liquid', 'g', 'vol'],
          resultVariable: 'buoyantForce',
        },
      ],
      computedParams: [
        { name: 'mass',          formula: 'rho_object * vol',                                  dependsOn: ['rho_object', 'vol'] },
        { name: 'gravity',       formula: 'mass * g',                                          dependsOn: ['mass', 'g'] },
        { name: 'objSize',       formula: 'Math.cbrt(vol) * 100',                              dependsOn: ['vol'] },
        { name: 'immersionRatio',formula: 'Math.min(1, rho_object / rho_liquid)',               dependsOn: ['rho_object', 'rho_liquid'] },
        { name: 'subFraction',   formula: 'immersionRatio',                                    dependsOn: ['immersionRatio'] },
        { name: 'vDisplaced',    formula: 'vol * immersionRatio',                              dependsOn: ['vol', 'immersionRatio'] },
        { name: 'buoyantForce',  formula: 'rho_liquid * g * vDisplaced',                       dependsOn: ['rho_liquid', 'g', 'vDisplaced'] },
        { name: 'netForce',      formula: 'buoyantForce - gravity',                            dependsOn: ['buoyantForce', 'gravity'] },
        { name: 'floatState',    formula: 'netForce > 0.01 ? "上浮" : netForce < -0.01 ? "下沉" : "悬浮"', dependsOn: ['netForce'] },
        { name: 'objColor',      formula: 'rho_object < rho_liquid ? "#f97316" : rho_object > rho_liquid ? "#6366f1" : "#a855f7"', dependsOn: ['rho_object', 'rho_liquid'] },
      ],
      dynamics: {
        enabled: true,
        stiffness: 0.06,
        damping: 0.88,
        variables: ['objY'],
      },
    },
    interactions: {
      sliders: [
        { param: 'rho_object', label: '物体密度', min: 200,  max: 3000,  step: 10,    unit: 'kg/m³' },
        { param: 'rho_liquid', label: '液体密度', min: 700,  max: 13600, step: 100,   unit: 'kg/m³' },
        { param: 'vol',        label: '物体体积', min: 0.001,max: 0.05,  step: 0.001, unit: 'm³' },
        { param: 'g',          label: '重力加速度',min: 1,   max: 20,    step: 0.1,   unit: 'm/s²' },
      ],
      drag: [
        {
          elementId: 'objectBlock',
          constrainTo: 'vertical',
          paramMapping: { dy: 'objY' },
        },
      ],
      firstTimeHint: '拖动物体改变浸没深度',
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
    canvas: {
      layout: { ...DEFAULT_CANVAS_LAYOUT },
      elements: [
        // Lever beam (horizontal bar)
        {
          id: 'leverBeam',
          type: 'rect' as const,
          label: '杠杆',
          x: 80,
          y: 130,
          width: 400,
          height: 8,
          fill: '#78716c',
          stroke: '#57534e',
          strokeWidth: 1,
          dynamic: { y: '130 + leverAngle * 0.5' },
        },
        // Fulcrum (triangle)
        {
          id: 'fulcrum',
          type: 'polygon' as const,
          label: '支点',
          x: 280,
          y: 138,
          points: [
            { x: 280, y: 138 },
            { x: 265, y: 165 },
            { x: 295, y: 165 },
          ],
          fill: '#a8a29e',
          stroke: '#78716c',
          strokeWidth: 1,
        },
        // Left weight
        {
          id: 'leftWeight',
          type: 'rect' as const,
          label: '左砝码',
          x: '80 + (50 - leftArm * 4)',
          y: 100,
          width: 30,
          height: 30,
          fill: '#f97316',
          stroke: '#ea580c',
          strokeWidth: 1,
        },
        // Right weight
        {
          id: 'rightWeight',
          type: 'rect' as const,
          label: '右砝码',
          x: '280 + rightArm * 4 - 15',
          y: 100,
          width: 30,
          height: 30,
          fill: '#6366f1',
          stroke: '#4f46e5',
          strokeWidth: 1,
        },
        // Balance status label
        {
          id: 'balanceLabel',
          type: 'text' as const,
          label: '平衡状态',
          x: 220,
          y: 200,
          text: '平衡状态',
          fontSize: 14,
          fill: '#374151',
          dynamic: {
            fill: 'isBalanced ? "#22c55e" : "#ef4444"',
          },
        },
      ],
      presetTemplate: 'lever' as const,
    },
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
    canvas: {
      layout: { ...DEFAULT_CANVAS_LAYOUT },
      elements: [
        // Interface line (boundary between two media)
        {
          id: 'interface',
          type: 'line' as const,
          label: '分界面',
          x: 80,
          y: 140,
          x2: 480,
          y2: 140,
          stroke: '#94a3b8',
          strokeWidth: 1.5,
        },
        // Normal line (dashed, vertical)
        {
          id: 'normalLine',
          type: 'line' as const,
          label: '法线',
          x: 280,
          y: 60,
          x2: 280,
          y2: 220,
          stroke: '#cbd5e1',
          strokeWidth: 1,
        },
        // Incident ray
        {
          id: 'incidentRay',
          type: 'lightRay' as const,
          label: '入射光',
          x: 280,
          y: 140,
          angle: '-90 - incidentAngle',
          length: 100,
          stroke: '#fbbf24',
          strokeWidth: 2.5,
        },
        // Refracted ray
        {
          id: 'refractedRay',
          type: 'lightRay' as const,
          label: '折射光',
          x: 280,
          y: 140,
          angle: '90 + refractionAngle',
          length: 100,
          stroke: '#34d399',
          strokeWidth: 2.5,
        },
        // Angle labels
        {
          id: 'incidentLabel',
          type: 'text' as const,
          label: '入射角',
          x: 190,
          y: 125,
          text: 'θ₁',
          fontSize: 13,
          fill: '#fbbf24',
        },
        {
          id: 'refractedLabel',
          type: 'text' as const,
          label: '折射角',
          x: 190,
          y: 165,
          text: 'θ₂',
          fontSize: 13,
          fill: '#34d399',
        },
      ],
      presetTemplate: 'refraction' as const,
      ambientAnimations: [
        {
          type: 'particle' as const,
          params: {
            count: 5,
            vx: 1.2,
            vy: 0.8,
            size: 2,
            startX: 180,
            startY: 100,
            spread: 10,
            color: 'rgba(251,191,36,0.9)',
          },
        },
      ],
    },
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
    canvas: {
      layout: { ...DEFAULT_CANVAS_LAYOUT },
      elements: [
        // Battery (left side)
        {
          id: 'battery',
          type: 'rect' as const,
          label: '电池',
          x: 80,
          y: 110,
          width: 40,
          height: 60,
          fill: '#fef3c7',
          stroke: '#f59e0b',
          strokeWidth: 2,
        },
        {
          id: 'batteryLabel',
          type: 'text' as const,
          label: '电压',
          x: 85,
          y: 148,
          text: 'U',
          fontSize: 14,
          fill: '#92400e',
        },
        // Resistor (right side)
        {
          id: 'resistor',
          type: 'rect' as const,
          label: '电阻',
          x: 380,
          y: 120,
          width: 60,
          height: 40,
          fill: '#ede9fe',
          stroke: '#7c3aed',
          strokeWidth: 2,
        },
        {
          id: 'resistorLabel',
          type: 'text' as const,
          label: '电阻值',
          x: 390,
          y: 145,
          text: 'R',
          fontSize: 14,
          fill: '#4c1d95',
        },
        // Wires (top and bottom)
        {
          id: 'wireTop',
          type: 'line' as const,
          label: '上导线',
          x: 120,
          y: 110,
          x2: 380,
          y2: 110,
          stroke: '#374151',
          strokeWidth: 2,
        },
        {
          id: 'wireBottom',
          type: 'line' as const,
          label: '下导线',
          x: 120,
          y: 170,
          x2: 380,
          y2: 170,
          stroke: '#374151',
          strokeWidth: 2,
        },
        // Current direction arrow
        {
          id: 'currentArrow',
          type: 'arrow' as const,
          label: 'I',
          x: 220,
          y: 110,
          x2: 270,
          y2: 110,
          stroke: '#22c55e',
          strokeWidth: 2,
        },
        // Current value label
        {
          id: 'currentLabel',
          type: 'text' as const,
          label: '电流',
          x: 200,
          y: 100,
          text: 'I = {current} A',
          fontSize: 12,
          fill: '#166534',
        },
      ],
      presetTemplate: 'circuit' as const,
      ambientAnimations: [
        {
          type: 'particle' as const,
          params: {
            count: 8,
            vx: 1.5,
            vy: 0,
            size: 3,
            startX: 120,
            startY: 110,
            spread: 4,
            color: 'rgba(34,197,94,0.9)',
          },
        },
      ],
    },
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

// ============ Chemistry Experiments (Phase 2 — Unified Schema) ============

export function createAcidBaseTitrationExperiment(): ExperimentSchema {
  const CANVAS_W = 560;
  const CANVAS_H = 280;
  const FLASK_X = CANVAS_W / 2 + 80;
  const FLASK_Y = 140;
  const FLASK_W = 70;
  const FLASK_H = 85;

  return {
    meta: {
      name: '酸碱滴定实验',
      subject: 'chemistry',
      topic: '酸碱中和反应',
      description: '通过酸碱滴定观察pH变化，理解中和反应原理',
      icon: '🧪',
      gradient: 'from-pink-500 to-rose-500',
      physicsType: 'acid_base',
    },
    params: [
      {
        name: 'C_acid',
        label: '酸浓度 (HCl)',
        unit: 'mol/L',
        defaultValue: 0.1,
        min: 0.01,
        max: 1.0,
        step: 0.01,
        category: 'input',
        description: '酸溶液的初始浓度',
      },
      {
        name: 'C_base',
        label: '碱浓度 (NaOH)',
        unit: 'mol/L',
        defaultValue: 0.1,
        min: 0.01,
        max: 1.0,
        step: 0.01,
        category: 'input',
        description: '滴定用碱溶液的浓度',
      },
      {
        name: 'V_acid',
        label: '酸溶液体积',
        unit: 'mL',
        defaultValue: 25,
        min: 1,
        max: 100,
        step: 1,
        category: 'input',
        description: '锥形瓶中酸溶液的体积',
      },
      {
        name: 'V_added',
        label: '已加入NaOH体积',
        unit: 'mL',
        defaultValue: 0,
        min: 0,
        max: 50,
        step: 0.1,
        category: 'input',
        description: '滴定管中已加入的碱溶液体积',
      },
    ],
    formulas: [
      {
        name: '物质的量公式',
        expression: 'n = C × V',
        description: '物质的量等于浓度乘体积',
        variables: ['C_acid', 'V_acid'],
        resultVariable: 'n_acid',
      },
      {
        name: 'pH计算（强酸强碱）',
        expression: 'pH = -log[H+]',
        description: '强酸强碱滴定的pH计算',
        variables: ['C_acid', 'V_acid', 'C_base', 'V_added'],
        resultVariable: 'pH_value',
      },
    ],
    canvas: {
      layout: { width: CANVAS_W, height: CANVAS_H, background: '#fff1f2' },
      elements: [
        // Burette (滴定管)
        {
          id: 'burette',
          type: 'rect',
          label: '滴定管',
          x: CANVAS_W / 2 - 30,
          y: 30,
          width: 18,
          height: 120,
          fill: 'rgba(200,220,255,0.5)',
          stroke: '#3b82f6',
          strokeWidth: 2,
        },
        // Stopcock
        {
          id: 'stopcock',
          type: 'rect',
          label: '活塞',
          x: CANVAS_W / 2 - 38,
          y: 148,
          width: 34,
          height: 10,
          fill: '#6b7280',
          stroke: '#4b5563',
          strokeWidth: 1,
        },
        // Burette tip
        {
          id: 'burette-tip',
          type: 'polygon',
          label: '滴定管尖嘴',
          x: 0,
          y: 0,
          points: [
            { x: CANVAS_W / 2 - 30, y: 158 },
            { x: CANVAS_W / 2 - 12, y: 158 },
            { x: CANVAS_W / 2 - 21, y: 170 },
          ],
          fill: 'rgba(200,220,255,0.5)',
          stroke: '#3b82f6',
          strokeWidth: 1,
        },
        // Liquid column in burette (level driven by V_added)
        {
          id: 'burette-liquid',
          type: 'rect',
          label: '碱液',
          x: CANVAS_W / 2 - 28,
          y: '30 + 120 * (1 - V_added / 50)',
          width: 14,
          height: '120 * V_added / 50',
          fill: 'rgba(59,130,246,0.5)',
          stroke: 'none',
        },
        // Flask (conical flask)
        {
          id: 'flask',
          type: 'polygon',
          label: '锥形瓶',
          x: 0,
          y: 0,
          points: [
            { x: FLASK_X - FLASK_W / 2, y: FLASK_Y + FLASK_H / 2 },
            { x: FLASK_X + FLASK_W / 2, y: FLASK_Y + FLASK_H / 2 },
            { x: FLASK_X + 12, y: FLASK_Y - FLASK_H / 2 },
            { x: FLASK_X - 12, y: FLASK_Y - FLASK_H / 2 },
          ],
          fill: 'rgba(255,255,255,0.6)',
          stroke: '#94a3b8',
          strokeWidth: 2,
        },
        // Liquid in flask (color changes with pH)
        {
          id: 'flask-liquid',
          type: 'polygon',
          label: '溶液',
          x: 0,
          y: 0,
          points: [
            { x: FLASK_X - FLASK_W / 2 + 6, y: FLASK_Y + FLASK_H / 2 - 5 },
            { x: FLASK_X + FLASK_W / 2 - 6, y: FLASK_Y + FLASK_H / 2 - 5 },
            { x: FLASK_X + 9, y: FLASK_Y + 20 },
            { x: FLASK_X - 9, y: FLASK_Y + 20 },
          ],
          fill: 'liquidColor',
          stroke: 'none',
          dynamic: {
            fill: 'pH_value < 7 ? "rgba(255,107,107,0.6)" : pH_value > 7 ? "rgba(107,171,255,0.6)" : "rgba(156,163,175,0.5)"',
          },
        },
        // pH value label
        {
          id: 'ph-label',
          type: 'text',
          label: 'pH值',
          x: FLASK_X + 50,
          y: FLASK_Y + 20,
          text: 'pH: {pH}',
          fontSize: 14,
          fill: '#e11d48',
          dynamic: {
            text: '"pH: " + pH_value.toFixed(2)',
          },
        },
        // Status label
        {
          id: 'status-label',
          type: 'text',
          label: '状态',
          x: FLASK_X + 50,
          y: FLASK_Y + 50,
          text: '状态',
          fontSize: 12,
          fill: '#374151',
          dynamic: {
            text: 'pH_value < 6.9 ? "酸性 (未中和)" : pH_value > 7.1 ? "碱性 (过量)" : "中性 (已中和)"',
          },
        },
      ],
      presetTemplate: 'acid_base',
    },
    physics: {
      engine: 'generic',
      equations: [
        {
          name: '物质的量计算',
          expression: 'n = C × V',
          description: '酸/碱的物质的量',
          variables: ['C_acid', 'V_acid'],
          resultVariable: 'n_acid',
        },
      ],
      computedParams: [
        { name: 'n_acid', formula: 'C_acid * V_acid', dependsOn: ['C_acid', 'V_acid'] },
        { name: 'n_base', formula: 'C_base * V_added', dependsOn: ['C_base', 'V_added'] },
        { name: 'totalVolume', formula: 'V_acid + V_added', dependsOn: ['V_acid', 'V_added'] },
        { name: 'excess', formula: 'n_acid - n_base', dependsOn: ['n_acid', 'n_base'] },
        { name: 'pH_value', formula: 'excess > 0.001 ? -Math.log10(Math.abs(excess) / totalVolume) : Math.abs(excess) > 0.001 ? 14 + Math.log10(Math.abs(excess) / totalVolume) : 7.0', dependsOn: ['excess', 'totalVolume'] },
      ],
    },
    interactions: {
      sliders: [
        { param: 'C_acid', label: '酸浓度', min: 0.01, max: 1.0, step: 0.01, unit: 'mol/L' },
        { param: 'C_base', label: '碱浓度', min: 0.01, max: 1.0, step: 0.01, unit: 'mol/L' },
        { param: 'V_acid', label: '酸体积', min: 1, max: 100, step: 1, unit: 'mL' },
        { param: 'V_added', label: '已加碱体积', min: 0, max: 50, step: 0.1, unit: 'mL' },
      ],
      firstTimeHint: '调节“已加碱体积”滑块，观察pH变化和溶液颜色',
    },
    teaching: {
      understanding: {
        objective: '理解酸碱中和反应的本质和pH变化规律',
        keyConcepts: ['酸碱中和反应', '化学计量点', 'pH曲线', '强酸强碱滴定'],
        prerequisites: ['酸碱概念', '物质的量'],
      },
      reasoning: {
        hypothesis: '当酸和碱的物质的量相等时，溶液呈中性',
        variables: ['酸浓度', '碱浓度', '酸体积', '碱加入体积'],
        controlMethod: '逐滴加入碱液，记录pH变化',
      },
      design: {
        steps: ['配置标准酸碱溶液', '向酸中逐滴加入碱', '记录每次加入的体积和pH值', '绘制pH滴定曲线'],
        dataCollection: '记录每滴碱液的体积和对应pH值',
        analysisMethod: '找出pH突变点对应的碱液体积',
      },
      errors: {
        common: ['读数时视线未平视', '滴定前未赶气泡', '终点判断失误'],
        prevention: ['实验前检查滴定管', '边滴边摇', '使用指示剂辅助判断'],
      },
      evaluation: {
        questions: ['为什么pH=7时恰好中和？', '强酸弱碱滴定的终点在平几滴？'],
        criteria: ['能正确计算pH值', '能画出典型滴定曲线'],
      },
    },
    scenes: [
      { name: '滴定起点', description: '起始酸性溶液', params: { C_acid: 0.1, C_base: 0.1, V_acid: 25, V_added: 0 } },
      { name: '接近终点', description: '即将中和', params: { C_acid: 0.1, C_base: 0.1, V_acid: 25, V_added: 24.9 } },
      { name: '恰好中和', description: '化学计量点', params: { C_acid: 0.1, C_base: 0.1, V_acid: 25, V_added: 25 } },
      { name: '碱过量', description: '超过化学计量点', params: { C_acid: 0.1, C_base: 0.1, V_acid: 25, V_added: 30 } },
    ],
  };
}

export function createElectrolysisExperiment(): ExperimentSchema {
  const CANVAS_W = 560;
  const CANVAS_H = 280;

  return {
    meta: {
      name: '电解水实验',
      subject: 'chemistry',
      topic: '电解',
      description: '通过电解水验证水的组成，观察氢气和氧气的生成过程',
      icon: '⚡',
      gradient: 'from-sky-500 to-teal-500',
      physicsType: 'electrolysis',
    },
    params: [
      {
        name: 'voltage',
        label: '电压',
        unit: 'V',
        defaultValue: 12,
        min: 2,
        max: 24,
        step: 0.5,
        category: 'input',
        description: '电解电压',
      },
      {
        name: 'conductivity',
        label: '电解质浓度 (NaOH)',
        unit: '%',
        defaultValue: 5,
        min: 0,
        max: 20,
        step: 1,
        category: 'input',
        description: '加入的电解质浓度（提高导电性）',
      },
      {
        name: 'time',
        label: '电解时间',
        unit: 'min',
        defaultValue: 5,
        min: 0,
        max: 60,
        step: 1,
        category: 'input',
        description: '电解时间',
      },
    ],
    formulas: [
      {
        name: '法拉第第一定律',
        expression: 'm = MIt / (nF)',
        description: '电解产物的质量与通过的电量成正比',
        variables: ['voltage', 'conductivity', 'time'],
        resultVariable: 'gas_volume',
      },
    ],
    canvas: {
      layout: { width: CANVAS_W, height: CANVAS_H, background: '#f0f9ff' },
      elements: [
        // Electrolysis tank
        {
          id: 'tank',
          type: 'rect',
          label: '电解槽',
          x: CANVAS_W / 2 - 60,
          y: 80,
          width: 120,
          height: 140,
          fill: 'rgba(200,235,255,0.3)',
          stroke: '#60a5fa',
          strokeWidth: 2,
        },
        // Anode electrode (left, +)
        {
          id: 'anode',
          type: 'rect',
          label: '阳极',
          x: CANVAS_W / 2 - 40,
          y: 90,
          width: 4,
          height: 120,
          fill: '#ef4444',
          stroke: '#b91c1c',
          strokeWidth: 1,
        },
        // Cathode electrode (right, -)
        {
          id: 'cathode',
          type: 'rect',
          label: '阴极',
          x: CANVAS_W / 2 + 36,
          y: 90,
          width: 4,
          height: 120,
          fill: '#3b82f6',
          stroke: '#1d4ed8',
          strokeWidth: 1,
        },
        // Battery / power source
        {
          id: 'battery',
          type: 'rect',
          label: '电源',
          x: CANVAS_W / 2 - 20,
          y: 20,
          width: 40,
          height: 30,
          fill: '#fbbf24',
          stroke: '#d97706',
          strokeWidth: 1,
        },
        {
          id: 'battery-label',
          type: 'text',
          label: 'U',
          x: CANVAS_W / 2 - 5,
          y: 40,
          text: '⚡',
          fontSize: 14,
        },
        // H2 gas label
        {
          id: 'h2-label',
          type: 'text',
          label: '氢气体积',
          x: CANVAS_W / 2 - 120,
          y: 150,
          text: 'H₂: {H2_volume} mL',
          fontSize: 13,
          fill: '#1d4ed8',
          dynamic: {
            text: '"H₂: " + H2_volume.toFixed(1) + " mL"',
          },
        },
        // O2 gas label
        {
          id: 'o2-label',
          type: 'text',
          label: '氧气体积',
          x: CANVAS_W / 2 + 50,
          y: 150,
          text: 'O₂: {O2_volume} mL',
          fontSize: 13,
          fill: '#b91c1c',
          dynamic: {
            text: '"O₂: " + O2_volume.toFixed(1) + " mL"',
          },
        },
        // Gas ratio label
        {
          id: 'ratio-label',
          type: 'text',
          label: '体积比',
          x: CANVAS_W / 2 - 40,
          y: 240,
          text: 'V(H₂):V(O₂) ≈ 2:1',
          fontSize: 12,
          fill: '#374151',
        },
      ],
      presetTemplate: 'electrolysis',
      ambientAnimations: [
        {
          type: 'bubble',
          target: 'tank',
          params: {
            count: 8,
            minRadius: 2,
            maxRadius: 5,
            x: CANVAS_W / 2 - 60 + 10,
            y: 80 + 20,
            width: 120 - 20,
            height: 140 - 30,
            color: 'rgba(186,230,253,0.7)',
          },
        },
      ],
    },
    physics: {
      engine: 'generic',
      equations: [
        {
          name: '气体体积计算',
          expression: 'V(H₂) = 2 × (mL/min × t × 导电率系数)',
          description: '氢气体积与时间成正比',
          variables: ['voltage', 'conductivity', 'time'],
          resultVariable: 'gas_volume',
        },
      ],
      computedParams: [
        { name: 'gas_rate', formula: '0.5 * (voltage / 12) * (1 + conductivity / 100)', dependsOn: ['voltage', 'conductivity'] },
        { name: 'H2_volume', formula: 'gas_rate * time * 2', dependsOn: ['gas_rate', 'time'] },
        { name: 'O2_volume', formula: 'gas_rate * time', dependsOn: ['gas_rate', 'time'] },
      ],
    },
    interactions: {
      sliders: [
        { param: 'voltage', label: '电压', min: 2, max: 24, step: 0.5, unit: 'V' },
        { param: 'conductivity', label: '电解质浓度', min: 0, max: 20, step: 1, unit: '%' },
        { param: 'time', label: '电解时间', min: 0, max: 60, step: 1, unit: 'min' },
      ],
      firstTimeHint: '调节电压和电解时间，观察氢气和氧气体积变化',
    },
    teaching: {
      understanding: {
        objective: '理解电解水的原理和产物比例',
        keyConcepts: ['电解', '阴极还原', '阳极氧化', '水的组成'],
        prerequisites: ['氧化还原反应', '离子导电'],
      },
      reasoning: {
        hypothesis: '阴极产生氢气，阳极产生氧气，体积比为2:1',
        variables: ['电压', '电解质浓度', '电解时间'],
        controlMethod: '保持电压不变，改变电解时间',
      },
      design: {
        steps: ['设置电压和电解质浓度', '通电开始电解', '记录气体体积', '比较阴阳极气体体积比'],
        dataCollection: '记录阴阳极收集的气体体积',
        analysisMethod: '计算体积比并与理论值2:1比较',
      },
      errors: {
        common: ['忽略电解质的作用', '未完全收集气体', '电压过高导致副反应'],
        prevention: ['加入适量电解质', '确保装置气密性', '控制适当电压'],
      },
      evaluation: {
        questions: ['为什么阴极产生氢气，阳极产生氧气？', '加入NaOH的作用是什么？'],
        criteria: ['能正确判断阴阳极产物', '能验证体积比为2:1'],
      },
    },
    scenes: [
      { name: '初始状态', description: '刚通电时', params: { voltage: 12, conductivity: 5, time: 0 } },
      { name: '短时间电解', description: '电解5分钟', params: { voltage: 12, conductivity: 5, time: 5 } },
      { name: '长时电解', description: '电解30分钟', params: { voltage: 12, conductivity: 5, time: 30 } },
    ],
  };
}

export function createReactionRateExperiment(): ExperimentSchema {
  const CANVAS_W = 560;
  const CANVAS_H = 280;

  return {
    meta: {
      name: '化学反应速率实验',
      subject: 'chemistry',
      topic: '反应速率',
      description: '探究温度、浓度、催化剂对化学反应速率的影响',
      icon: '🔥',
      gradient: 'from-orange-500 to-red-500',
      physicsType: 'reaction_rate',
    },
    params: [
      {
        name: 'temperature',
        label: '温度',
        unit: '°C',
        defaultValue: 25,
        min: 0,
        max: 100,
        step: 1,
        category: 'input',
        description: '反应体系温度',
      },
      {
        name: 'concentration',
        label: '反应物浓度',
        unit: 'mol/L',
        defaultValue: 0.1,
        min: 0.01,
        max: 2.0,
        step: 0.01,
        category: 'input',
        description: '反应物的初始浓度',
      },
      {
        name: 'catalyst',
        label: '催化剂系数',
        unit: '',
        defaultValue: 1,
        min: 1,
        max: 10,
        step: 0.5,
        category: 'input',
        description: '催化剂活性系数（1=无催化剂，2-10=有催化剂）',
      },
    ],
    formulas: [
      {
        name: '阿伦尼乌斯方程',
        expression: 'k = A exp(-Ea/RT)',
        description: '速率常数与温度的关系',
        variables: ['temperature', 'catalyst'],
        resultVariable: 'rate_constant',
      },
      {
        name: '反应速率公式',
        expression: 'v = k[C]^n',
        description: '反应速率与浓度的关系',
        variables: ['temperature', 'concentration', 'catalyst'],
        resultVariable: 'reaction_rate',
      },
    ],
    canvas: {
      layout: { width: CANVAS_W, height: CANVAS_H, background: '#fff7ed' },
      elements: [
        // Reaction vessel
        {
          id: 'vessel',
          type: 'rect',
          label: '反应容器',
          x: CANVAS_W / 2 - 80,
          y: 60,
          width: 160,
          height: 150,
          fill: 'rgba(255,255,255,0.8)',
          stroke: '#94a3b8',
          strokeWidth: 2,
        },
        // Particles count label
        {
          id: 'rate-label',
          type: 'text',
          label: '反应速率',
          x: CANVAS_W / 2 + 100,
          y: 80,
          text: 'v = {rate}',
          fontSize: 14,
          fill: '#ea580c',
          dynamic: {
            text: '"v = " + reaction_rate.toFixed(3) + " mol/(L·s)"',
          },
        },
        // Temperature display
        {
          id: 'temp-display',
          type: 'text',
          label: '温度显示',
          x: CANVAS_W / 2 + 100,
          y: 110,
          text: 'T = {temp} °C',
          fontSize: 12,
          fill: '#374151',
          dynamic: {
            text: '"T = " + temperature + " °C"',
          },
        },
        // Concentration display
        {
          id: 'conc-display',
          type: 'text',
          label: '浓度显示',
          x: CANVAS_W / 2 + 100,
          y: 135,
          text: 'C = {conc} mol/L',
          fontSize: 12,
          fill: '#374151',
          dynamic: {
            text: '"C = " + concentration.toFixed(2) + " mol/L"',
          },
        },
        // Rate constant display
        {
          id: 'k-display',
          type: 'text',
          label: '速率常数',
          x: CANVAS_W / 2 + 100,
          y: 160,
          text: 'k = {k_val}',
          fontSize: 12,
          fill: '#374151',
          dynamic: {
            text: '"k = " + rate_constant.toFixed(4)',
          },
        },
      ],
      presetTemplate: 'reaction_rate',
      ambientAnimations: [
        {
          type: 'particle',
          params: {
            count: 15,
            speed: 'temperature / 25',
            color: 'rgba(251,146,60,0.8)',
            size: 3,
          },
        },
      ],
    },
    physics: {
      engine: 'generic',
      equations: [
        {
          name: '反应速率',
          expression: 'v = k · [C]ⁿ',
          description: '反应速率公式',
          variables: ['temperature', 'concentration', 'catalyst'],
          resultVariable: 'reaction_rate',
        },
      ],
      computedParams: [
        { name: 'rate_constant', formula: '0.05 * catalyst * Math.exp(-5000 / (8.314 * (temperature + 273.15)))', dependsOn: ['temperature', 'catalyst'] },
        { name: 'reaction_rate', formula: 'rate_constant * concentration', dependsOn: ['rate_constant', 'concentration'] },
      ],
    },
    interactions: {
      sliders: [
        { param: 'temperature', label: '温度', min: 0, max: 100, step: 1, unit: '°C' },
        { param: 'concentration', label: '反应物浓度', min: 0.01, max: 2.0, step: 0.01, unit: 'mol/L' },
        { param: 'catalyst', label: '催化剂系数', min: 1, max: 10, step: 0.5, unit: '' },
      ],
      firstTimeHint: '调节温度和浓度，观察反应速率的变化',
    },
    teaching: {
      understanding: {
        objective: '理解反应速率的影响因素',
        keyConcepts: ['速率常数', '阿伦尼乌斯方程', '活化能', '催化剂'],
        prerequisites: ['化学反应基本概念', '温度与分子运动'],
      },
      reasoning: {
        hypothesis: '温度升高10°C，速率大约翻倍；增加浓度或加入催化剂也能加快速率',
        variables: ['温度', '浓度', '催化剂'],
        controlMethod: '控制变量法：每次只改变一个因素',
      },
      design: {
        steps: ['设置反应条件', '改变一个因素', '测量反应速率', '记录数据'],
        dataCollection: '记录不同条件下的反应速率',
        analysisMethod: '比较各条件下速率大小，得出影响规律',
      },
      errors: {
        common: ['同时改变多个变量', '忽略反应级数的影响', '催化剂浓度未量化'],
        prevention: ['严格使用控制变量法', '确认反应级数', '记录催化剂用量'],
      },
      evaluation: {
        questions: ['为什么温度对反应速率影响这么大？', '催化剂为什么不改变平衡位置？'],
        criteria: ['能判断影响速率的三个因素', '能解释温度-速率曲线'],
      },
    },
    scenes: [
      { name: '常温低浓度', description: '标准条件', params: { temperature: 25, concentration: 0.1, catalyst: 1 } },
      { name: '高温条件', description: '温度升高', params: { temperature: 60, concentration: 0.1, catalyst: 1 } },
      { name: '高浓度+催化剂', description: '浓度和催化剂都增加', params: { temperature: 25, concentration: 1.0, catalyst: 5 } },
    ],
  };
}

export function createCombustionExperiment(): ExperimentSchema {
  const CANVAS_W = 560;
  const CANVAS_H = 280;

  return {
    meta: {
      name: '燃烧条件探究实验',
      subject: 'chemistry',
      topic: '燃烧',
      description: '通过控制变量法探究燃烧的三个条件',
      icon: '🔥',
      gradient: 'from-red-600 to-orange-500',
      physicsType: 'generic',
    },
    params: [
      {
        name: 'temperature',
        label: '环境温度',
        unit: '°C',
        defaultValue: 25,
        min: 0,
        max: 500,
        step: 5,
        category: 'input',
        description: '环境初始温度',
      },
      {
        name: 'o2_percent',
        label: '氧气浓度',
        unit: '%',
        defaultValue: 21,
        min: 0,
        max: 100,
        step: 1,
        category: 'input',
        description: '环境中氧气百分比',
      },
      {
        name: 'fuel_type',
        label: '燃料类型',
        unit: '',
        defaultValue: 1,
        min: 0,
        max: 3,
        step: 1,
        category: 'input',
        description: '0=无可燃物,1=木材(燃点300°C),2=纸张(燃点230°C),3=乙醇(燃点363°C)',
      },
    ],
    formulas: [
      {
        name: '燃烧条件验证',
        expression: '燃烧 = (T ≥ 燃点) ∧ (氧气 > 0) ∧ (存在可燃物)',
        description: '三个条件同时满足才能燃烧',
        variables: ['temperature', 'o2_percent', 'fuel_type'],
        resultVariable: 'is_burning',
      },
    ],
    canvas: {
      layout: { width: CANVAS_W, height: CANVAS_H, background: '#fef2f2' },
      elements: [
        // Zone 1 label: Fuel
        {
          id: 'zone1-label',
          type: 'text',
          label: '可燃物区域',
          x: 30,
          y: 30,
          text: '条件1: 可燃物',
          fontSize: 13,
          fill: '#374151',
        },
        // Fuel pile
        {
          id: 'fuel-pile',
          type: 'polygon',
          label: '燃料堆',
          x: 0,
          y: 0,
          points: [
            { x: 40, y: 80 },
            { x: 80, y: 70 },
            { x: 90, y: 90 },
            { x: 50, y: 100 },
          ],
          fill: 'fuelColor',
          stroke: '#78350f',
          strokeWidth: 1,
          dynamic: {
            fill: 'fuel_type === 1 ? "#92400e" : fuel_type === 2 ? "#d97706" : fuel_type === 3 ? "#60a5fa" : "#d1d5db"',
          },
        },
        // Zone 2 label: Oxygen
        {
          id: 'zone2-label',
          type: 'text',
          label: '助燃物区域',
          x: 230,
          y: 30,
          text: '条件2: 助燃物',
          fontSize: 13,
          fill: '#374151',
        },
        // Air in zone 2
        {
          id: 'air-zone',
          type: 'rect',
          label: '气体区域',
          x: 220,
          y: 60,
          width: 100,
          height: 80,
          fill: 'airColor',
          stroke: 'none',
          opacity: 0.3,
          dynamic: {
            fill: 'o2_percent > 10 ? "rgba(59,130,246,0.3)" : "rgba(156,163,175,0.2)"',
          },
        },
        {
          id: 'o2-label',
          type: 'text',
          label: '氧气浓度',
          x: 230,
          y: 80,
          text: 'O₂: {o2}%',
          fontSize: 12,
          fill: '#1e40af',
          dynamic: {
            text: '"O₂: " + o2_percent + "%"',
          },
        },
        // Zone 3 label: Temperature
        {
          id: 'zone3-label',
          type: 'text',
          label: '温度区域',
          x: 430,
          y: 30,
          text: '条件3: 温度≥燃点',
          fontSize: 13,
          fill: '#374151',
        },
        // Thermometer
        {
          id: 'thermometer',
          type: 'rect',
          label: '温度计',
          x: 455,
          y: 60,
          width: 12,
          height: 100,
          fill: 'rgba(255,255,255,0.8)',
          stroke: '#6b7280',
          strokeWidth: 1,
        },
        {
          id: 'mercury',
          type: 'rect',
          label: '水银柱',
          x: 457,
          y: 'mercuryY',
          width: 8,
          height: 'mercuryH',
          fill: '#ef4444',
          stroke: 'none',
          dynamic: {
            y: '160 - temperature * 0.2',
          },
        },
        {
          id: 'temp-label',
          type: 'text',
          label: '温度值',
          x: 475,
          y: 100,
          text: '{temp}°C',
          fontSize: 12,
          fill: '#dc2626',
          dynamic: {
            text: 'temperature + "°C"',
          },
        },
        // Burning result
        {
          id: 'result-label',
          type: 'text',
          label: '结果',
          x: 230,
          y: 200,
          text: '结果',
          fontSize: 16,
          fill: '#374151',
          dynamic: {
            text: 'is_burning ? "🔥 燃烧中！" : "❌ 未燃烧"',
            fill: 'is_burning ? "#dc2626" : "#6b7280"',
          },
        },
      ],
      presetTemplate: 'combustion',
    },
    physics: {
      engine: 'generic',
      equations: [
        {
          name: '燃烧条件',
          expression: '燃烧 = T≥燃点 ∧ O₂>0 ∧ 可燃物',
          description: '三个条件缺一不可',
          variables: ['temperature', 'o2_percent', 'fuel_type'],
          resultVariable: 'is_burning',
        },
      ],
      computedParams: [
        { name: 'ignition_point', formula: 'fuel_type === 1 ? 300 : fuel_type === 2 ? 230 : fuel_type === 3 ? 363 : 9999', dependsOn: ['fuel_type'] },
        { name: 'is_burning', formula: 'temperature >= ignition_point && o2_percent > 10 && fuel_type > 0 ? 1 : 0', dependsOn: ['temperature', 'o2_percent', 'fuel_type', 'ignition_point'] },
        { name: 'hasFuel', formula: 'fuel_type > 0 ? 1 : 0', dependsOn: ['fuel_type'] },
        { name: 'enoughO2', formula: 'o2_percent > 10 ? 1 : 0', dependsOn: ['o2_percent'] },
        { name: 'hotEnough', formula: 'temperature >= ignition_point ? 1 : 0', dependsOn: ['temperature', 'ignition_point'] },
      ],
    },
    interactions: {
      sliders: [
        { param: 'temperature', label: '环境温度', min: 0, max: 500, step: 5, unit: '°C' },
        { param: 'o2_percent', label: '氧气浓度', min: 0, max: 100, step: 1, unit: '%' },
        { param: 'fuel_type', label: '燃料类型', min: 0, max: 3, step: 1, unit: '' },
      ],
      firstTimeHint: '三个条件同时满足才能燃烧！尝试找到每种燃料的燃点',
    },
    teaching: {
      understanding: {
        objective: '理解燃烧的三个必要条件',
        keyConcepts: ['燃烧三要素', '燃点', '助燃物', '可燃物'],
        prerequisites: ['氧化反应', '物质的熔沸点'],
      },
      reasoning: {
        hypothesis: '燃烧必须同时满足三个条件：可燃物、助燃物、温度达到燃点',
        variables: ['燃料类型', '氧气浓度', '环境温度'],
        controlMethod: '控制变量法，每次只改变一个条件',
      },
      design: {
        steps: ['选择燃料类型', '设置氧气浓度', '调节温度', '观察是否燃烧'],
        dataCollection: '记录不同条件下的燃烧状态',
        analysisMethod: '判断哪些条件同时满足',
      },
      errors: {
        common: ['忽略助燃物的作用', '混淆燃点和着火点', '未控制变量'],
        prevention: ['严格使用控制变量法', '理解三者缺一不可'],
      },
      evaluation: {
        questions: ['为什么灭火毯能灭火？', '为什么人要降温到燃点以下才能自救？'],
        criteria: ['能正确判断燃烧条件', '能分别描述灭火原理'],
      },
    },
    scenes: [
      { name: '缺可燃物', description: '没有燃料', params: { temperature: 500, o2_percent: 21, fuel_type: 0 } },
      { name: '缺氧气', description: '氧气不足', params: { temperature: 500, o2_percent: 5, fuel_type: 1 } },
      { name: '温度不够', description: '低于燃点', params: { temperature: 200, o2_percent: 21, fuel_type: 1 } },
      { name: '恰好燃烧', description: '三个条件都满足', params: { temperature: 350, o2_percent: 21, fuel_type: 1 } },
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
