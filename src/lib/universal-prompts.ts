/**
 * 通用的交互式实验可视化提示词模板
 * 
 * 适用场景：
 * - 物理、化学、生物等理科实验
 * - 工程、机械、电子等工科演示
 * - 数学可视化（函数图像、几何变换）
 * - 任何需要参数驱动的可视化场景
 */

import { ExperimentConfig } from './experiment-types';

// ========== 1. 通用系统提示词 ==========

/**
 * 通用的实验可视化系统提示词
 * 不依赖任何特定项目或领域
 */
export const universalSystemPrompt = `你是实验可视化引擎，负责生成交互式实验/演示配置。

## 核心能力

1. **参数驱动的实时计算**：所有计算基于可调参数实时更新
2. **参数绑定语法**：使用 \`\\\${paramKey}\` 语法实现参数与可视化的动态绑定
3. **多学科支持**：理科、工科、数学等需要可视化演示的领域
4. **双模交互**：支持滑块控制和手势识别两种交互方式

## 绘制元素类型 (DrawElement)

### 基础图形
- \`rect\`: 矩形 - {x, y, width, height, radius?}
- \`circle\`: 圆形 - {cx, cy, r}
- \`line\`: 线段 - {x1, y1, x2, y2}
- \`arrow\`: 箭头 - {x1, y1, x2, y2, headLength?}
- \`text\`: 文本 - {x, y, text, fontSize?, fontWeight?}
- \`path\`: SVG路径 - {d: 路径字符串, fill?, stroke?}

### 科学可视化
- \`axis\`: 坐标系 - {xMin, xMax, yMin, yMax, xLabel?, yLabel?, grid?}
- \`function\`: 函数图 - {fn: 函数表达式, xMin, xMax, color?}
- \`point\`: 点 - {x, y, label?, showCoordinates?}
- \`wave\`: 波 - {x, y, amplitude, wavelength, frequency?}
- \`spring\`: 弹簧 - {x, y, length, coils?}
- \`pendulum\`: 单摆 - {anchorX, anchorY, length, angle}
- \`forceArrow\`: 力的箭头 - {x, y, angle, magnitude, color?, label?}
- \`beaker\`: 容器 - {x, y, width, height, fillLevel?, liquidColor?}

### 组合与变换
- \`group\`: 组 - {elements: DrawElement[], transform?}
- 支持旋转、缩放、平移变换

## 样式规范

\`\`\`typescript
interface DrawStyle {
  fill?: string;           // 填充色 (hex格式)
  stroke?: string;         // 边框色
  strokeWidth?: number;    // 线宽
  opacity?: number;        // 透明度 0-1
  shadow?: ShadowConfig;   // 阴影 {color, blur, offsetX, offsetY}
  gradient?: GradientConfig; // 渐变 {type: 'linear'|'radial', colors[], angle?}
}
\`\`\`

## 颜色规范（建议）

| 用途 | 建议色 | 说明 |
|------|--------|------|
| 主色 | #6366F1 | 主要元素 |
| 副色 | #10B981 | 次要元素、成功 |
| 强调 | #F59E0B | 标注、重点 |
| 危险 | #EF4444 | 错误、警示 |
| 信息 | #3B82F6 | 信息、辅助 |
| 正极 | #EF4444 | 红色 |
| 负极 | #3B82F6 | 蓝色 |

## 输出格式要求

\`\`\`json
{
  "id": "experiment-id",
  "title": "实验/演示标题",
  "description": "简短描述",
  "theory": "原理说明（50-100字）",
  "formula": "核心公式（如有）",
  "formulaExplanation": "公式各变量含义",
  "params": [
    {
      "key": "paramKey",
      "name": "参数名",
      "unit": "单位",
      "min": 数值,
      "max": 数值,
      "default": 默认值,
      "step": 步进,
      "description": "参数描述",
      "gestureControl": {  // 可选
        "finger": "index|middle|thumb",
        "direction": "horizontal|vertical",
        "sensitivity": 0.5
      }
    }
  ],
  "statusItems": [
    {
      "label": "状态标签",
      "value": "计算表达式",
      "unit": "单位",
      "color": "#颜色"
    }
  ],
  "tips": [
    { "icon": "info|warning|success", "text": "提示内容" }
  ],
  "examples": [
    { "title": "示例标题", "desc": "示例说明" }
  ]
}
\`\`\`

## 关键约束

1. 参数引用必须使用 \`\\\${paramKey}\` 语法
2. 所有颜色使用 hex 格式 (#RRGGBB)
3. 角度单位统一使用度数（除非特殊说明）
4. 确保公式计算物理/数学意义正确
5. 示例参数范围需合理且实用
`;

// ========== 2. 学科领域提示词片段 ==========

/**
 * 物理学实验提示词片段
 */
export const physicsPromptFragment = `## 物理学实验要点

### 力学
- 牛顿第二定律: F = ma
- 能量守恒: E_k + E_p = 常数
- 动量守恒: m₁v₁ + m₂v₂ = m₁v₁' + m₂v₂'

### 电磁学
- 欧姆定律: V = IR
- 库仑定律: F = kq₁q₂/r²
- 法拉第定律: ε = -dΦ/dt

### 光学
- 折射定律: n₁sinθ₁ = n₂sinθ₂
- 透镜成像: 1/u + 1/v = 1/f
- 干涉条件: Δ = mλ

### 热学
- 理想气体状态方程: PV = nRT
- 热力学第一定律: ΔU = Q - W

### 波动学
- 波动方程: y = A·sin(ωt - kx)
- 多普勒效应: f' = f·(v ± v_observer)/(v ∓ v_source)

### 常用可视化元素
- 力：箭头，长度表示大小，颜色表示类型
- 轨迹：虚线或点线
- 场：梯度填充或等高线
- 波：正弦曲线或波前线
`;

/**
 * 化学实验提示词片段
 */
export const chemistryPromptFragment = `## 化学实验要点

### 反应动力学
- 反应速率: v = k[A]^m[B]^n
- 阿伦尼乌斯方程: k = A·e^(-Ea/RT)

### 溶液化学
- 浓度: c = n/V
- pH: pH = -lg[H⁺]
- 滴定曲线: pH vs 体积

### 电化学
- 能斯特方程: E = E° + (RT/nF)ln(Q)
- 法拉第电解定律: m = (Q·M)/(n·F)

### 常用可视化元素
- 分子：不同颜色/大小的小球
- 反应：气泡上升、沉淀生成
- 滴定：滴管、锥形瓶、pH曲线
- 溶液：颜色渐变、液面高度
`;

/**
 * 数学可视化提示词片段
 */
export const mathPromptFragment = `## 数学可视化要点

### 函数图像
- 一次函数: y = ax + b
- 二次函数: y = ax² + bx + c
- 三角函数: y = A·sin(ωx + φ)
- 指数/对数: y = e^x, y = ln(x)

### 几何变换
- 旋转：绕原点或指定点旋转角度
- 缩放：以原点或指定点为中心缩放
- 平移：沿向量方向移动

### 常用可视化元素
- 坐标系：直角坐标、极坐标
- 函数曲线：实线、虚线、不同颜色
- 点：标记关键点、特殊点
- 区域：填充、阴影
`;

/**
 * 工程/机械提示词片段
 */
export const engineeringPromptFragment = `## 工程可视化要点

### 机构运动
- 曲柄滑块机构
- 凸轮机构
- 齿轮传动

### 电路分析
- 基本电路元件
- 信号波形
- 伯德图

### 材料力学
- 梁的弯曲
- 应力分布
- 变形可视化

### 常用可视化元素
- 构件：矩形、梯形、圆形
- 连接：铰链、滑块、弹簧
- 运动：轨迹、速度矢量
`;

// ========== 3. 生成函数定义 ==========

/**
 * 通用的函数定义
 */
export const universalGenerateFunction = {
  name: 'generate_experiment',
  description: 'Generate an interactive experiment or demonstration configuration',
  parameters: {
    type: 'object',
    properties: {
      domain: {
        type: 'string',
        enum: [
          'physics',
          'chemistry', 
          'biology',
          'mathematics',
          'engineering',
          'custom',
        ],
        description: '学科领域',
      },
      subfield: {
        type: 'string',
        description: '子领域，如力学、光学、热学等',
      },
      requirements: {
        type: 'string',
        description: '实验/演示的具体需求描述',
      },
    },
    required: ['domain', 'requirements'],
  },
};

// ========== 4. 用户提示词模板 ==========

/**
 * 通用的用户提示词模板
 * 用户只需填入领域和需求，即可生成实验配置
 */
export const universalUserPromptTemplate = `生成一个{domain}领域的{title}实验/演示配置。

## 基本信息
- 学科领域: {domain}
- 实验类型: {subfield}
- 标题: {title}

## 需求描述
{requirements}

## 参数要求
请设计3-5个可调参数，每个参数需要：
- 合理的数值范围
- 合适的默认值
- 清晰的物理/数学意义
- 与核心公式相关联

## 可视化要求
- 清晰展示实验原理
- 实时响应参数变化
- 提供必要的标注和说明
- 符合该领域的学习认知规律

## 参考
- 核心公式: {formula}
- 难度级别: {difficulty}
`;

// ========== 5. 快速生成模板 ==========

/**
 * 快速生成简单演示的提示词
 */
export const quickDemoPrompt = `生成一个简单的可视化演示。

要求：
1. 1-3个可调参数
2. 清晰展示概念
3. 实时响应参数变化
4. 包含中文界面

主题：{topic}
具体内容：{details}`;

/**
 * 批量生成多个相关实验的提示词
 */
export const batchGeneratePrompt = `批量生成{count}个相关实验/演示。

主题：{theme}
难度：{difficulty}
覆盖范围：{coverage}

要求：
1. 实验之间有逻辑递进关系
2. 每个实验独立完整
3. 参数设计合理且有趣
4. 包含经典案例和拓展应用`;

// ========== 6. 提示词组合工具 ==========

/**
 * 根据领域组合提示词
 */
export function composePrompt(
  domain: 'physics' | 'chemistry' | 'mathematics' | 'engineering' | 'custom',
  subfield?: string,
  customRequirements?: string
): string {
  const fragment = {
    physics: physicsPromptFragment,
    chemistry: chemistryPromptFragment,
    mathematics: mathPromptFragment,
    engineering: engineeringPromptFragment,
    custom: '',
  }[domain];

  return `${universalSystemPrompt}

${fragment || ''}

## 额外要求
${customRequirements || '请生成一个标准配置'}
`;
}

/**
 * 生成用户提示词
 */
export function generateUserPrompt(params: {
  domain: string;
  title: string;
  subfield?: string;
  requirements: string;
  formula?: string;
  difficulty?: string;
}): string {
  return universalUserPromptTemplate
    .replace('{domain}', params.domain)
    .replace('{title}', params.title)
    .replace('{subfield}', params.subfield || '')
    .replace('{requirements}', params.requirements)
    .replace('{formula}', params.formula || '无特定公式')
    .replace('{difficulty}', params.difficulty || '中等');
}

// ========== 7. 示例配置 ==========

export const exampleExperiments: Partial<ExperimentConfig>[] = [
  {
    id: 'example-basic',
    title: '基础函数图像',
    description: '演示一次函数的图像特征',
    theory: '一次函数 y = ax + b，a控制斜率，b控制截距',
    formula: 'y = ax + b',
  },
  {
    id: 'example-physics',
    title: '自由落体运动',
    description: '探究自由落体运动规律',
    theory: '物体在重力作用下做匀加速直线运动',
    formula: 'h = ½gt²',
  },
];

// ========== 8. 导出 ==========

export default {
  universalSystemPrompt,
  physicsPromptFragment,
  chemistryPromptFragment,
  mathPromptFragment,
  engineeringPromptFragment,
  universalGenerateFunction,
  universalUserPromptTemplate,
  quickDemoPrompt,
  batchGeneratePrompt,
  composePrompt,
  generateUserPrompt,
  exampleExperiments,
};
