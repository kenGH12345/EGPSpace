/**
 * 实验配置类型定义
 * 参考 Eureka 的完整类型系统
 */

// ========== 基础类型 ==========

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

// ========== 参数类型 ==========

export interface ExperimentParameter {
  key: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  default: number;
  step: number;
  description: string;
  gestureControl?: GestureControl;
}

export interface GestureControl {
  finger: 'index' | 'middle' | 'thumb' | 'pinch';
  direction: 'horizontal' | 'vertical' | 'radial';
  sensitivity: number;
}

// ========== 状态项类型 ==========

export interface StatusItem {
  label: string;
  value: number | string;
  unit: string;
  color: string;
}

export interface CalculationItem {
  label: string;
  expression: string;
  unit: string;
  color: string;
}

// ========== 提示和示例类型 ==========

export interface Tip {
  icon: 'info' | 'warning' | 'success';
  text: string;
}

export interface Example {
  title: string;
  desc: string;
}

// ========== 绘制元素类型 ==========

export type DrawElementKind =
  | 'rect'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'text'
  | 'spring'
  | 'wave'
  | 'arc'
  | 'path'
  | 'group'
  | 'axis'
  | 'function'
  | 'point'
  | 'polygon'
  | 'molecule'
  | 'beaker'
  | 'bubble'
  | 'reaction'
  | 'lightRay'
  | 'pendulum'
  | 'forceArrow';

export interface BaseDrawElement {
  id: string;
  kind: DrawElementKind;
  style?: DrawStyle;
  animation?: AnimationConfig;
  visible?: boolean;
  label?: string;
}

export interface DrawStyle {
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  shadow?: ShadowConfig;
  gradient?: GradientConfig;
  dash?: number[];
}

export interface ShadowConfig {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export interface GradientConfig {
  type: 'linear' | 'radial';
  colors: string[];
  angle?: number;
}

export interface AnimationConfig {
  type: 'none' | 'oscillate' | 'rotate' | 'scale' | 'path';
  duration?: number;
  loop?: boolean;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
  params?: Record<string, number | string>;
}

// ========== 基础绘制元素 ==========

export interface RectElement extends BaseDrawElement {
  kind: 'rect';
  x: number | string;
  y: number | string;
  width: number | string;
  height: number | string;
  radius?: number;
  cornerRadius?: number;
}

export interface CircleElement extends BaseDrawElement {
  kind: 'circle';
  cx: number | string;
  cy: number | string;
  r: number | string;
}

export interface LineElement extends BaseDrawElement {
  kind: 'line';
  x1: number | string;
  y1: number | string;
  x2: number | string;
  y2: number | string;
}

export interface ArrowElement extends BaseDrawElement {
  kind: 'arrow';
  x1: number | string;
  y1: number | string;
  x2: number | string;
  y2: number | string;
  headLength?: number;
  headAngle?: number;
  color?: string;
}

export interface TextElement extends BaseDrawElement {
  kind: 'text';
  x: number | string;
  y: number | string;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  textAlign?: 'left' | 'center' | 'right';
  textBaseline?: 'top' | 'middle' | 'bottom';
}

// ========== 物理元素 ==========

export interface SpringElement extends BaseDrawElement {
  kind: 'spring';
  x: number | string;
  y: number | string;
  length: number | string;
  coils?: number;
  amplitude?: number;
  anchor?: 'left' | 'right' | 'top' | 'bottom';
}

export interface WaveElement extends BaseDrawElement {
  kind: 'wave';
  x: number | string;
  y: number | string;
  amplitude: number | string;
  wavelength: number | string;
  frequency?: number;
  phase?: number;
  direction?: 'horizontal' | 'vertical';
}

export interface ArcElement extends BaseDrawElement {
  kind: 'arc';
  cx: number | string;
  cy: number | string;
  r: number | string;
  startAngle: number | string;
  endAngle: number | string;
}

export interface AxisElement extends BaseDrawElement {
  kind: 'axis';
  x: number | string;
  y: number | string;
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xLabel?: string;
  yLabel?: string;
  grid?: boolean;
}

export interface FunctionElement extends BaseDrawElement {
  kind: 'function';
  fn: string;
  xMin: number;
  xMax: number;
  color?: string;
  strokeWidth?: number;
}

export interface PointElement extends BaseDrawElement {
  kind: 'point';
  x: number | string;
  y: number | string;
  size?: number;
  label?: string;
  showCoordinates?: boolean;
}

// ========== 特殊元素 ==========

export interface PolygonElement extends BaseDrawElement {
  kind: 'polygon';
  points: Array<[number | string, number | string]>;
  closed?: boolean;
}

export interface LightRayElement extends BaseDrawElement {
  kind: 'lightRay';
  x1: number | string;
  y1: number | string;
  angle: number | string;
  length: number | string;
  color?: string;
  showAngle?: boolean;
  showNormal?: boolean;
}

export interface PendulumElement extends BaseDrawElement {
  kind: 'pendulum';
  anchorX: number | string;
  anchorY: number | string;
  length: number | string;
  angle: number | string;
  bobRadius?: number;
}

export interface ForceArrowElement extends BaseDrawElement {
  kind: 'forceArrow';
  x: number | string;
  y: number | string;
  angle: number | string;
  magnitude: number | string;
  color?: string;
  label?: string;
}

// ========== 化学元素 ==========

export interface MoleculeElement extends BaseDrawElement {
  kind: 'molecule';
  x: number | string;
  y: number | string;
  type: 'H2O' | 'O2' | 'H2' | 'CO2' | 'NaCl' | 'HCl' | string;
  scale?: number;
}

export interface BeakerElement extends BaseDrawElement {
  kind: 'beaker';
  x: number | string;
  y: number | string;
  width: number | string;
  height: number | string;
  fillLevel?: number | string;
  liquidColor?: string;
  showMeasurements?: boolean;
}

export interface BubbleElement extends BaseDrawElement {
  kind: 'bubble';
  x: number | string;
  y: number | string;
  radius: number | string;
  count?: number;
  rising?: boolean;
  speed?: number;
}

export interface ReactionElement extends BaseDrawElement {
  kind: 'reaction';
  x: number | string;
  y: number | string;
  reactants: string[];
  products: string[];
  rate?: number | string;
  showEnergy?: boolean;
}

// ========== 组元素 ==========

export interface GroupElement extends BaseDrawElement {
  kind: 'group';
  elements: DrawElement[];
  transform?: {
    translateX?: number | string;
    translateY?: number | string;
    scale?: number | string;
    rotate?: number | string;
  };
}

export interface PathElement extends BaseDrawElement {
  kind: 'path';
  d: string;
  fill?: string;
  stroke?: string;
}

// ========== 联合类型 ==========

export type DrawElement =
  | RectElement
  | CircleElement
  | LineElement
  | ArrowElement
  | TextElement
  | SpringElement
  | WaveElement
  | ArcElement
  | AxisElement
  | FunctionElement
  | PointElement
  | PolygonElement
  | LightRayElement
  | PendulumElement
  | ForceArrowElement
  | MoleculeElement
  | BeakerElement
  | BubbleElement
  | ReactionElement
  | GroupElement
  | PathElement;

// ========== 实验配置类型 ==========

export interface ExperimentConfig {
  id: string;
  title: string;
  description: string;
  theory: string;
  formula: string;
  formulaExplanation: string;
  params: ExperimentParameter[];
  statusItems: StatusItem[];
  tips: Tip[];
  examples: Example[];
  calculationTemplate?: string;
}

// ========== 计算结果类型 ==========

export interface CalculationResult {
  value: number | string;
  unit: string;
  formula?: string;
}

// ========== 实验状态类型 ==========

export interface ExperimentState {
  params: Record<string, number>;
  results: Record<string, CalculationResult>;
  animations: Record<string, number>;
  isPlaying: boolean;
  currentTime: number;
}

// ========== 提示词模板类型 ==========

export interface PromptTemplate {
  system: string;
  user: string;
  functions?: FunctionDefinition[];
}

export interface FunctionDefinition {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

// ========== 导出所有类型 ==========

export type {
  RectElement as Rect,
  CircleElement as Circle,
  LineElement as Line,
  ArrowElement as Arrow,
  TextElement as Text,
  SpringElement as Spring,
  WaveElement as Wave,
  ArcElement as Arc,
  PathElement as Path,
  GroupElement as Group,
  AxisElement as Axis,
  FunctionElement as FunctionPlot,
  PointElement as Point,
  PolygonElement as Polygon,
  MoleculeElement as Molecule,
  BeakerElement as Beaker,
  BubbleElement as Bubble,
  ReactionElement as Reaction,
  LightRayElement as LightRay,
  PendulumElement as Pendulum,
  ForceArrowElement as ForceArrow,
};
