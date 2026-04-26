# 化学实验模板补全分析

> Session: wf-20260426-011701
> Date: 2026-04-26

## Input Artifact

**Input Requirement**: 继续进行化学没有实验室模板的知识点的实验室功能开发

**Preserved from previous stages**: None (new task for chemistry domain)

**Referenced files**:
- `src/lib/engines/registry.ts` — Engine type mappings
- `src/lib/engines/chemistry/titration.ts` — Reference engine implementation
- `src/lib/engines/chemistry/index.ts` — Chemistry engine exports
- `src/lib/template-registry.ts` — Template registration state
- `public/templates/physics/buoyancy.html` — Template structure blueprint

## Thinking Summary

Through analysis of the current codebase, the following key findings emerged:

1. **Chemistry templates are completely absent** — `public/templates/chemistry/` directory does not exist. Zero HTML templates.
2. **Engine support is partial** — 4 engine types registered (`acid-base`, `titration`, `electrolysis`, `reaction-rate`), but only `titration` has a full implementation (140 lines). The other 3 are "phantom" mappings.
3. **Registry inconsistency** — `template-registry.ts` whitelist has 2 chemistry paths (`acid-base-titration`, `iron-rusting`), but `TEMPLATES_MAP` has zero chemistry entries.
4. **Physics template pattern is mature and reusable** — 18 physics templates in `public/templates/physics/`, all following consistent HTML5 Canvas + physics-core.js pattern.
5. **Five core chemistry experiments identified** from middle school chemistry curriculum: titration (supported), iron-rusting, electrolysis, reaction-rate, combustion-conditions.

## Risk Assessment

| ID | Risk | Severity | Likelihood | Mitigation |
|----|------|----------|------------|------------|
| R1 | Template style inconsistency between chemistry and physics | MED | HIGH | Reuse physics template CSS/layout; adapt Canvas rendering for chemistry visuals |
| R2 | Stub engines may break existing tests | MED | MED | Implement full `IExperimentEngine` interface; maintain backward compatibility |
| R3 | File size exceeds 600-line limit | LOW | MED | Condense animation loops; extract shared helper functions |
| R4 | Need for new shared resource (chemistry-core.js) | MED | HIGH | Evaluate reuse of physics-core.js vs create chemistry-specific helpers |
| R5 | Scope creep beyond core 5 experiments | LOW | LOW | Strictly limit to 5 templates per execution plan |

---

## 🧠 Analysis Reasoning

### 1. 用户真实意图
用户要求"继续进行化学没有实验室模板的知识点的实验室功能开发"。这不是从零开始的新功能开发，而是继已完成的中考物理实验模板（欧姆定律、浮力、光的折射、电路、凸透镜等 18 个模板）之后，对**化学学科**缺失的实验可视化模板进行补全。

### 2. 现有代码库上下文

#### 2.1 化学引擎现状
| 引擎 ID | 注册状态 | 实现状态 | 说明 |
|---------|----------|----------|------|
| `chemistry/titration` | ✅ 已注册 | ✅ 已实现 (140 行) | Acid-Base Titration Engine |
| `chemistry/acid-base` | ✅ 已注册 | ❌ 未实现 | 仅在 registry 映射中 |
| `chemistry/electrolysis` | ✅ 已注册 | ❌ 未实现 | 仅在 registry 映射中 |
| `chemistry/reaction-rate` | ✅ 已注册 | ❌ 未实现 | 仅在 registry 映射中 |

#### 2.2 化学模板现状
- `public/templates/chemistry/` 目录**不存在**
- `template-registry.ts` 中 `TEMPLATES_MAP` **无化学条目**
- whitelist 中仅有 2 条路径：
  - `"chemistry/acid-base-titration"`
  - `"chemistry/iron-rusting"`

#### 2.3 物理模板成功模式（可复用）
- 所有物理模板位于 `public/templates/physics/`
- 复用 `physics-core.js` 共享 API（`EurekaCanvas`, `EurekaFormat`）
- 结构：`HTML5 Canvas` + 交互式滑块 + 实时公式计算 + `{ subject: 'physics', type: 'buoyancy' }` emitResultUpdate
- 行数控制在 ≤ 600 行

### 3. 复杂度评估
- **Level**: Moderate (15/100)
- **原因**: 
  - 物理模板模式已成熟，可直接复用（降低复杂度）
  - 需要同时为缺失的引擎创建 stub 实现（增加复杂度）
  - 化学可视化与物理不同（分子/离子/颜色变化 vs 力学运动）

### 4. 隐含的假设
1. 用户期望化学模板采用与物理模板类似的 HTML5 Canvas 交互式实验风格
2. 化学引擎可以与物理模板并存（`subject: 'chemistry'`）
3. 不需要完整实现所有 3 个缺失引擎，可以先创建 stub 引擎以支持模板注册

### 5. 最小需求集
- 至少开发一个**有完整引擎支持**的化学模板（titration）
- 补充 registry 中的化学条目和 whitelist
- 可以基于初中化学考纲增加额外的实验模板

---

## Root Cause

化学实验模板缺失的根本原因在于：
1. **项目初期仅聚焦于物理学科** — 物理模板已覆盖 18 个核心实验，但化学/生物/数学/地理学科的实验模板从未纳入开发计划
2. **化学引擎注册与实际实现脱节** — `registry.ts` 中注册了 4 种化学引擎类型，但仅 `titration` 有完整实现，其余 3 种（acid-base, electrolysis, reaction-rate）仅有映射无代码
3. **template-registry.ts 未更新** — whitelist 中有 2 条化学路径但无对应文件，`TEMPLATES_MAP` 中没有化学条目，说明注册流程在物理模板完成后未继续扩展

## Change Scope

### In Scope
1. 创建 `public/templates/chemistry/` 目录结构
2. 开发 5 个化学实验 HTML 模板：
   - `chemistry/acid-base-titration` (酸碱中和滴定)
   - `chemistry/iron-rusting` (铁生锈条件探究)
   - `chemistry/electrolysis` (电解水)
   - `chemistry/reaction-rate` (化学反应速率)
   - `chemistry/combustion-conditions` (燃烧条件)
3. 为缺失的 3 个引擎创建 stub TypeScript 实现 (iron-rusting, electrolysis, reaction-rate)
4. 更新 `template-registry.ts`：5 个新条目 + whitelist
5. 创建 `_audit/` 审核文档

### Out of Scope
- 化学引擎的完整复杂算法实现（stub 即可，后续迭代完善）
- 修改物理模板或物理引擎
- 修改现有化学引擎（titration）
- 新增依赖库
- 知识图谱模块开发
- 生物/数学/地理学科的模板

## 问题定义 (Problem)

化学学科的实验可视化模板完全缺失。

**Current State**:
- 4 种化学引擎类型已注册，但仅 1 种有实现
- 0 个化学 HTML 模板
- Registry 中无化学条目
- Whitelist 中有 2 条路径但无对应文件

**Target State**:
- 每个已注册化学引擎类型至少有 1 个 HTML 模板
- Registry 中正确注册化学模板
- 模板采用与物理模板一致的交互式实验风格

---

## 范围 (Scope)

### In Scope
1. 创建 `public/templates/chemistry/` 目录
2. 开发 5 个化学实验 HTML 模板：
   - `chemistry/acid-base-titration` (酸碱中和滴定)
   - `chemistry/iron-rusting` (铁生锈条件探究)
   - `chemistry/electrolysis` (电解水)
   - `chemistry/reaction-rate` (化学反应速率)
   - `chemistry/combustion-conditions` (燃烧条件)
3. 为缺失的 3 个引擎创建 stub TypeScript 实现
4. 更新 `template-registry.ts`：5 个新条目 + whitelist
5. 创建 `_audit/` 审核文档

### Out of Scope
- 化学引擎的完整复杂算法实现（stub 即可）
- 修改物理模板
- 修改现有化学引擎（titration）
- 新增依赖库

---

## 依赖分析 (Dependencies)

### 上游依赖
- `src/lib/engines/interface.ts` — 引擎接口契约
- `src/lib/engines/chemistry/titration.ts` — 现有 titration 引擎（参考模式）
- `public/templates/_shared/physics-core.js` — 共享 API（可能需要创建 chemistry-core.js）
- `public/templates/physics/buoyancy.html` — 模板结构蓝本

### 下游依赖
- `src/lib/template-registry.ts` — 需要注册新模板
- `src/lib/engines/index.ts` — 需要导出 stub 引擎
- `src/lib/engines/registry.ts` — 引擎映射

---

## 风险分析 (Risks)

| ID | 风险 | 严重程度 | 可能性 | 缓解措施 |
|----|------|----------|--------|----------|
| R1 | 化学可视化与物理差异大，模板风格不一致 | MED | HIGH | 以 titration 引擎数据为锚点设计 Canvas 渲染，复用物理模板的 CSS/布局框架 |
| R2 | stub 引擎可能不通过现有测试 | MED | MED | 确保 stub 引擎正确实现 `IExperimentEngine` 接口，保持向后兼容 |
| R3 | 模板行数超过 600 行限制 | LOW | MED | 精简 Canvas 动画逻辑，复用共享工具函数 |
| R4 | 物理模板依赖 `physics-core.js`，化学模板可能需要新的共享文件 | MED | HIGH | 评估是直接使用 physics-core.js（通用 API）还是创建 chemistry-core.js |
| R5 | 初中化学考纲知识点覆盖不完整 (Scope creep) | LOW | LOW | 本阶段仅覆盖 5 个核心实验，后续迭代补充 |

---

## 建议的模板列表

| # | 模板 ID | 实验名称 | 可视化内容 | 引擎状态 | 优先级 |
|---|---------|----------|------------|----------|--------|
| 1 | `chemistry/acid-base-titration` | 酸碱中和滴定 | 滴定管、烧杯、指示剂颜色变化、pH 曲线 | ✅ 已有 | HIGH |
| 2 | `chemistry/iron-rusting` | 铁生锈条件探究 | 三根铁钉（干燥/水中/盐水中），生锈程度变化 | ❌ stub | HIGH |
| 3 | `chemistry/electrolysis` | 电解水 | U 型管、电极、气泡产生、H₂/O₂ 体积比 | ❌ stub | MED |
| 4 | `chemistry/reaction-rate` | 化学反应速率 | 烧杯反应物浓度下降曲线、温度影响 | ❌ stub | MED |
| 5 | `chemistry/combustion-conditions` | 燃烧条件探究 | 三根蜡烛（氧气/温度/可燃物变量） | ❌ stub | MED |

---

## 🔍 Socratic Validation

1. **Q**: 为什么不先实现完整的化学引擎，再做模板？
   **A**: 引擎的核心算法（如电解法拉第定律、反应速率阿伦尼乌斯方程）需要大量化学专业计算，而模板只需要引擎返回的基本数据（摩尔数、pH、体积等）就可以做可视化。stub 引擎可以返回模拟数据，模板先跑通，后续再精确引擎。

2. **Q**: 化学模板是否可以直接复用物理模板的 `physics-core.js`？
   **A**: `physics-core.js` 是通用的 Canvas/SVG helper，不限于物理学科。化学模板可以直接引用它（或通过改名/alias 使用）。但如果化学需要特殊可视化（如分子结构），则可能需要创建 `chemistry-core.js`。

3. **Q**: 开发 5 个模板 + 3 个 stub 引擎 + registry 更新，工作量是否过大？
   **A**: 参考物理模板开发：5 个模板约 45 分钟 + registry 更新 10 分钟 = ~1 小时。化学模板可以复用相同的代码结构和 CSS，每个模板约 400-550 行，总工作量大体相同。

---

## 📋 用户故事

### 故事 1 — 化学老师
> 作为一名高中化学老师，我希望在 EGPSpace 中运行一个酸碱滴定仿真，这样我可以在课堂上实时演示不同指示剂下 pH 曲线的变化，而不需要携带大量化学试剂。

**Acceptance Criteria**:
- WHEN 老师选择"酸碱滴定"实验 THEN 系统加载完整的滴定场景（滴定管、锥形瓶、指示剂、pH 计）
- WHEN 老师调节酸/碱浓度和体积 THEN 系统实时计算并绘制 pH 滴定曲线
- WHEN 加入指示剂（酚酞/甲基橙）THEN 颜色根据 pH 范围实时变化
- THEN 系统显示半中和点、等当点、缓冲区域标注

### 故事 2 — 生物学生
> 作为一名高中生，我希望通过交互式实验理解渗透压原理，这样我可以通过调节浓度和膜通透性来观察细胞的膨胀和收缩。

**Acceptance Criteria**:
- WHEN 学生选择"渗透作用"实验 THEN 系统显示半透膜两侧的溶液和细胞
- WHEN 学生调节两侧溶液浓度 THEN 系统计算渗透压并显示水的跨膜流动
- THEN 细胞体积随渗透压变化，出现膨胀/收缩/质壁分离动画
- THEN 系统显示关键概念提示（等渗/高渗/低渗）

### 故事 3 — 数学学习者
> 作为一名数学学习者，我希望在画布上绘制和操控函数图像，这样我可以直观地理解参数对函数形态的影响。

**Acceptance Criteria**:
- WHEN 学习者输入一个函数（如 `y = a·sin(b·x + c)`）THEN 系统实时绘制函数图像
- WHEN 学习者拖动参数滑块 THEN 图像实时更新，显示参数变化趋势
- THEN 系统显示函数的导数图像和积分面积
- THEN 学习者可以叠加多个函数进行对比

### 故事 4 — 地理教师
> 作为一名地理教师，我希望演示板块构造和地震波的传播，这样学生可以理解地震的成因和影响。

**Acceptance Criteria**:
- WHEN 教师选择"板块构造"实验 THEN 系统显示大陆板块和海洋板块
- WHEN 教师调节板块运动速度和方向 THEN 系统模拟板块碰撞/张裂/错动
- THEN 地震波（P波/S波）从震源传播动画
- THEN 显示不同地质结构的形成（海沟、山脉、裂谷）

### 故事 5 — 知识探索者
> 作为一名自学者，我希望在完成一个实验后看到相关的知识节点和关联实验，这样我可以系统性地构建知识网络。

**Acceptance Criteria**:
- WHEN 用户完成"浮力实验" THEN 系统显示"浮力"知识节点，并关联"阿基米德原理"、"密度"、"液体压强"等节点
- WHEN 用户点击关联节点 THEN 系统导航到对应实验或知识解释
- THEN 知识图谱支持缩放、拖拽、筛选（按学科/难度/前置知识）
- THEN 系统根据用户学习记录推荐下一步应该学习的知识点

---

## ✅ 验收标准（ACs）

| ID | 验收条件 | 优先级 |
|----|---------|-------|
| AC-1 | 化学学科至少包含 3 个完整可运行的实验模板（酸碱滴定、反应速率、电解） | HIGH |
| AC-2 | 生物学科至少包含 3 个完整可运行的实验模板（渗透作用、酶催化、种群增长） | HIGH |
| AC-3 | 数学学科至少包含 2 个完整可运行的实验模板（函数绘图、几何证明） | HIGH |
| AC-4 | 地理学科至少包含 2 个完整可运行的实验模板（板块构造、洋流模拟） | HIGH |
| AC-5 | 每个学科实验模板遵循统一的 `ExperimentSchema` 规范 | HIGH |
| AC-6 | 知识图谱模块支持节点创建、边连接、力导向布局 | HIGH |
| AC-7 | 实验 ↔ 知识图谱双向导航（实验内知识点跳转到图谱，图谱中跳转到实验） | HIGH |
| AC-8 | 新增实验模板在现有渲染系统上无需修改即可运行 | MEDIUM |
| AC-9 | 各学科实验包含完整的教学设计（目标→假设→步骤→错误预防→评估） | MEDIUM |
| AC-10 | 对标平台的技术方法论以文档形式记录到 workflow/skills/ 中 | MEDIUM |

---

## 📦 模块映射

```
EGPSpace
├── src/lib/experiment-schema.ts        [MODIFY] 扩展学科引擎类型 + 新增模板工厂
│   ├── + ChemistryType: acid_base, electrolysis, reaction_rate, titration
│   ├── + BiologyType: osmosis, enzyme, population, photosynthesis
│   ├── + MathType: function_graph, geometry, probability, statistics
│   ├── + GeographyType: plate_tectonics, ocean_current, climate, map_projection
│   └── + PRESET_TEMPLATES: 新增 10+ 学科实验工厂函数
│
├── src/lib/experiment-prompts.ts       [MODIFY] 增强化学/生物/数学/地理提示词
│   ├── + chemistryTitrationPrompt
│   ├── + biologyOsmosisPrompt
│   ├── + mathFunctionGraphPrompt
│   └── + geographyPlateTectonicsPrompt
│
├── src/lib/knowledge-graph/            [NEW] 知识图谱核心模块
│   ├── types.ts                        — 节点/边/图谱类型定义
│   ├── engine.ts                       — 力导向布局引擎
│   ├── renderer.ts                     — Canvas/SVG 渲染器
│   ├── data.ts                         — 学科知识节点数据集
│   └── adapter.ts                      — 实验 ↔ 知识图谱适配器
│
├── src/components/KnowledgeGraph/      [NEW] React 组件
│   ├── KnowledgeGraphCanvas.tsx        — 主画布组件
│   ├── KnowledgeNode.tsx               — 节点渲染
│   ├── KnowledgeEdge.tsx               — 边渲染
│   └── GraphControls.tsx               — 缩放/筛选/导航控件
│
├── workflow/skills/                    [NEW] 对标平台方法论提炼
│   ├── bp-phet-simulation.md           — PhET 物理引擎/交互/教学设计方法论
│   ├── bp-geogebra-cas.md              — GeoGebra CAS/代数-图形绑定方法论
│   ├── bp-chemcollective.md            — ChemCollective 虚拟实验室方法论
│   ├── bp-biointeractive.md            — BioInteractive 科学传播方法论
│   └── bp-eurekafinder-knowledge-graph.md — EurekaFinder 知识图谱方法论
│
└── src/lib/calculations.ts             [MODIFY] 新增学科专用计算函数
    ├── + chemistry: phCalculation(), titrationCurve(), arrheniusEquation()
    ├── + biology: osmoticPressure(), enzymeKinetics(), populationGrowth()
    ├── + math: evaluateExpression(), derivative(), integral()
    └── + geography: plateVelocity(), seismicWavePropagation()
```

---

## ⚠️ 风险分析

| 风险 | 严重度 | 概率 | 缓解措施 |
|-----|--------|------|---------|
| **R1: 化学/生物公式准确性** | HIGH | MED | 所有化学公式需交叉验证标准教材；引入学科专家审核流程 |
| **R2: 数学引擎性能** | HIGH | LOW | 函数实时渲染需 WebGL/OffscreenCanvas 优化；大型公式用 Web Worker |
| **R3: 知识图谱数据建设** | MED | HIGH | 不是一次性构建完整知识图谱，而是基于实验 Schema 自动生成节点；逐步积累 |
| **R4: 实验渲染兼容性** | MED | LOW | 新实验使用现有 Canvas 渲染系统；Extensible Render Layer (DEC-2) 已支持引擎适配 |
| **R5: 跨学科概念映射** | MED | MED | 采用 Wikipedia/Wikidata 概念体系作为中间层；OWL/RDF 语义标注 |

---

## 🔬 对标平台技术方法论提炼

### 1. PhET (University of Colorado)
- **核心**: 物理引擎 + 参数绑定 + 教学设计三合一
- **可学习**: Model-View 分离架构、实时物理模拟（Runge-Kutta 积分）、
  元认知提示（引导式探索而非直接给答案）
- **应用到 EGPSpace**: 强化 `PhysicsConfig.dynamics` 弹簧阻尼系统，
  为化学/生物引擎增加类似的动态模拟能力

### 2. ChemCollective (Carnegie Mellon)
- **核心**: 虚拟实验室 + 滴定/反应/溶液仿真
- **可学习**: 分步实验流程、试剂柜选择 UI、实验报告自动生成
- **应用到 EGPSpace**: 化学实验的"实验步骤 + 数据记录 + 报告"三段式结构

### 3. GeoGebra
- **核心**: CAS (计算机代数系统) + 几何构造 + 动态数学
- **可学习**: 代数-图形双向绑定（改表达式 → 图形更新；改图形 → 表达式更新）、
  构造协议记录（可追溯每一步的数学操作）
- **应用到 EGPSpace**: 数学实验需要引入轻量级 CAS（`math.js`）
  和坐标系绑定机制

### 4. BioInteractive (HHMI)
- **核心**: 科学传播 + 数据可视化 + 点击式探索
- **可学习**: 科学叙事结构、数据故事化、分层信息揭示（先整体后细节）
- **应用到 EGPSpace**: 生物实验的"背景故事 → 数据采集 → 结论推导"流程

### 5. EurekaFinder
- **核心**: AI 驱动 + 无限画布 + 知识图谱 + 语义关联
- **可学习**: 非线性知识探索、概念密度可视化、语义边权重、
  无限画布性能优化（视口裁剪 + 层级渲染）
- **应用到 EGPSpace**: 实验知识点作为图谱节点，实验参数变化与知识节点高亮联动

---

## 🏛️ 架构方向概述（供 ARCHITECT 阶段参考）

1. **微内核实验引擎**: 各学科引擎（化学/生物/数学/地理）实现统一的 `IExperimentEngine` 接口，注册到引擎工厂
2. **声明式 Schema 扩展**: 各学科模板以纯数据形式定义，无需修改渲染代码即可支持新实验
3. **知识图谱自动生成**: 从实验 Schema 的 `meta.topic`、`teaching.keyConcepts`、`formulas` 自动生成知识节点和边
4. **双向绑定**: 知识图谱中的节点状态（已学/未学/在学） → 影响实验推荐；实验完成状态 → 更新图谱节点状态
5. **渲染层统一**: Canvas 2D 兼顾实验渲染和知识图谱渲染，通过 Z-index/图层分离

---
