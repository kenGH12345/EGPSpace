# 化学实验迁移架构设计 (Architecture Design)

## 🧠 架构推理

### 1. 核心质量属性

| 质量属性 | 优先级 | 说明 |
|----------|--------|------|
| **可维护性** | P0 | 新增实验只需声明式配置，零代码侵入 |
| **可扩展性** | P0 | 横向添加实验无需修改渲染引擎 |
| **向后兼容** | P0 | 现有物理实验100%不受影响 |
| **性能** | P1 | Canvas 渲染60fps，参数响应 < 16ms |
| **可测试性** | P1 | Schema 可静态验证，引擎逻辑独立测试 |

### 2. 硬约束

- **时间线**：单会话完成（用户等待）
- **团队规模**：单人开发
- **现有基础设施**：React + TypeScript + Canvas 2D，无 WebGL/Three.js
- **兼容性约束**：TypeScript 5.x，Next.js App Router

### 3. 最简单可行的架构

采用**扩展开闭原则（OCP）**：
- **不修改**`ExperimentSchema` 接口定义
- **不修改**已有渲染引擎（BuoyancyEngine/LeverEngine/...）
- **扩展**新的预设类型到 `PresetTemplateType`
- **扩展**新的模板工厂到 `schema-enricher.ts`
- **扩展**新的 Canvas 绘制分支到 `preset-templates.ts`

### 4. 可复用的现有模块

| 模块 | 复用方式 | 说明 |
|------|----------|------|
| `ExperimentSchema` 接口 | 直接使用 | 化学实验的数据模型与物理实验一致 |
| `GenericEngine` | 直接使用 | 通用公式解析引擎支持任何数学公式 |
| `generateSlidersFromParams` | 直接使用 | 自动从 input 参数生成滑块配置 |
| `generateComputedParamsFromFormulas` | 直接使用 | 自动从 formula 生成计算参数 |
| `ExperimentCanvas` 渲染管线 | 扩展 case | 新增化学实验的 `generateElements` 分支 |
| `experimentSchemaToLegacy` | 直接使用 | 新 Schema 转换为 `ExperimentConfig` |
| `ExperimentLayout` shell | 直接使用 | 侧边栏、公式卡片、理论 Tabs 完全复用 |

### 5. 前 3 技术风险及缓解

| 风险 | 缓解策略 |
|------|----------|
| **R1: physicsType 语义偏向物理** | 内部按 "experimentType" 理解兼容，保持接口字段名不变 |
| **R2: Canvas 元素类型不够表达化学图形** | 组合基础几何类型（rect/circle/line/text/arc）构建复杂实验装置 |
| **R3: Legacy Config 与 Schema 字段映射不全** | 使用 `additionalConfig` 注入化学实验特有字段，转换函数兜底 |

---

## 📐 组件设计

### 组件关系图

```mermaid
graph TD
    subgraph "Frontend Layer"
        A[Home Page<br/>page.tsx] -->|点击实验卡片| B{Experiment Router<br/>/experiments/[id]/page.tsx}
    end

    subgraph "Triple-Lock Routing"
        B -->|1. concept mapping| C[concept-to-template.ts]
        C -->|2. whitelist check| D[template-registry.ts]
        D -->|3. schema enrich| E[schema-enricher.ts]
    end

    subgraph "Schema Layer"
        E -->|fetch template| F[experiment-schema.ts<br/>createAcidBaseExperiment()<br/>createElectrolysisExperiment()<br/>createReactionRateExperiment()<br/>createCombustionExperiment()]
        F -->|export| G[experiments.ts<br/>presetExperimentSchemas]
    end

    subgraph "Legacy Bridge"
        G -->|convert| H[DynamicExperiment.tsx<br/>experimentSchemaToLegacy()]
        H -->|UniversalPhysicsRenderer| I[Legacy ExperimentConfig]
    end

    subgraph "Rendering Layer"
        I -->|route by id| J[experiment-canvas.tsx]
        J -->|preset template| K[preset-templates.ts<br/>buildAcidBaseElements<br/>buildElectrolysisElements<br/>buildReactionRateElements<br/>buildCombustionElements]
        K -->|Canvas 2D| L[Canvas Context]
    end

    subgraph "Shell Layer"
        I -->|render controls| M[experiment-layout.tsx<br/>侧边栏+公式+理论/提示/示例]
        M -->|useMediaPipeHands| N[Gesture Control]
    end
```

### 新增/修改组件详述

#### C1: `experiment-schema.ts` — 扩展化学实验工厂函数

**职责**：为每个化学实验提供完整的 `ExperimentSchema` 声明式定义。

**接口**：
```typescript
export function createAcidBaseTitrationExperiment(): ExperimentSchema;
export function createElectrolysisExperiment(): ExperimentSchema;
export function createReactionRateExperiment(): ExperimentSchema;
export function createCombustionExperiment(): ExperimentSchema;
```

**设计要点**：
- `meta.physicsType` 使用化学实验标识符（如 `'acid_base'`）
- `params` 定义完整的可调节参数（浓度、体积、温度等）
- `formulas` 定义化学方程和计算公式
- `canvas.presetTemplate` 指向对应的预设模板类型
- `physics.engine` 使用 `'generic'`（通用公式引擎）

#### C2: `preset-templates.ts` — 扩展化学实验预设渲染

**职责**：根据 experiment id 生成 Canvas 元素列表。

**扩展**：
```typescript
export type PresetTemplateType = 
  | 'buoyancy' | 'lever' | 'refraction' | 'circuit'
  | 'acid-base-titration' | 'electrolysis' | 'reaction-rate' | 'combustion';  // 新增
```

**设计要点**：
- 每个化学实验独立的 `buildXxxElements()` 函数
- 使用现有 `CanvasElement` 基础类型组合绘制复杂实验装置
- 动画效果通过 `params` 中的时间/状态参数驱动

#### C3: `experiment-canvas.tsx` — 扩展路由分支

**职责**：根据 experiment id 选择对应的模板渲染。

**修改点**：
```typescript
// presetRenderMap 新增化学实验映射
if (presetRenderMap.has(id)) {
  return presetRenderMap.get(id)!(layout, params, computed);
}
```

#### C4: `schema-enricher.ts` — 注册化学实验模板

**职责**：将化学实验的 partial schema 补全为完整 schema。

**修改点**：
```typescript
const TEMPLATES: Record<string, () => ExperimentSchema> = {
  buoyancy: createBuoyancyExperiment,
  lever: createLeverExperiment,
  refraction: createRefractionExperiment,
  circuit: createCircuitExperiment,
  // 新增化学实验
  'acid-base-titration': createAcidBaseTitrationExperiment,
  'electrolysis': createElectrolysisExperiment,
  'reaction-rate': createReactionRateExperiment,
  'combustion': createCombustionExperiment,
};
```

#### C5: `template-registry.ts` — 注册化学实验白名单

**职责**：声明哪些模板 ID 是已审核通过的。

**修改点**：
```typescript
addApprovedTemplate('acid-base-titration', { auditStatus: 'approved' });
addApprovedTemplate('electrolysis', { auditStatus: 'approved' });
addApprovedTemplate('reaction-rate', { auditStatus: 'approved' });
addApprovedTemplate('combustion', { auditStatus: 'approved' });
```

#### C6: `concept-to-template.ts` — 添加化学实验概念映射

**职责**：将用户的自然语言概念映射到模板 ID。

**修改点**：
```typescript
{
  keywords: ['酸碱滴定', '滴定', 'pH曲线', '指示剂', 'acid-base titration'],
  templateId: 'acid-base-titration',
},
{
  keywords: ['电解水', '电解', '氢气', '氧气', 'electrolysis'],
  templateId: 'electrolysis',
},
{
  keywords: ['反应速率', '化学反应速率', '催化剂', 'reaction rate'],
  templateId: 'reaction-rate',
},
{
  keywords: ['燃烧条件', '燃烧', '着火点', 'combustion'],
  templateId: 'combustion',
}
```

---

## 📡 API 契约

### Schema 导出契约

`experiments.ts` 统一导出：
```typescript
export const presetExperimentSchemas: ExperimentSchema[] = [
  createBuoyancyExperiment(),
  createLeverExperiment(),
  createRefractionExperiment(),
  createCircuitExperiment(),
  // 新增化学实验
  createAcidBaseTitrationExperiment(),
  createElectrolysisExperiment(),
  createReactionRateExperiment(),
  createCombustionExperiment(),
];
```

### Legacy 转换契约

`DynamicExperiment.tsx` 的 `experimentSchemaToLegacy()` 必须能正确转换化学实验的 Schema：
- `meta.name` → `config.title`
- `params` → `config.params`（需映射字段名：name→label, default→default, ...）
- `formulas` → `config.formula` / `config.formulaExplanation`
- `teaching.theory` → `config.theory`
- `teaching.tips` → `config.tips`
- `teaching.examples` → `config.examples`

### Canvas 渲染契约

`preset-templates.ts` 的 `buildPresetElements()` 签名保持不变：
```typescript
function buildPresetElements(
  type: string,
  layout: { width: number; height: number },
  params: Record<string, number>,
  computed: Record<string, number>
): CanvasElement[];
```

---

## 🔄 关键决策与权衡

### 决策 1：物理/化学共享一套 Schema 还是分两套？

**选择**：共享一套 `ExperimentSchema`，使用 `GenericEngine`

**替代方案**：为化学实验创建 `ChemistrySchema` 子类型

**权衡**：
- **共享方案**：复用现有基础设施，减少代码量，向后兼容 ✅
- **独立方案**：更语义清晰，但需新建转换层和渲染管线，复杂度翻倍 ❌

**理由**：`ExperimentSchema` 的 `params`/`formulas`/`canvas` 等字段对化学实验完全适用，`GenericEngine` 的公式解析不考虑物理/化学语义，只负责数学计算。

### 决策 2：Canvas 渲染用 DOM overlay 还是纯 Canvas？

**选择**：纯 Canvas 2D（遵循现有架构）

**替代方案**：React DOM 覆盖层（化学实验的装置可能更适合 DOM）

**权衡**：
- **纯 Canvas**：与物理实验渲染一致，状态驱动，手势控制原生支持 ✅
- **DOM overlay**：对复杂装置排版更灵活，但与现有手势/导出系统不兼容 ❌

**理由**：保持一致性优先，化学实验的烧杯/滴定管等装置可以用基础几何类型组合。

### 决策 3：化学实验的 `physicsType` 字段值如何命名？

**选择**：使用 snake_case 化学标识符（如 `'acid_base'`），保持字段名不变

**替代方案**：新增 `experimentType` 字段，废弃 `physicsType`

**权衡**：
- **保持字段名**：零侵入，向后兼容，语义偏差通过文档说明 ✅
- **新增字段名**：更语义正确，但需修改 `schema-enricher.ts`/`experiments.ts` 等 N 处 ❌

**理由**：最小变更原则，字段内容是标识符（URI 风格），字段名只是键名。

---

## 🔍 架构自审清单

| ID | 检查项 | 严重度 | 评估 |
|----|--------|--------|------|
| ARCH-001 | 每个关键技术选择都有理由 | HIGH | ✅ PASS — 决策 1/2/3 均有理由 |
| ARCH-002 | 权衡被承认 | MED | ✅ PASS — 每个决策都列出了替代方案 |
| ARCH-004 | 水平扩展策略 | HIGH | ✅ PASS — 新增实验只需声明式配置 |
| ARCH-007 | 无单点故障 | HIGH | ✅ PASS — 各实验独立，渲染引擎通用 |
| ARCH-010 | 认证授权架构 | HIGH | N/A — 实验平台无需认证 |
| ARCH-013 | 可观测性 | MED | ✅ PASS — Schema 可静态验证，渲染可视觉验证 |
| ARCH-015 | 需求覆盖 | HIGH | ✅ PASS — 覆盖全部7个验收标准 |
| ARCH-016 | 功能需求支持 | HIGH | ✅ PASS — 4个化学实验均可声明式定义 |
| ARCH-017 | 无内部矛盾 | HIGH | ✅ PASS — 所有组件契约一致 |

---

## 🔥 对抗性审查

### 1. 魔鬼代言人：如果假设错了？

**假设 A**：`GenericEngine` 的公式解析能满足化学实验的计算需求。
- **如果错**：化学浓度计算涉及对数（pH），通用引擎可能精度不足。
- **缓解**：在 `computedParams` 中预计算复杂公式，引擎只负责最终展示。

**假设 B**：Canvas 基础类型可以表达所有化学实验装置。
- **如果错**：某些分子结构可能需要更复杂的图形。
- **缓解**：Phase 2 可以扩展 `CanvasElement` 的 type 联合类型，或引入 SVG 叠加层。

**假设 C**：`ExperimentConfig`（Legacy）字段足够承载化学实验。
- **如果错**：化学实验需要特有字段（如化学方程式字符串）。
- **缓解**：`additionalConfig` 扩展字段，或 Schema 端存储丰富数据，Legacy 端仅保留核心字段。

### 2. 最可能的故障场景

**场景**：用户调节参数后 Canvas 不更新。
- **根因**：`generateElements()` 未在 `params` 变化时重新调用，或 `computed` 值计算错误。
- **架构应对**：`ExperimentCanvas` 的 `useEffect` 依赖 `params` + `results`，确保任何参数变化触发重绘。`GenericEngine` 的错误公式解析会返回 `NaN`，需要默认值兜底。

### 3. 简化挑战

能否用更简单架构实现 80% 目标？—— 可以：直接在 `page.tsx` 中 hard-code 4 个化学实验组件，不迁移到统一框架。
- **差异**：简单方案缺少可扩展性、手势控制、导出报告、AI 对话等高级功能。
- **额外复杂度是否值得**：值得，因为用户明确选择了方案 A（架构迁移），且后续需要添加更多实验。

### 4. 外部依赖风险

唯一风险依赖：`GenericEngine` 的公式解析。
- **备用方案**：如果解析失败，降级为预计算值 stored in `computedParams`。

---

## 📊 架构决策记录 (ADR)

| ADR | 决策 | 状态 |
|-----|------|------|
| ADR-001 | 化学实验复用 `ExperimentSchema` 接口 | 已批准 |
| ADR-002 | Canvas 渲染延续纯 2D 方案 | 已批准 |
| ADR-003 | 保留 `physicsType` 字段名不变 | 已批准 |
| ADR-004 | 化学实验使用 `GenericEngine` 而非专用引擎 | 已批准 |

## 🛡️ 迁移安全方案

### 回滚策略
- 所有修改都是**增量**（新增工厂函数、新增 case 分支、新增注册）
- 回滚只需删除新增代码行，不影响物理实验
- `page.tsx` 的 `presetExperimentIds` 从 Set 中移除新 ID 即可隐藏实验

### 兼容性策略
- 物理实验的 `ExperimentSchema`、`GenericEngine`、`ExperimentCanvas` 均**不做任何修改**
- 仅扩展 TypeScript 联合类型和 switch/case 分支
- 类型安全：所有扩展处均有 TypeScript 编译时检查

### 漂移检测
- 物理实验路由 (`physics/buoyancy` 等) 测试：确保渲染正常
- 化学实验路由 (`acid-base-titration` 等) 测试：确保 Schema 能完整加载并渲染
