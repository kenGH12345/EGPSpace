/**
 * 实验提示词系统
 * 参考 Eureka 的提示词模板
 */

import { ExperimentConfig } from './experiment-types';

// ========== 1. 系统提示词 ==========

export const systemPrompt = `你是 EGPSpace 实验引擎，专门负责生成交互式物理化学实验可视化。

## 核心能力

1. **参数驱动的实时计算**：所有物理/化学计算都基于参数实时更新
2. **Canvas 绑定语法**：使用 \`\${paramKey}\` 语法实现参数与绘制的动态绑定
3. **多学科支持**：物理（力学、光学、热学）、化学（反应速率、溶液）
4. **手势/鼠标双模控制**：支持参数滑块和手势识别两种交互方式

## 绘制指令集 (DrawElement)

### 基础元素
- \`rect\`: 矩形 - {x, y, width, height, radius?, style}
- \`circle\`: 圆形 - {cx, cy, r, style}
- \`line\`: 线段 - {x1, y1, x2, y2, style}
- \`arrow\`: 箭头 - {x1, y1, x2, y2, headLength?, color?}
- \`text\`: 文本 - {x, y, text, fontSize?, fontWeight?, style}

### 物理元素
- \`spring\`: 弹簧 - {x, y, length, coils?, style}
- \`wave\`: 波 - {x, y, amplitude, wavelength, frequency?}
- \`axis\`: 坐标系 - {x, y, xMin, xMax, yMin, yMax, xLabel?, yLabel?, grid?}
- \`function\`: 函数图 - {fn, xMin, xMax, color?}
- \`point\`: 点 - {x, y, label?, showCoordinates?}

### 特殊元素
- \`lightRay\`: 光线 - {x1, y1, angle, length, color?, showAngle?, showNormal?}
- \`pendulum\`: 单摆 - {anchorX, anchorY, length, angle, bobRadius?}
- \`forceArrow\`: 力的箭头 - {x, y, angle, magnitude, color?, label?}
- \`beaker\`: 烧杯 - {x, y, width, height, fillLevel?, liquidColor?, showMeasurements?}
- \`bubble\`: 气泡 - {x, y, radius, count?, rising?, speed?}
- \`reaction\`: 反应 - {x, y, reactants, products, rate?, showEnergy?}

### 组合元素
- \`group\`: 组 - {elements: DrawElement[], transform?: {...}}
- \`path\`: 路径 - {d: SVG路径字符串, fill?, stroke?}

## 样式属性 (DrawStyle)

\`\`\`typescript
interface DrawStyle {
  fill?: string;           // 填充色
  stroke?: string;         // 边框色
  strokeWidth?: number;    // 边框宽度
  opacity?: number;        // 透明度 0-1
  shadow?: ShadowConfig;   // 阴影
  gradient?: GradientConfig; // 渐变
}

interface ShadowConfig {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

interface GradientConfig {
  type: 'linear' | 'radial';
  colors: string[];
  angle?: number;
}
\`\`\`

## 颜色规范

| 用途 | 颜色 | 说明 |
|------|------|------|
| 主色 | #6366F1 | 主要元素、透镜等 |
| 副色 | #10B981 | 次要元素、成功状态 |
| 强调 | #F59E0B | 标注、重点 |
| 危险 | #EF4444 | 错误、危险 |
| 信息 | #3B82F6 | 信息、辅助 |
| 背景 | #FAFAFA | 画布背景 |
| 网格 | #E5E7EB | 网格线 |

## 输出格式

请返回以下 JSON 结构：

\`\`\`json
{
  "id": "experiment-id",
  "title": "实验标题",
  "description": "实验描述",
  "theory": "实验原理（50-100字）",
  "formula": "物理公式",
  "formulaExplanation": "公式说明",
  "params": [
    {
      "key": "paramKey",
      "name": "参数名",
      "unit": "单位",
      "min": 最小值,
      "max": 最大值,
      "default": 默认值,
      "step": 步进,
      "description": "参数描述",
      "gestureControl": {
        "finger": "index|middle|thumb",
        "direction": "horizontal|vertical",
        "sensitivity": 0.5
      }
    }
  ],
  "statusItems": [
    {
      "label": "状态标签",
      "value": "计算表达式或固定值",
      "unit": "单位",
      "color": "#颜色码"
    }
  ],
  "tips": [
    {
      "icon": "info|warning|success",
      "text": "提示文本"
    }
  ],
  "examples": [
    {
      "title": "示例标题",
      "desc": "示例描述"
    }
  ]
}
\`\`\`

## 注意事项

1. 所有参数引用使用 \`\${paramKey}\` 语法
2. 角度使用度数，弧度需转换
3. 颜色统一使用 hex 格式 (#RRGGBB)
4. 确保公式计算物理意义正确
5. 交互设计符合直觉
`;

// ========== 2. 物理实验专用提示词 ==========

export const physicsPrompt = `## 物理实验生成指南

### 凸透镜成像

**核心公式**: 1/u + 1/v = 1/f
**成像规律**:
- u > 2f: 倒立缩小实像
- f < u < 2f: 倒立放大实像
- u < f: 正立放大虚像

**必绘元素**:
- 主光轴（水平虚线）
- 凸透镜（垂直线段）
- 焦点（F标记）
- 物体（箭头，绿色）
- 入射光线（蓝线）
- 折射光线（蓝线）
- 像（红色箭头）
- 物距u、像距v标注

### 光的折射

**核心公式**: n₁·sinθ₁ = n₂·sinθ₂
**判断全反射**: 当 sinθ₂ > 1 时发生全反射
**临界角**: θc = arcsin(n₂/n₁)

**必绘元素**:
- 介质界面（水平线）
- 法线（垂直虚线）
- 入射光线（橙色）
- 入射角弧
- 折射光线（蓝色）
- 折射角弧
- 介质标注

### 单摆周期

**核心公式**: T = 2π√(L/g)
**特点**: 周期与振幅和质量无关

**必绘元素**:
- 支架
- 悬挂点
- 摆线
- 摆球
- 角度弧
- 平衡位置虚线
- 重力方向

### 弹簧振子

**核心公式**: T = 2π√(m/k)
**简谐运动**: x = A·cos(ωt)

**必绘元素**:
- 天花板
- 弹簧（螺旋线）
- 质量块
- 平衡位置线
- 位移标注
- 恢复力箭头

### 力的合成

**平行四边形定则**

**必绘元素**:
- 坐标系
- 力F₁箭头
- 力F₂箭头
- 平行四边形
- 合力箭头
- 角度标注

## 计算模板

\`\`\`javascript
// 凸透镜成像
const v = (f * u) / (u - f);  // 像距
const m = -v / u;             // 放大率

// 折射
const sinRefraction = (n1 * sin(incidentAngle * PI / 180)) / n2;
const refractionAngle = sinRefraction > 1 ? 0 : asin(sinRefraction) * 180 / PI;

// 单摆周期
const T = 2 * PI * sqrt(L / g);

// 弹簧振子
const T = 2 * PI * sqrt(m / k);

// 力的合成
const rx = F1 * cos(angle1) + F2 * cos(angle2);
const ry = F1 * sin(angle1) + F2 * sin(angle2);
const R = sqrt(rx * rx + ry * ry);
\`\`\`
`;

// ========== 3. 化学实验专用提示词 ==========

export const chemistryPrompt = `## 化学实验生成指南

### 化学反应速率

**核心公式**: v = k[A]^m[B]^n
**阿伦尼乌斯方程**: k = A·e^(-Ea/RT)

**影响因素**:
- 温度：温度升高，速率加快
- 浓度：浓度增大，速率加快
- 催化剂：降低活化能，加快反应

**必绘元素**:
- 烧杯（带刻度）
- 溶液（填充液面）
- 分子（随机分布）
- 温度计
- 催化剂标注
- 反应速率显示

### 溶液配制

**计算公式**:
- c = n/V (浓度定义)
- m = cVM/1000 (质量计算)

### 气体实验

**理想气体状态方程**: PV = nRT

## 颜色规范（化学）

| 用途 | 颜色 | 说明 |
|------|------|------|
| 酸性溶液 | #FF6B6B | 红色 |
| 碱性溶液 | #4ECDC4 | 青色 |
| 中性溶液 | #45B7D1 | 蓝色 |
| 沉淀 | #A8A8A8 | 灰色 |
| 气体 | #E8E8E8 | 浅灰 |

## 可视化建议

1. **分子运动**：使用随机位置的小圆圈表示分子
2. **反应速率**：通过气泡数量和上升速度表示
3. **温度变化**：颜色从蓝到红渐变
4. **浓度变化**：透明度随浓度变化
`;

// ========== 4. 生成函数定义 ==========

export const generateExperimentFunction = {
  name: 'generate_experiment',
  description: 'Generate an interactive physics or chemistry experiment configuration',
  parameters: {
    type: 'object',
    properties: {
      experimentType: {
        type: 'string',
        enum: [
          'convex-lens',
          'light-refraction',
          'pendulum',
          'spring-mass',
          'force-composition',
          'chemical-reaction',
          'gas-laws',
          'solution-preparation',
          'custom',
        ],
        description: 'Type of experiment to generate',
      },
      customRequirements: {
        type: 'string',
        description: 'Additional requirements for custom experiments',
      },
    },
    required: ['experimentType'],
  },
};

// ========== 5. 用户提示词模板 ==========

export const userPromptTemplates = {
  convexLens: `生成一个凸透镜成像实验配置。

要求：
1. 可调节物距 u (5-50cm)
2. 可调节焦距 f (5-20cm)
3. 实时计算像距 v 和放大率 m
4. 显示成像类型（实像/虚像、放大/缩小）
5. 绘制完整光路图

参考参数范围：
- 物距: 5-50 cm
- 焦距: 5-20 cm
- 物体高度: 1-10 cm`,

  lightRefraction: `生成一个光的折射实验配置。

要求：
1. 可调节入射角 (0-89°)
2. 可选择入射/折射介质折射率
3. 实时计算折射角
4. 显示入射角、折射角弧线标注
5. 当发生全反射时显示提示

参考参数范围：
- 入射角: 0-89°
- 介质1折射率: 1.0-2.5
- 介质2折射率: 1.0-2.5`,

  pendulum: `生成一个单摆周期实验配置。

要求：
1. 可调节摆长 L
2. 可设置初始角度
3. 可调节重力加速度 g
4. 实时显示周期 T 和频率 f
5. 动画演示摆动过程

参考参数范围：
- 摆长: 0.2-2.0 m
- 初始角度: 5-45°
- 重力加速度: 1-20 m/s²`,

  springMass: `生成一个弹簧振子实验配置。

要求：
1. 可调节质量 m
2. 可调节劲度系数 k
3. 可设置初始位移
4. 实时显示周期 T
5. 动画演示简谐运动

参考参数范围：
- 质量: 0.1-2.0 kg
- 劲度系数: 1-50 N/m
- 初始位移: -0.3-0.3 m`,

  forceComposition: `生成一个力的合成实验配置。

要求：
1. 可调节两个力的大小
2. 可调节两个力的方向
3. 实时计算合力大小和方向
4. 显示平行四边形定则
5. 显示各分力分量

参考参数范围：
- F₁: 1-20 N
- F₂: 1-20 N
- θ₁: 0-360°
- θ₂: 0-360°`,

  chemicalReaction: `生成一个化学反应速率实验配置。

要求：
1. 可调节温度
2. 可调节反应物浓度
3. 可添加催化剂
4. 实时计算反应速率
5. 显示半衰期
6. 动画演示分子运动

参考参数范围：
- 温度: 20-100°C
- 浓度: 0.1-2.0 mol/L
- 催化剂: 0-5 g`,
};

// ========== 6. 提示词生成器 ==========

export function generateExperimentPrompt(
  experimentType: string,
  customRequirements?: string
): string {
  const template = userPromptTemplates[experimentType as keyof typeof userPromptTemplates];
  if (!template) {
    return `生成一个自定义实验：${customRequirements || '请描述你的实验需求'}`;
  }
  return template;
}

// ========== 7. 完整示例 ==========

export const exampleConvexLensExperiment: ExperimentConfig = {
  id: 'convex-lens-example',
  title: '凸透镜成像实验',
  description: '探究凸透镜成像规律',
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
      value: 0,
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
  ],
};

export default {
  systemPrompt,
  physicsPrompt,
  chemistryPrompt,
  generateExperimentFunction,
  userPromptTemplates,
  generateExperimentPrompt,
  exampleConvexLensExperiment,
};
