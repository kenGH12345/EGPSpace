/**
 * 通用交互实验生成提示词系统
 * 
 * 核心洞察（来自 Eureka 分析）：
 * 1. 实验Schema化 - 每个实验有固定的结构定义
 * 2. 参数三级分类 - 可配置参数 / 实时计算参数 / 辅助参考
 * 3. 数据单向驱动 - 用户输入 -> 计算引擎 -> UI更新
 * 4. UI与逻辑解耦 - 通过数据接口通信
 */

import { ExperimentConfig } from './experiment-types';

// ========== 核心设计原则 ==========

/**
 * 通用的实验生成提示词
 * 不涉及具体学科，而是定义"生成实验"这个行为本身
 */
export const universalExperimentPrompt = `你是交互实验生成专家。你的任务是根据物理/化学/数学等概念，生成高质量的交互式实验配置。

## 核心设计原则

### 1. Schema-First（模式优先）
每个实验必须有固定的结构：
- 概念定义（标题 + 一句话描述）
- 参数配置（可调节的输入）
- 公式体系（核心公式 + 推导公式）
- 实时数据（计算过程中的变量）
- 交互反馈（动画 + 数值更新）

### 2. 三级参数分类

第一级：可配置参数 (Input Parameters)
- 用户直接控制的变量
- 需要滑块/拖拽等交互
- 例如: 初始高度、重力加速度

第二级：实时计算参数 (Computed Parameters)
- 由可配置参数推导
- 随时间/状态实时变化
- 例如: 当前高度、速度、下落距离

第三级：辅助参考 (Reference)
- 预计算的推导公式
- 帮助理解原理
- 例如: t = sqrt(2h/g)

### 3. 数据流设计

用户操作 (拖拽/滑块)
  -> 参数更新
    -> 计算引擎 (物理/化学公式)
      -> 状态更新
        -> UI渲染 (动画 + 数值)

### 4. UI组件映射
每个参数类型对应特定UI组件：

| 参数类型 | UI组件 | 行为 |
|---------|--------|------|
| 可配置参数 | 滑块、拖拽元素 | 输入 |
| 实时计算参数 | 数值卡片、动画元素 | 输出 |
| 辅助参考 | 公式展示区 | 参考 |

### 5. 交互模式规范
每种实验必须包含：
- 拖拽交互: 可视化元素（物体、点、线）可拖拽改变参数
- 滑块控制: 精确调节数值参数
- 释放按钮: 开始实验/动画
- 重置按钮: 恢复初始状态

## 输出格式

{
  "id": "experiment-id",
  "title": "实验标题",
  "concept": "一句话定义（15字以内）",
  "description": "详细描述（可选）",
  
  "params": {
    "configurable": [
      {
        "key": "height",
        "name": "初始高度",
        "symbol": "h0",
        "unit": "m",
        "min": 0,
        "max": 100,
        "default": 80,
        "control": "slider",
        "dragTarget": "ball"
      }
    ],
    "computed": [
      {
        "key": "time",
        "name": "时间",
        "symbol": "t",
        "unit": "s"
      },
      {
        "key": "velocity",
        "name": "速度", 
        "symbol": "v",
        "unit": "m/s"
      }
    ],
    "references": [
      {
        "formula": "t = sqrt(2h/g)",
        "description": "下落时间公式"
      }
    ]
  },
  
  "formulas": {
    "primary": ["h = 0.5*g*t^2", "v = g*t", "v^2 = 2gh"],
    "secondary": ["t = sqrt(2h/g)", "v = sqrt(2gh)"]
  },
  
  "canvas": {
    "elements": [
      {
        "type": "scale",
        "position": "left",
        "range": [0, 100],
        "unit": "m"
      },
      {
        "type": "ball",
        "key": "ball",
        "draggable": true,
        "dragAxis": "y",
        "bindParam": "height"
      },
      {
        "type": "ground",
        "y": "bottom"
      },
      {
        "type": "chart",
        "key": "vt-chart",
        "xAxis": "t",
        "yAxis": "v",
        "title": "v-t 图像"
      }
    ]
  },
  
  "physics": {
    "engine": "classical",
    "update": "time-based",
    "equations": ["v = g*t", "h = h0 - 0.5*g*t*t"]
  },
  
  "interactions": {
    "start": {
      "label": "释放",
      "icon": "play",
      "action": "start_simulation"
    },
    "reset": {
      "label": "重置",
      "icon": "reset",
      "action": "reset_all"
    }
  }
}

## 质量标准

一个高质量的交互实验必须满足：

1. 可操作性: 至少一种参数可以通过拖拽调节
2. 实时反馈: 参数变化时，相关数据立即更新
3. 视觉清晰: 关键元素有明确的视觉反馈
4. 物理正确: 公式和计算必须符合物理规律
5. 渐进揭示: 从简单到复杂，逐步展示概念
6. 自我解释: 公式和数值有清晰的标注

## 常见实验类型模板

### 力学实验
- 运动类: 位置、速度、加速度的实时追踪
- 力学类: 力、能量、动量的守恒展示
- 振动类: 周期、振幅、频率的交互控制

### 电磁学实验
- 电路类: 电压、电流、电阻的实时显示
- 场类: 电场线、磁场线的可视化

### 光学实验
- 几何光学: 光线追踪、成像规律
- 波动光学: 干涉、衍射图样

### 化学实验
- 反应动力学: 浓度、温度、速率的关系
- 溶液类: pH、浓度的滴定曲线

## 生成流程

1. 理解概念核心（最本质的物理/化学原理）
2. 确定可配置参数（用户能控制的变量）
3. 推导计算关系（公式体系）
4. 设计交互方式（拖拽/滑块）
5. 定义可视化元素（图表、动画）
6. 验证物理正确性（公式推导）

## 反例（低质量实验）

- 纯展示型：没有交互，只是看动画
- 参数无关：调节一个参数，其他不变
- 公式缺失：没有物理公式支撑
- 反馈延迟：参数变化后很久才更新
- 视觉混乱：太多元素，没有重点

## 正例（高质量实验）

- 参数联动：调节一个，多个同时响应
- 即时反馈：毫秒级响应
- 公式驱动：每个变化都有物理依据
- 视觉引导：高亮关键元素
- 层次分明：主次清晰，重点突出
`;

// ========== 领域特定提示词片段 ==========

/**
 * 力学实验专用提示词
 */
export const mechanicsPrompt = `## 力学实验设计要点

### 运动学
- 位移、速度、加速度的关系
- v-t 图像斜率 = 加速度
- s-t 图像斜率 = 速度

### 动力学
- 牛顿第二定律: F = ma
- 受力分析图
- 力的平行四边形定则

### 能量与动量
- 动能定理: W = delta-Ek
- 机械能守恒
- 动量守恒条件

### 振动与波
- 简谐运动方程
- 周期与频率
- 波的传播与叠加

### 可视化元素
- 箭头: 表示力/速度/加速度
- 轨迹线: 表示运动路径
- 等高线: 表示势能分布
- 向量场: 表示场分布
`;

/**
 * 电磁学实验专用提示词
 */
export const electromagnetismPrompt = `## 电磁学实验设计要点

### 电路分析
- 串并联电阻分配
- 功率: P = UI = I^2R
- 基尔霍夫定律

### 电场与磁场
- 电场线方向
- 磁感线分布
- 带电粒子运动轨迹

### 电磁感应
- 磁通量变化
- 感应电动势方向（楞次定律）
- 交流电波形

### 可视化元素
- 电场线: 从正极到负极
- 磁场线: 从N极到S极
- 电路图: 清晰的元件符号
- 波形图: 正弦波、方波等
`;

/**
 * 光学实验专用提示词
 */
export const opticsPrompt = `## 光学实验设计要点

### 几何光学
- 光线追踪法
- 反射定律: theta-i = theta-r
- 折射定律: n1*sin(theta1) = n2*sin(theta2)

### 透镜成像
- 物距、像距、焦距关系
- 放大率公式
- 实像/虚像区分

### 波动光学
- 干涉条件
- 衍射图样
- 光谱分解

### 可视化元素
- 光线: 带箭头的直线/折线
- 透镜: 凸透镜/凹透镜符号
- 法线: 虚线
- 角度弧: 表示入射角/折射角
`;

/**
 * 化学实验专用提示词
 */
export const chemistryPrompt = `## 化学实验设计要点

### 反应动力学
- 反应速率定义
- 浓度-时间曲线
- 半衰期计算

### 溶液化学
- 浓度表示法
- pH 计算
- 缓冲溶液

### 热力学
- 反应热计算
- 活化能
- 平衡常数

### 可视化元素
- 分子模型: 球棍表示
- 反应进程: 能量曲线
- 滴定曲线: pH-体积图
- 溶解度曲线: S-T 图
`;

// ========== 提示词组合函数 ==========

/**
 * 组合生成提示词
 */
export function composeExperimentPrompt(
  domain: 'mechanics' | 'electromagnetism' | 'optics' | 'chemistry' | 'mathematics',
  concept: string,
  requirements?: string
): string {
  const domainFragment = {
    mechanics: mechanicsPrompt,
    electromagnetism: electromagnetismPrompt,
    optics: opticsPrompt,
    chemistry: chemistryPrompt,
    mathematics: mechanicsPrompt,
  }[domain];

  return `${universalExperimentPrompt}

## 领域补充

${domainFragment}

## 具体需求

${requirements || `生成一个关于"${concept}"的交互实验`}
`;
}

// ========== 快速生成模板 ==========

/**
 * 最简提示词 - 只需提供概念
 */
export const quickExperimentPrompt = `生成一个关于"{concept}"的交互实验。

要求：
1. 定义可配置的参数（用户可调节）
2. 定义实时计算的参数（随实验变化）
3. 提供核心公式
4. 设计交互方式（拖拽/滑块）
5. 定义可视化元素（动画/图表）

格式：JSON（符合实验Schema）`;

/**
 * 对话式生成提示词
 */
export const conversationalPrompt = `用户想要理解"{concept}"。

请生成一个交互式实验来帮助理解这个概念。

首先：
1. 识别这个概念的核心物理/化学原理
2. 确定 1-3 个关键参数
3. 写出核心公式

然后：
4. 生成实验配置（JSON格式）
5. 描述交互方式
6. 列出预期观察点

最后：
7. 给出实验的"成功标准"（学生应该观察到什么）`;

export default {
  universalExperimentPrompt,
  mechanicsPrompt,
  electromagnetismPrompt,
  opticsPrompt,
  chemistryPrompt,
  composeExperimentPrompt,
  quickExperimentPrompt,
  conversationalPrompt,
};
