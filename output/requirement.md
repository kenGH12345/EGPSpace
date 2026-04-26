# EurekaSpace — 化学实验迁移到统一声明式框架 (方案 A)

## 🧠 分析推理

### 1. 用户的真实意图
用户选择"方案 A"，核心是将化学实验迁移到与物理实验**统一的声明式框架**。这不仅仅是在 page.tsx 中增加4个实验组件，而是一次**架构级别**的重构，建立一个可扩展的化学实验系统。

### 2. 现有代码库核心发现
项目采用**Triple-Lock 架构**（路由映射→白名单检查→渲染分发），存在两套并行的实验系统：
- **物理实验（新系统）**：`ExperimentSchema` + 物理引擎 + 统一 Canvas 渲染 —— 成熟
- **化学实验（旧系统）**：硬编码 React 组件 + 独立计算函数 —— 逐步废弃

### 3. 复杂度评估: 复杂 (High)
本次任务涉及 Schema 定义、Canvas 渲染扩展、路由映射扩展和白名单注册，共7+文件修改。

### 4. 关键设计决策（前置约束）
- 化学实验的 `physicsType` 语义需要扩展（建议在内部用 `experimentType` 概念但保持接口兼容）
- Canvas 渲染采用**预设模板**模式，化学实验使用独立的 `buildXxxElements` 函数
- 所有化学实验向后兼容 `ExperimentConfig` 接口（通过 `experimentSchemaToLegacy` 转换）

### 5. 最小需求集
实现 4 个化学实验的完整 Schema 定义，并确保统一渲染和路由分发。

---

## 📋 用户故事

### US-1: 酸碱滴定可视化
- **角色**: 高中化学学生
- **目标**: 通过交互式酸碱滴定实验理解 pH 曲线变化和指示剂变色原理
- **收益**: 可调节酸浓度、碱体积等参数，观察 pH 值随滴加体积变化的实时曲线

### US-2: 电解水实验
- **角色**: 化学学习者
- **目标**: 观察电解水过程中氢气和氧气的产生比例
- **收益**: 调节电压和电解质浓度，实时观察气体体积变化，验证 2H₂O → 2H₂↑ + O₂↑

### US-3: 化学反应速率探究
- **角色**: 化学实验爱好者
- **目标**: 探究温度、浓度、催化剂对反应速率的影响
- **收益**: 调节温度、反应物浓度、催化剂使用，观察反应速率的变化规律

### US-4: 燃烧条件探究
- **角色**: 安全教育和化学学习者
- **目标**: 通过控制变量法验证燃烧的三个条件
- **收益**: 调节温度、氧气浓度和燃料类型，观察哪些条件下发生燃烧

### US-5: 统一的实验管理（架构需求）
- **角色**: 开发者/维护者
- **目标**: 所有实验使用一致的配置模式，便于后续扩展
- **收益**: 新增实验只需修改声明式配置，无需写重复渲染代码

---

## ✅ 验收标准

### AC-1: 酸碱滴定实验 Schema 定义完整
**WHEN** 用户访问 `/experiments/acid-base-titration`  
**THEN** 可以看到交互式滴定装置（滴定管 + 锥形瓶）和 pH 曲线  
**IF** 用户调节碱浓度参数，**THEN** pH 曲线实时更新

### AC-2: 电解水实验可视化正确
**WHEN** 用户访问 `/experiments/electrolysis`  
**THEN** 可以看到电解槽和阴极/阳极的气泡动画  
**IF** 电压增大，**THEN** 气泡产生速率加快

### AC-3: 反应速率实验交互可用
**WHEN** 用户访问 `/experiments/reaction-rate`  
**THEN** 可以看到模拟分子碰撞动画和速率曲线  
**IF** 温度升高，**THEN** 反应速率数值增大，分子运动更剧烈

### AC-4: 燃烧条件实验状态可视化
**WHEN** 用户访问 `/experiments/combustion-conditions`  
**THEN** 可以看到三个对照条件区域（可燃物、助燃物、温度）  
**IF** 三个条件同时满足，**THEN** 显示燃烧动画和火焰效果

### AC-5: 所有化学实验使用统一 ExperimentSchema 格式
**WHEN** 开发者查看 `experiment-schema.ts`  
**THEN** 新增化学实验 Schema 与物理实验在结构和风格上完全一致  
**IF** 添加新的化学实验，**THEN** 只需添加配置，无需修改渲染组件

### AC-6: 路由和白名单正确配置
**WHEN** 用户在首页点击化学实验卡片  
**THEN** 正确跳转到对应的实验页面  
**IF** 实验 ID 不在白名单中，**THEN** 降级为文本模式或显示错误信息

### AC-7: 首页 presetExperimentIds 包含新化学实验
**WHEN** 用户查看首页化学实验列表  
**THEN** 酸碱滴定、电解水、反应速率、燃烧条件实验均可点击进入  
**IF** 点击实验卡片，**THEN** 路由到 `/experiments/{id}`

---

## 🗺️ 模块映射

```
src/lib/
├── experiment-schema.ts          [MODIFY] 添加 4 个化学实验 createXxxExperiment()
├── preset-templates.ts           [MODIFY] 扩展 PresetTemplateType + buildPresetElements()
├── schema-enricher.ts            [MODIFY] TEMPLATES 注册新增化学实验
├── template-registry.ts          [MODIFY] addApprovedTemplate() 注册化学实验
├── concept-to-template.ts        [MODIFY] CONCEPT_MAPPINGS 添加化学实验关键词
├── experiments.ts                [MODIFY] presetExperimentSchemas 添加新 Schema
└── additional-experiments.ts     [参考] 现有化学实验 placeholder

src/app/
├── page.tsx                      [MODIFY] presetExperimentIds 添加 4 个新 ID
└── experiments/[id]/page.tsx     [READ] 确认路由分发逻辑兼容

src/components/
├── experiment-canvas.tsx         [MODIFY] generateElements() 添加化学实验 case
├── DynamicExperiment.tsx         [READ] 确认 schema→legacy 转换可用
└── experiment-layout.tsx         [READ] 确认 shell 兼容
```

---

## ⚠️ 风险分析

| 风险 | 严重程度 | 描述 | 缓解策略 |
|------|----------|------|----------|
| **R1: 物理/化学方程引擎语义不兼容** | 高 | `physicsType` 字段命名偏向物理，`GenericEngine` 无化学计量学特殊处理 | 本次使用通用公式引擎 + computed params，后续可扩展 ChemistryEngine |
| **R2: Canvas 元素类型不足** | 中 | 化学实验需要复杂图形，现有 CanvasElement 类型可能需扩展 | 组合基础类型绘制，必要时扩展 type 联合类型 |
| **R3: 向后兼容性** | 中 | 修改接口可能影响现有物理实验 | 严格遵循开闭原则，不修改已有签名 |
| **R4: 文件大小膨胀** | 低 | `preset-templates.ts` 需添加数百行绘制代码 | 独立绘制函数，模块化组织 |

---

## 思考摘要

1. **根因**: 第一批验证了架构但不具备规模复制能力，因为共享基础设施是物理专用的
2. **关键决策**: Batch 2 的核心是"基础设施抽象"而非"模板数量冲刺"——把 `physics-core.js` 拆分为通用层+物理专用层
3. **范围边界**: 本批次仅限物理学科内的第二批4个实验 + 跨学科基础设施抽象，**不真正新增化学/生物模板**（它们需要等待Batch 3的学科专用utils）
4. **向后兼容**: 这是硬性约束——已生产的4个模板在基础设施变更后必须零改动继续工作