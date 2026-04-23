# 需求分析：实验 Schema 验证层

## 背景

当前 LLM 生成流程：`POST /api/generate` → `transformToSchema()` → `enrichSchema()` → `validateSchema()` → 返回

`validateSchema()` 只做结构校验（字段是否存在），不做语义校验（参数是否物理合理）。
需要在 `enrichSchema()` 之后插入一个**语义验证层**，对 LLM 生成的内容进行物理合理性检查。

## 根因 / Root Cause

**核心问题：渲染系统三重分裂，新学科无法复用**

当前项目存在三套并行的渲染系统，彼此独立、无法互通：

1. **命令式绘图层**（`DynamicExperiment.tsx`）：`drawBuoyancy()` / `drawLever()` / `drawRefraction()` / `drawCircuit()` 四个函数，共约 350 行硬编码 Canvas 2D 指令。每新增一种实验类型，必须手写一个新的 `drawXxx()` 函数。

2. **声明式渲染器**（`declarative-renderer.ts`）：已实现 7 种基础元素（rect/circle/line/arrow/text/polygon/arc）的声明式渲染，但仅支持 `CanvasElement` 类型（experiment-schema.ts 定义），**缺少化学/生物/数学专用元素**（beaker、molecule、function_graph 等）。

3. **DrawElement 系统**（`experiment-types.ts` + `interactive-experiment-canvas.tsx`）：已定义 21 种 `DrawElement` 类型（含 beaker/bubble/molecule/lightRay/pendulum 等），但与统一 Schema 完全脱节，无法被 LLM 生成的 Schema 消费。

**直接后果**：
- 新增化学实验（酸碱中和）需要手写 `drawAcidBase()` 函数，无法复用 `beaker`/`bubble` 组件
- LLM 生成的 Schema 中 `canvas.elements` 只能使用 7 种基础类型，无法描述复杂实验场景
- `CanvasElement`（8 种类型）和 `DrawElement`（21 种类型）是两套并行类型系统，维护成本翻倍

**证据**：
- `DynamicExperiment.tsx` L159-163：`if (schema?.canvas?.elements?.length)` 走声明式路径，否则走命令式 `switch`
- `experiment-types.ts` L68-90：`DrawElementKind` 已定义 21 种类型，但 `declarative-renderer.ts` 的 `RENDERERS` 只有 8 个 key
- `experiment-schema.ts` L68：`ElementType` 只有 8 种，远少于 `DrawElementKind` 的 21 种

---

## 受影响位置

| 文件 | 变更类型 | 原因 |
|------|---------|------|
| `src/lib/experiment-schema.ts` | 扩展 `ElementType` | 合并 `DrawElementKind` 的 21 种类型到 `CanvasElement` |
| `src/lib/experiment-types.ts` | 废弃/对齐 | `DrawElement` 类型对齐到统一 `CanvasElement` |
| `src/lib/declarative-renderer.ts` | 大幅扩展 | 新增 13 种元素渲染器（spring/wave/beaker/molecule/lightRay/pendulum/forceArrow/bubble/axis/function/point/reaction/group） |
| `src/components/DynamicExperiment.tsx` | 重构 | 将 4 个 `drawXxx()` 转换为声明式 preset template 定义 |
| `src/lib/preset-templates.ts` | 新建 | 存放 buoyancy/lever/refraction/circuit 的声明式组件定义 |
| `src/lib/experiment-schema.ts` | 扩展 `CanvasElement` | 添加 DrawElement 中存在但 CanvasElement 缺少的字段 |

**依赖关系**：
```
experiment-schema.ts (CanvasElement 统一类型)
    ↓
declarative-renderer.ts (全量渲染器)
    ↓
preset-templates.ts (声明式 preset 定义)
    ↓
DynamicExperiment.tsx (消费层，移除命令式 drawXxx)
```

---

## 用户故事

**US-1**：作为平台，当 LLM 生成的参数范围不合理时（密度为负、折射率 < 1），自动修正或回退规则库，确保实验科学正确。

**US-2**：作为平台，当 LLM 生成的公式与知识库标准公式不匹配时，检测并用标准公式替换，防止学生学到错误知识。

**US-3**：作为平台，当实验参数量纲不一致时，检测并报告量纲错误，维护科学严谨性。

**US-4**：作为平台，当验证层检测到严重错误时，自动回退规则库，保证用户始终看到可用实验。

**US-5**：作为开发者，验证层返回详细报告（哪些检查通过/失败/严重程度），便于调试和监控 LLM 生成质量。

**Story 1 — 实验开发者**
> 作为实验开发者，我希望新增一个化学实验（如酸碱滴定）时，只需在 Schema 的 `canvas.elements` 中组合 `beaker`、`arrow`、`text` 等现有组件，而不需要写任何 Canvas 2D 命令式代码，从而将新实验的开发时间从 2 小时缩短到 20 分钟。

**Story 2 — LLM 生成管道**
> 作为 LLM 生成管道，我希望能够在生成的 ExperimentSchema 中使用完整的 21 种组件类型（包括 beaker/molecule/lightRay/pendulum），而不仅限于 8 种基础类型，从而让生成的实验可视化更丰富、更准确。

**Story 3 — 系统维护者**
> 作为系统维护者，我希望只维护一套渲染类型系统（统一的 `CanvasElement`），而不是同时维护 `CanvasElement`（8种）和 `DrawElement`（21种）两套并行系统，从而消除类型不一致导致的 bug。

**Story 4 — 物理实验用户**
> 作为使用浮力实验的学生，我希望实验的可视化效果（液体、物体、力箭头）与现在完全一致，即使底层从命令式绘图迁移到声明式组件，用户体验不应有任何退化。

---

## 验收标准

| ID | 条件 | 期望结果 |
|----|------|---------|
| AC-1 | `rho_object < 0` | 参数范围检查失败，clamp 到合理范围或触发回退 |
| AC-2 | `n1 < 1.0`（折射率小于真空） | 报告 `PARAM_OUT_OF_RANGE` 错误 |
| AC-3 | 公式 `I = R/U` 与知识库 `I = U/R` 不匹配 | 公式验证失败，用知识库标准公式替换 |
| AC-4 | 力的单位为 `kg` 而非 `N` | 量纲检查报告 `DIMENSION_MISMATCH` 警告 |
| AC-5 | 验证失败数 ≥ 2 个 CRITICAL 错误 | 触发规则库回退，返回 `fallbackUsed: true` |
| AC-6 | 所有验证通过 | 返回原始 Schema，`validationPassed: true` |
| AC-7 | 验证层内部出错 | fail-safe：返回原始 Schema，不阻塞流程 |
| AC-8 | 验证报告结构 | `ValidationReport` 包含 `checks[]`，每项有 `name/status/severity/message` |

**AC-1（类型统一）**：`experiment-schema.ts` 中的 `ElementType` 扩展到包含 `DrawElementKind` 的全部 21 种类型，`CanvasElement` 接口包含所有必要字段，TypeScript 编译 0 errors。

**AC-2（渲染器完整性）**：`declarative-renderer.ts` 的 `RENDERERS` 映射覆盖全部 21 种元素类型，每种类型有对应的渲染函数，不存在 `renderPlaceholder` 降级的情况（除 `image` 类型外）。

**AC-3（Preset 模板等价性）**：`preset-templates.ts` 中的 buoyancy/lever/refraction/circuit 四种 preset 模板，渲染结果与原 `drawBuoyancy()` 等函数视觉上等价（相同参数下，关键元素位置误差 < 5px）。

**AC-4（DynamicExperiment 解耦）**：`DynamicExperiment.tsx` 中的 `drawBuoyancy`/`drawLever`/`drawRefraction`/`drawCircuit` 四个函数被移除，渲染路径统一走 `renderCanvas()`。

**AC-5（新实验类型可组合）**：能够仅通过 `canvas.elements` 数组（不写任何 Canvas 2D 代码）定义一个包含 `beaker` + `arrow` + `text` 的化学实验场景，并正确渲染。

**AC-6（向后兼容）**：现有的 `ExperimentSchema` 格式不变，`canvas.presetTemplate` 字段继续有效，旧的 Schema 数据无需迁移。

**AC-7（测试通过）**：所有现有 254 个测试用例继续通过，新增针对 preset-templates 和扩展渲染器的测试用例。

---

## 模块影响图

```
src/lib/
├── physics-knowledge.ts     [新建] 物理知识库（参数范围 + 标准公式 + 量纲定义）
├── schema-validator.ts      [新建] 验证层核心（4 个检查器 + 回退逻辑）
├── experiment-schema.ts     [不变] 统一 Schema 定义
├── schema-enricher.ts       [不变] Schema 补全
└── __tests__/
    └── schema-validator.test.ts  [新建] 验证层测试（≥ 20 个用例）

src/app/api/generate/
└── route.ts                 [修改] 插入验证层调用
```

## 模块地图

```
src/lib/
├── experiment-schema.ts      [修改] CanvasElement 扩展到 21 种类型
├── experiment-types.ts       [对齐] DrawElement 类型别名指向 CanvasElement
├── declarative-renderer.ts   [扩展] 新增 13 种元素渲染器
├── preset-templates.ts       [新建] 4 种实验的声明式 preset 定义
└── physics-engine.ts         [不变] 计算引擎不受影响

src/components/
├── DynamicExperiment.tsx     [重构] 移除 drawXxx()，统一走声明式路径
└── interactive-experiment-canvas.tsx  [不变] 保留，使用 DrawElement 系统
```

**关键数据流**：
```
ExperimentSchema.canvas.elements (CanvasElement[])
    ↓ 若 elements 为空且有 presetTemplate
preset-templates.ts → buildPresetElements(type, params, computed)
    ↓
declarative-renderer.ts → renderCanvas(ctx, elements, layout, params, computed)
    ↓
Canvas 2D 输出
```

---

## 数据流

```
LLM 输出
  → transformToSchema()
  → enrichSchema()
  → validateWithKnowledge()   ← 新增验证层
      ├── checkParamRanges()      参数范围检查
      ├── checkPhenomenon()       现象合理性检查
      ├── checkFormulas()         公式知识库比对
      └── checkDimensions()       量纲一致性检查
      ↓ 失败 (≥2 CRITICAL)
  → fallbackToRuleBase()      ← 规则库回退
  → 返回 { schema, validationReport }
```

---

## 技术风险

**风险 1**：量纲分析复杂度高。
- 缓解：简化版量纲系统，只覆盖 SI 基本量纲（长度/质量/时间/电流/温度）
- 降级：量纲检查只产生 WARNING，不触发回退

**风险 2**：公式验证误报率高（LLM 可能用不同写法表达同一公式）。
- 缓解：规范化比较（去空格、统一变量名映射、允许等价变形）
- 降级：公式验证只检查"关键变量是否出现"，不做完整代数等价验证

---

## 风险分析

**风险 1（高）：Preset 模板视觉等价性难以保证**
- 原因：命令式 `drawBuoyancy()` 使用了大量硬编码的像素坐标和比例计算，转换为声明式时需要精确还原这些计算逻辑
- 缓解：先实现 preset 模板，再通过视觉对比测试验证，保留原 `drawXxx()` 函数作为参考直到验证通过

**风险 2（中）：CanvasElement 字段扩展的向后兼容性**
- 原因：`CanvasElement` 新增字段（如 `cx`/`cy` for circle，`x1`/`y1`/`x2`/`y2` for arrow）可能与现有字段命名冲突
- 缓解：新字段全部设为可选（`?`），保留现有字段，通过 TypeScript 严格模式检查

**风险 3（低）：DrawElement 系统的迁移成本**
- 原因：`interactive-experiment-canvas.tsx` 使用 `DrawElement` 类型，若直接替换会破坏现有实验页面
- 缓解：本次不迁移 `interactive-experiment-canvas.tsx`，仅在 `experiment-schema.ts` 层面统一类型，通过类型别名保持兼容

---

## change_scope

**需要修改的文件和位置**：

| 文件 | 修改范围 | 具体位置 |
|------|---------|---------|
| `src/lib/experiment-schema.ts` | `ElementType` 类型扩展 + `CanvasElement` 接口字段补充 | L68-L110 |
| `src/lib/declarative-renderer.ts` | 新增 13 种元素渲染函数 + 扩展 `RENDERERS` 映射 | L230-L368 |
| `src/lib/preset-templates.ts` | 新建文件，4 种实验的声明式 preset 定义 | 全新文件 |
| `src/components/DynamicExperiment.tsx` | 移除 `drawBuoyancy/drawLever/drawRefraction/drawCircuit`，渲染路径统一走 `renderCanvas()` | L160-L640 |
| `src/lib/experiment-types.ts` | 添加类型别名，使 `DrawElement` 对齐 `CanvasElement` | L345-L380 |

**不需要修改的文件**：
- `src/lib/physics-engine.ts` — 计算引擎与渲染完全解耦，不受影响
- `src/lib/experiment-schema.ts` 的 Schema 结构 — 格式不变，向后兼容
- `src/components/interactive-experiment-canvas.tsx` — 保留现有 DrawElement 系统，本次不迁移
- `src/lib/physics-knowledge.ts` / `src/lib/schema-validator.ts` — 验证层不受影响

---

## risk_assessment

**风险 1（高优先级）：Preset 模板视觉等价性**
- **描述**：命令式 `drawBuoyancy()` 使用硬编码像素坐标（如 `liquidLevel = height * 0.6`、`objectX = width / 2 - 30`），转换为声明式时需要精确还原这些动态计算
- **影响**：若 preset 模板渲染结果与原函数不一致，会导致现有用户看到视觉退化
- **缓解措施**：
  1. 保留原 `drawXxx()` 函数作为参考，直到视觉验证通过后再删除
  2. 在 preset-templates.ts 中使用 `{expression}` 动态绑定还原原有计算逻辑
  3. 编写视觉对比测试（相同参数下关键元素位置误差 < 5px）

**风险 2（中优先级）：CanvasElement 字段扩展的类型冲突**
- **描述**：`CanvasElement` 现有字段（`x`/`y`/`radius`）与 `DrawElement` 的字段命名约定不同（`cx`/`cy`/`r` for circle，`x1`/`y1`/`x2`/`y2` for arrow）
- **影响**：若直接合并，可能导致现有 Schema 数据解析失败
- **缓解措施**：新字段全部设为可选（`?`），渲染器同时支持两种命名约定（`x`/`cx` 均可），TypeScript 严格模式验证

**风险 3（低优先级）：渲染器性能**
- **描述**：新增 13 种渲染器后，每帧渲染需要遍历更多 case，可能影响动画帧率
- **影响**：对于包含大量元素的复杂实验，可能出现卡顿
- **缓解措施**：渲染器使用 `Record<ElementType, RenderFn>` 映射（O(1) 查找），不使用 switch-case 链

---

## 思考摘要

| 问题 | 答案 |
|------|------|
| 真实意图是什么？ | 让新学科实验（化学/生物/数学）无需写命令式绘图代码，只需组合现有声明式组件 |
| 最大的架构障碍是什么？ | CanvasElement（8种）和 DrawElement（21种）两套并行类型系统，declarative-renderer 只覆盖 8 种 |
| 最小可行方案是什么？ | 扩展 CanvasElement 到 21 种 + 扩展渲染器 + 将 drawXxx() 转为 preset templates |
| 什么不应该改变？ | physics-engine.ts 计算层、ExperimentSchema 格式、interactive-experiment-canvas.tsx |
| 如何验证成功？ | 相同参数下 preset 模板渲染结果与原 drawXxx() 视觉等价，新化学实验可纯声明式定义 |
