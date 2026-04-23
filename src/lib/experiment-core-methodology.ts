/**
 * ============================================================================
 * 交互实验生成的底层方法论
 * ============================================================================
 * 
 * 灵感来源：历史上的伟大实验是如何设计的？
 * 
 * 伽利略 (1564-1642)
 * ├── 自由落体实验 - "把复杂的问题简化到最本质"
 * │   洞察：下落距离 ∝ 时间² （不是速度 ∝ 质量）
 * │   方法：斜面实验（减缓运动，可测量时间）
 * │   可视化：让"时间"这个抽象概念变得可观察
 * │
 * 牛顿 (1643-1727)
 * ├── 万有引力实验 - "从现象到数学模型"
 * │   洞察：F = Gm₁m₂/r² （苹果和月亮遵循同一规律）
 * │   方法：控制变量，观察不同质量物体的运动
 * │   可视化：轨道、抛物线、力的图示
 * │
 * 法拉第 (1791-1867)
 * ├── 电磁感应实验 - "从现象到本质"
 * │   洞察：变化的磁场产生电流（不是磁铁大小）
 * │   方法：不同速度移动磁铁，观察电流变化
 * │   可视化：电场线、磁场线
 * │
 * 欧姆 (1789-1854)
 * ├── 欧姆定律 - "建立精确的数学关系"
 * │   洞察：V = IR （电压、电流、电阻的定量关系）
 * │   方法：系统地改变一个变量，测量其他变量
 * │   可视化：电路图、伏安特性曲线
 * │
 * ============================================================================
 * 
 * 这些实验的共同点是什么？
 * 1. 抓住最本质的变量
 * 2. 建立可控的实验条件
 * 3. 设计精确的测量方法
 * 4. 用数学语言描述规律
 * 5. 用可视化让抽象变具体
 */

import { ExperimentConfig } from './experiment-types';

// ============================================================================
// 第一部分：实验生成的底层逻辑
// ============================================================================

/**
 * 实验生成的本质是什么？
 * 
 * 从伽利略的方法论中学习：
 * "自然界是用数学语言写成的"
 * 
 * 一个好的实验 = 找到关键的少数变量 + 建立它们之间的数学关系
 */

/**
 * 变量分离原则（来自伽利略）
 * 
 * 复杂现象 = f(变量1, 变量2, 变量3, ...)
 * 
 * 好的实验设计：
 * 1. 识别最重要的 1-3 个变量
 * 2. 其他变量保持恒定（或忽略）
 * 3. 找出变量之间的关系
 * 
 * 例如：自由落体
 * - 变量：高度、时间、质量、重力加速度
 * - 关键：h = ½gt² （只涉及 h, g, t）
 * - 简化：忽略空气阻力、质量影响
 */
export const variableSeparationPrinciple = `
## 变量分离原则

### 问题
一个物理现象涉及很多变量，如何设计实验？

### 答案（来自伽利略）
选择最重要的 1-3 个变量，其他保持恒定。

### 具体步骤
1. 列出所有可能的变量
2. 根据物理直觉，确定最关键的变量
3. 设置其他变量为标准值（如 g = 9.8 m/s²）
4. 研究关键变量之间的关系

### 示例：弹簧振子
变量：质量、劲度系数、振幅、阻尼...
简化：研究 T = 2π√(m/k)，忽略阻尼

### 检验标准
- 用户能调节的参数 ≤ 3 个
- 每个参数有明确的物理意义
- 参数之间相互独立（或关系清晰）
`;

/**
 * 可控性原则（来自欧姆）
 * 
 * 好的实验必须能精确控制输入
 * 
 * 欧姆的方法：
 * 1. 改变电压（精确控制）
 * 2. 测量电流（精确测量）
 * 3. 保持电阻不变（精确控制）
 * 
 * 这就是"控制变量法"
 */
export const controllabilityPrinciple = `
## 可控性原则

### 问题
用户如何精确控制实验条件？

### 答案（来自欧姆）
每个可调参数必须是"可控的"：
- 有明确的数值范围
- 可以精确设置到任意值
- 变化时效果可预测

### 具体实现
滑块：适用于连续变量（高度、温度）
拖拽：适用于直观量（物体位置）
输入框：适用于精确值（特定数据点）

### 检验标准
- 每个参数有 min, max, default
- 参数变化是平滑的（不是跳跃的）
- 用户能直观理解参数含义
`;

/**
 * 可观测性原则（来自伽利略）
 * 
 * 好的实验必须有清晰的输出
 * 
 * 伽利略的洞察：
 * - 自由落体太快，无法直接观察
 * - 用斜面减缓运动，就能"看见"时间
 * 
 * 这就是"让不可见变得可见"
 */
export const observabilityPrinciple = `
## 可观测性原则

### 问题
实验结果如何清晰地展示给用户？

### 答案（来自伽利略）
把抽象的物理量转化为可见的形式。

### 具体方法

1. 实时数据卡片
   - 显示当前时间、高度、速度
   - 数值随实验动态更新

2. 动画可视化
   - 小球下落、滑块移动、指针偏转
   - 让"看不见"变成"看得见"

3. 图表追踪
   - v-t 图：斜率 = 加速度
   - s-t 图：斜率 = 速度
   - 帮助发现规律

### 检验标准
- 每个计算的量都有显示
- 变化过程是平滑动画
- 关键关系能用图表表示
`;

/**
 * 因果链原则（来自牛顿）
 * 
 * 好的实验展示清晰的因果关系
 * 
 * 牛顿的洞察：
 * - 力 → 加速度 → 速度 → 位置
 * - 每一步都是上一步的结果
 * 
 * 这就是"物理过程的可视化"
 */
export const causalityPrinciple = `
## 因果链原则

### 问题
参数变化如何传递到结果？

### 答案（来自牛顿）
建立清晰的因果链：

输入参数 → 物理计算 → 状态更新 → UI渲染

### 示例：自由落体

输入：初始高度 h₀, 重力 g
  ↓
计算：t = √(2h₀/g), v = gt, h = h₀ - ½gt²
  ↓
状态：当前时间 t, 当前高度 h, 当前速度 v
  ↓
渲染：小球位置, 数据卡片, v-t 曲线

### 检验标准
- 参数变化立即响应（< 16ms）
- 状态更新顺序清晰
- 用户能追踪因果关系
`;

/**
 * 边界探索原则（来自法拉第）
 * 
 * 好的实验帮助用户探索边界
 * 
 * 法拉第的方法：
 * - 改变磁铁移动速度
 * - 观察电流变化
 * - 发现：速度越快，电流越大
 * 
 * 这就是"参数空间的探索"
 */
export const boundaryExplorationPrinciple = `
## 边界探索原则

### 问题
用户如何理解参数的有效范围？

### 答案（来自法拉第）
设计"有趣的边界条件"：

1. 物理极限
   - 高度 = 0：物体已经在地面
   - 速度 = 光速：接近相对论效应
   - 温度 = 绝对零度：量子效应

2. 有趣的中间值
   - 刚好落地：v = √(2gh)
   - 刚好漂浮：g = 0（月球）
   - 刚好平衡：向心力 = 重力

3. 极端情况
   - 摩擦力 = 0：永动机？
   - 质量 = 0：光子行为

### 检验标准
- 参数范围覆盖有意义的区间
- 有"临界点"或"相变"
- 极端值有特殊提示
`;

// ============================================================================
// 第二部分：从历史实验提炼的"生成模板"
// ============================================================================

/**
 * 这些模板是从历史实验中抽象出来的通用模式
 */

/**
 * 模板1：伽利略-自由落体模式
 * 
 * 核心洞察：s = ½gt²
 * 
 * 变量：
 * - 可控：初始高度 h₀、重力加速度 g
 * - 可测：当前高度 h、时间 t、速度 v
 * 
 * 交互：
 * - 拖拽小球设置初始高度
 * - 滑块调节重力加速度
 * - 释放开始实验
 * - 重置恢复初始状态
 */
export const galileoFreeFallTemplate = {
  id: 'galileo-free-fall',
  name: '伽利略-自由落体',
  concept: 's = ½gt²',
  origin: '伽利略斜面实验 (1600s)',
  
  variables: {
    input: [
      { key: 'h0', name: '初始高度', unit: 'm', range: [0, 100], default: 80 },
      { key: 'g', name: '重力加速度', unit: 'm/s²', range: [1, 20], default: 9.8 },
    ],
    output: [
      { key: 't', name: '时间', unit: 's' },
      { key: 'h', name: '当前高度', unit: 'm' },
      { key: 'v', name: '速度', unit: 'm/s' },
    ],
  },
  
  equations: {
    primary: ['h = h₀ - ½gt²', 'v = gt', 'v² = 2g(h₀-h)'],
    derived: ['t = √(2h₀/g)'],
  },
  
  visualization: {
    canvas: ['刻度尺', '可拖拽小球', '地面', 'v-t图'],
    style: '米色背景 + 橙色强调',
  },
  
  interactions: ['拖拽设置高度', '滑块调节g', '释放开始', '重置恢复'],
  
  historicalNote: '伽利略通过斜面实验发现：下落距离与时间平方成正比',
};

/**
 * 模板2：牛顿-万有引力模式
 * 
 * 核心洞察：F = Gm₁m₂/r²
 * 
 * 变量：
 * - 可控：轨道半径 r、中心质量 M
 * - 可测：轨道速度 v、周期 T
 * 
 * 交互：
 * - 拖拽卫星改变轨道
 * - 滑块调节中心质量
 * - 观察轨道变化
 */
export const newtonGravityTemplate = {
  id: 'newton-gravity',
  name: '牛顿-万有引力',
  concept: 'F = Gm₁m₂/r²',
  origin: '牛顿月地验证 (1687)',
  
  variables: {
    input: [
      { key: 'r', name: '轨道半径', unit: 'km', range: [100, 1000], default: 400 },
      { key: 'M', name: '中心质量', unit: '×10²⁴kg', range: [1, 100], default: 6 },
    ],
    output: [
      { key: 'v', name: '轨道速度', unit: 'km/s' },
      { key: 'T', name: '周期', unit: 's' },
      { key: 'F', name: '引力', unit: 'N' },
    ],
  },
  
  equations: {
    primary: ['v = √(GM/r)', 'T = 2πr/v', 'F = GMm/r²'],
    derived: ['向心力 = 万有引力'],
  },
  
  visualization: {
    canvas: ['太阳', '行星轨道', '速度箭头', '周期图'],
    style: '深色背景 + 轨道线条',
  },
  
  interactions: ['拖拽改变半径', '滑块调节质量', '观察轨道'],
  
  historicalNote: '牛顿证明：苹果落地和月亮绕地球遵循同一规律',
};

/**
 * 模板3：法拉第-电磁感应模式
 * 
 * 核心洞察：ε = -dΦ/dt
 * 
 * 变量：
 * - 可控：磁铁速度 v、线圈匝数 N
 * - 可测：感应电流 I、感应电动势 ε
 * 
 * 交互：
 * - 移动磁铁产生电流
 * - 观察电流方向（楞次定律）
 * - 改变匝数观察变化
 */
export const faradayInductionTemplate = {
  id: 'faraday-induction',
  name: '法拉第-电磁感应',
  concept: 'ε = -N × dΦ/dt',
  origin: '法拉第电磁感应实验 (1831)',
  
  variables: {
    input: [
      { key: 'v', name: '磁铁速度', unit: 'cm/s', range: [0, 50], default: 10 },
      { key: 'N', name: '线圈匝数', unit: '匝', range: [1, 100], default: 10 },
    ],
    output: [
      { key: 'epsilon', name: '感应电动势', unit: 'V' },
      { key: 'I', name: '感应电流', unit: 'mA' },
      { key: 'phi', name: '磁通量', unit: 'Wb' },
    ],
  },
  
  equations: {
    primary: ['ε = -N × dΦ/dt', 'Φ = B×A×cosθ'],
    derived: ['楞次定律：感应电流方向'],
  },
  
  visualization: {
    canvas: ['线圈', '磁铁', '电流方向', '电动势图'],
    style: '蓝色主题 + 电流动画',
  },
  
  interactions: ['移动磁铁', '改变匝数', '观察电流方向'],
  
  historicalNote: '法拉第发现：变化的磁场能产生电流，开创电气时代',
};

/**
 * 模板4：欧姆-电路分析模式
 * 
 * 核心洞察：V = IR
 * 
 * 变量：
 * - 可控：电压 V、电阻 R
 * - 可测：电流 I、功率 P
 * 
 * 交互：
 * - 调节电压滑块
 * - 调节电阻滑块
 * - 观察电流变化
 * - 显示伏安特性曲线
 */
export const ohmCircuitTemplate = {
  id: 'ohm-circuit',
  name: '欧姆-电路分析',
  concept: 'V = IR',
  origin: '欧姆电路实验 (1827)',
  
  variables: {
    input: [
      { key: 'V', name: '电压', unit: 'V', range: [0, 24], default: 12 },
      { key: 'R', name: '电阻', unit: 'Ω', range: [1, 100], default: 10 },
    ],
    output: [
      { key: 'I', name: '电流', unit: 'A' },
      { key: 'P', name: '功率', unit: 'W' },
    ],
  },
  
  equations: {
    primary: ['I = V/R', 'P = VI', 'P = I²R'],
    derived: ['伏安特性曲线'],
  },
  
  visualization: {
    canvas: ['电路图', '电流表', '电压表', '伏安曲线'],
    style: '绿色主题 + 电路元件',
  },
  
  interactions: ['调节电压', '调节电阻', '观察电流', '看伏安曲线'],
  
  historicalNote: '欧姆用伏安法建立电压、电流、电阻的定量关系',
};

/**
 * 模板5：惠更斯-波动模式
 * 
 * 核心洞察：v = λf
 * 
 * 变量：
 * - 可控：波长 λ、频率 f
 * - 可测：波速 v、相位
 * 
 * 交互：
 * - 调节波长和频率
 * - 观察波的传播
 * - 叠加干涉图样
 */
export const huygensWaveTemplate = {
  id: 'huygens-wave',
  name: '惠更斯-波动',
  concept: 'v = λf',
  origin: '惠更斯波动说 (1678)',
  
  variables: {
    input: [
      { key: 'lambda', name: '波长', unit: 'm', range: [0.1, 10], default: 2 },
      { key: 'f', name: '频率', unit: 'Hz', range: [0.5, 5], default: 1 },
    ],
    output: [
      { key: 'v', name: '波速', unit: 'm/s' },
      { key: 'phase', name: '相位', unit: 'rad' },
    ],
  },
  
  equations: {
    primary: ['v = λf', 'ω = 2πf', 'y = A×sin(ωt - kx)'],
    derived: ['干涉条件：Δ = mλ'],
  },
  
  visualization: {
    canvas: ['波源', '传播的波', '干涉图样', '频谱'],
    style: '蓝绿渐变 + 动态波纹',
  },
  
  interactions: ['调节波长', '调节频率', '观察干涉'],
  
  historicalNote: '惠更斯提出：波前上的每一点都是新的波源',
};

/**
 * 模板6：阿基米德-浮力模式
 * 
 * 核心洞察：F = ρgV
 * 
 * 变量：
 * - 可控：液体密度 ρ、物体体积 V
 * - 可测：浮力 F、浸没深度
 * 
 * 交互：
 * - 放入不同物体
 * - 改变液体类型
 * - 观察浮沉状态
 */
export const archimedesBuoyancyTemplate = {
  id: 'archimedes-buoyancy',
  name: '阿基米德-浮力',
  concept: 'F = ρgV',
  origin: '阿基米德浮力实验 (公元前250)',
  
  variables: {
    input: [
      { key: 'rho', name: '液体密度', unit: 'kg/m³', range: [500, 2000], default: 1000 },
      { key: 'V', name: '物体体积', unit: 'cm³', range: [10, 100], default: 50 },
      { key: 'm', name: '物体质量', unit: 'g', range: [10, 200], default: 80 },
    ],
    output: [
      { key: 'F', name: '浮力', unit: 'N' },
      { key: 'depth', name: '浸没深度', unit: 'cm' },
      { key: 'state', name: '状态', unit: '' },
    ],
  },
  
  equations: {
    primary: ['F = ρgV', 'G = mg', '状态：漂浮/悬浮/下沉'],
    derived: ['排水量 = 浮力'],
  },
  
  visualization: {
    canvas: ['容器', '液体', '物体', '浮力箭头'],
    style: '水蓝色 + 透明效果',
  },
  
  interactions: ['放入物体', '改变液体', '观察浮沉'],
  
  historicalNote: '阿基米德洗澡时发现浮力原理，喊出"Eureka"',
};

// ============================================================================
// 第三部分：生成引擎
// ============================================================================

/**
 * 历史模板库
 */
export const historicalTemplates = [
  galileoFreeFallTemplate,
  newtonGravityTemplate,
  faradayInductionTemplate,
  ohmCircuitTemplate,
  huygensWaveTemplate,
  archimedesBuoyancyTemplate,
];

/**
 * 概念到模板的匹配
 */
export function matchTemplate(concept: string): typeof historicalTemplates[0] | null {
  const lowerConcept = concept.toLowerCase();
  
  const patterns: Record<string, number> = {
    '自由落体': 0, '落体': 0, '下落': 0, 'g': 0,
    '万有引力': 1, '引力': 1, '卫星': 1, '行星': 1, '轨道': 1,
    '电磁感应': 2, '法拉第': 2, '感应': 2, '磁铁': 2,
    '欧姆': 3, '电路': 3, '电阻': 3, '电流': 3, '电压': 3,
    '波': 4, '波动': 4, '干涉': 4, '波长': 4, '频率': 4,
    '浮力': 5, '阿基米德': 5, '漂浮': 5, '浸没': 5,
  };
  
  for (const [keyword, index] of Object.entries(patterns)) {
    if (lowerConcept.includes(keyword)) {
      return historicalTemplates[index];
    }
  }
  
  return null;
}

/**
 * 从模板生成实验配置
 */
export function generateFromTemplate(
  template: typeof historicalTemplates[0],
  customParams?: Partial<typeof historicalTemplates[0]['variables']>
): ExperimentConfig {
  const inputParams = customParams?.input || template.variables.input;
  const outputParams = customParams?.output || template.variables.output;
  
  return {
    id: template.id,
    title: template.name,
    description: `基于${template.origin}的可视化实验`,
    theory: template.historicalNote,
    formula: template.concept,
    formulaExplanation: template.equations.primary.join(' | '),
    params: [
      ...inputParams.map((p) => {
        const range = p.range as number[];
        return {
          key: p.key,
          name: p.name,
          unit: p.unit,
          min: range?.[0] ?? 0,
          max: range?.[1] ?? 100,
          default: p.default ?? range?.[0] ?? 0,
          step: 0.1,
          description: `${p.name}参数`,
        };
      }),
    ],
    statusItems: outputParams.map((p) => ({
      label: p.name,
      value: 0,
      unit: p.unit,
      color: '#FF8C00',
    })),
    tips: [
      { icon: 'info' as const, text: `核心公式: ${template.concept}` },
      { icon: 'info' as const, text: template.historicalNote },
    ],
    examples: template.interactions.map((i) => ({
      title: i,
      desc: `体验${i}`,
    })),
  };
}

/**
 * 通用生成函数
 */
export function generateExperiment(concept: string): ExperimentConfig | null {
  // 1. 尝试匹配历史模板
  const template = matchTemplate(concept);
  if (template) {
    return generateFromTemplate(template);
  }
  
  // 2. 默认返回通用配置
  return null;
}

// ============================================================================
// 第四部分：质量检验清单
// ============================================================================

/**
 * 实验质量检验（基于历史实验的成功要素）
 */
export const qualityChecklist = {
  /**
   * 伽利略标准：变量是否分离？
   */
  galileoCheck: {
    name: '伽利略标准',
    description: '是否抓住最关键的少数变量？',
    checklist: [
      '可调参数 ≤ 3 个',
      '每个参数有明确的物理意义',
      '参数之间相互独立',
    ],
  },
  
  /**
   * 欧姆标准：是否可控？
   */
  ohmCheck: {
    name: '欧姆标准',
    description: '用户是否能精确控制参数？',
    checklist: [
      '每个参数有 min/max/default',
      '参数变化是平滑的',
      '有滑块或拖拽交互',
    ],
  },
  
  /**
   * 伽利略标准：是否可观测？
   */
  observabilityCheck: {
    name: '观测标准',
    description: '结果是否清晰可见？',
    checklist: [
      '有实时数据展示',
      '有动画反馈',
      '有图表辅助',
    ],
  },
  
  /**
   * 牛顿标准：因果链是否清晰？
   */
  causalityCheck: {
    name: '因果标准',
    description: '因果关系是否清晰？',
    checklist: [
      '参数 → 计算 → 显示',
      '响应时间 < 16ms',
      '状态更新顺序清晰',
    ],
  },
  
  /**
   * 历史标准：是否有历史渊源？
   */
  historicalCheck: {
    name: '历史标准',
    description: '是否与经典实验关联？',
    checklist: [
      '有历史背景介绍',
      '有公式溯源',
      '有趣味性',
    ],
  },
};

/**
 * 检验函数
 */
export function validateExperimentQuality(config: ExperimentConfig): {
  score: number;
  passed: string[];
  failed: string[];
} {
  const passed: string[] = [];
  const failed: string[] = [];
  
  // 伽利略标准
  if (config.params.length <= 3) {
    passed.push('✓ 参数数量合理');
  } else {
    failed.push('✗ 参数过多，建议 ≤ 3');
  }
  
  // 欧姆标准
  const hasRange = config.params.every(
    (p) => p.min !== undefined && p.max !== undefined
  );
  if (hasRange) {
    passed.push('✓ 参数范围完整');
  } else {
    failed.push('✗ 参数缺少范围定义');
  }
  
  // 观测标准
  if (config.statusItems && config.statusItems.length > 0) {
    passed.push('✓ 有实时数据显示');
  } else {
    failed.push('✗ 缺少状态显示');
  }
  
  // 公式标准
  if (config.formula) {
    passed.push('✓ 有核心公式');
  } else {
    failed.push('✗ 缺少公式');
  }
  
  // 历史标准
  if (config.theory) {
    passed.push('✓ 有原理说明');
  } else {
    failed.push('✗ 缺少原理说明');
  }
  
  const score = Math.round((passed.length / (passed.length + failed.length)) * 100);
  
  return { score, passed, failed };
}
