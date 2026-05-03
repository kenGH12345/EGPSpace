# EGPSpace — P1 TemplateRegistry 单一上线真相源 + Macro Port Map 结构化

## 🧠 Analysis Reasoning

### 0. Status / Expectation / Gap

#### Current Status（事实）

当前代码库存在两个相互独立但都属于“维护成本与正确性风险”的 P1 问题：

1. `TemplateRegistry` 的上线门禁存在 **registry 与 whitelist 双维护**。
   - 真实代码锚点是 `src/lib/template-registry.ts`。
   - `REGISTRY` 已经包含 `auditStatus: 'approved' | 'pending' | 'deprecated'`、`auditDocPath`、`lastAuditedAt`、`templatePath` 等 metadata。
   - 但是 `getTemplate()` 在检查 `REGISTRY[id]` 和 `entry.auditStatus === 'approved'` 之后，又在函数内部新建一个硬编码 `Set` 作为 whitelist。
   - 结果是模板上线需要至少维护两处：`REGISTRY` metadata 与 `getTemplate()` 内部 whitelist。若两者不同步，会出现“metadata approved 但无法渲染”或“whitelist 中残留无效条目”的漂移风险。

2. Macro 的 `exportPortMap` 使用 `componentId#portName` 字符串表示内部端口引用。
   - canonical contract 在 `src/lib/framework/contracts/layout.ts` 的 `MacroDefinition.exportPortMap: Record<string, string>`。
   - 解析点包括 `src/lib/framework/macro/flattener.ts` 的 `internalMapping.split('#')`、嵌套 macro 的 `_resolveDeepPort()`、以及 `src/lib/editor/editor-state-reducer.ts` 的 `unpackMacro` remap。
   - 生成点包括 `src/lib/editor/macro-utils.ts` 的 `buildDefaultExportPortMap()`，通过 `${inside.componentId}#${inside.portName}` 拼接 key/value。
   - 持久化路径包括 `src/lib/editor/bundle-from-state.ts` 和 `loadBundle` reducer。
   - 当前表达方式虽然简短，但它把结构化语义编码进字符串，导致解析错误只能在运行时暴露，也限制了未来 port ref 的扩展能力。

#### Expected State（目标）

本次 P1 的目标不是新增模板或新增 Macro 功能，而是让现有机制更可靠、更可测试：

1. `TemplateRegistry` 应以 registry metadata 作为唯一上线真相源。
   - `getTemplate()` 不应再在内部维护硬编码 whitelist。
   - 模板是否可被生产路径加载，应由 `REGISTRY[id]` 存在且 `auditStatus === 'approved'` 等 metadata 条件决定。
   - 上线条件需要由单元测试/审计测试保障，而不是靠手写 `Set` 重复维护。

2. Macro port map 应从字符串协议升级为结构化引用对象。
   - `exportPortMap` 的 value 应表达为 `{ componentId: string; portName: string }` 或复用现有 `SpecPortRef` / `PortRef` 等结构化端口引用类型。
   - flattener、encapsulation、unpack、bundle round-trip 都应读写结构化对象。
   - 迁移需要考虑旧 localStorage/bundle 中仍可能存在字符串值的兼容读取，避免用户已有宏存档直接失效。

#### Gap / Real Problem（真正问题）

核心差距是：项目已有足够 metadata 与端口引用类型，但当前实现仍把关键语义散落在 **重复集合** 和 **字符串协议** 中。这样会把正确性依赖从 TypeScript 类型系统和测试体系转移到人工同步，尤其在模板数量和 Macro 嵌套场景增长后风险会放大。

本次需求的真实意图是：

- 把模板上线状态收敛到一个 source of truth。
- 把 Macro port 引用收敛到类型可表达、可验证、可迁移的数据结构。
- 用测试建立上线/迁移的机器守护，而不是新增更多人工 checklist。

### 1. 用户真实意图

用户明确说“建议通过 registry metadata 和测试保证上线条件，而不是在 getTemplate() 内硬编码 Set”，说明真正关注点不是删除几行代码，而是消除一个长期会复发的维护模式：**双写配置漂移**。

用户同时要求“将 componentId#portName 字符串升级为结构化引用对象”，说明真正关注点也不是改名，而是把 Macro 的 port mapping 从 ad-hoc string protocol 升级为 **typed domain model**。这与项目已有 `PortRef` / `SpecPortRef` 结构一致，也符合 framework contract 层的边界演进方向。

### 2. 现有代码锚点

#### TemplateRegistry 相关锚点

- `src/lib/template-registry.ts`
  - `REGISTRY: Record<string, TemplateMetadata>`：模板 metadata 的事实来源。
  - `TemplateMetadata.auditStatus`：当前已表达上线状态。
  - `getTemplate(id)`：生产路径守卫，目前同时检查 `REGISTRY`、`auditStatus` 和内部 `whitelist`。
  - `listApprovedTemplates(subject?)`：已经以 `auditStatus` 为条件过滤 approved 模板。
  - `getTemplateUrl(id)` / `isApprovedTemplate(id)`：依赖 `getTemplate()`。
  - `addApprovedTemplate()`：历史遗留 helper，会补写部分 registry entry，但当前对物理模板调用时传入的是短 ID，例如 `buoyancy`，与 registry 中 `physics/buoyancy` 的 ID 体系存在不一致风险。

- `src/app/api/generate/route.ts`
  - 使用 `getTemplate(candidateId)` 过滤 LLM/概念候选模板。
  - 注释仍称 whitelist 是 authoritative，需要随着实现语义更新为 registry metadata authoritative。

- `src/components/IframeExperiment.tsx`
  - 通过 `getTemplate(templateId)` 在客户端渲染入口 fail fast。
  - 注释中多处提到 whitelist，需要更新为 registry metadata guard。

- `src/lib/concept-to-template.ts`
  - 使用 `isApprovedTemplate(mapping.templateId)` 来决定 concept mapping 是否返回。
  - 该路径应在移除 whitelist 后仍只返回 `auditStatus === 'approved'` 的模板。

#### Macro port map 相关锚点

- `src/lib/framework/contracts/layout.ts`
  - `MacroDefinition.exportPortMap: Record<string, string>` 是 canonical contract。
  - 该文件属于 `contracts` 层，项目约束要求 contracts 字段类型变更必须高度谨慎，并在架构阶段显式说明迁移策略。

- `src/lib/framework/macro/flattener.ts`
  - `_resolvePort()` 读取 `macroDef.exportPortMap[portRef.portName]` 后 `split('#')`。
  - `_resolveDeepPort()` 对 nested macro 再次 `split('#')`。
  - 当前错误路径包括 missing exported port、invalid string format、missing internal component。

- `src/lib/editor/macro-utils.ts`
  - `buildDefaultExportPortMap()` 生成 external port 到 `inner#port` 的映射。
  - `inverseMap` 当前也用 `inner#port → external` 字符串 key。
  - `remapBoundaryToComposite()` 当前根据字符串 key 找 external port。

- `src/lib/editor/editor-state-reducer.ts`
  - `encapsulateSelection` 接收可选 `exportPortMap?: Record<string, string>`，默认使用 `buildDefaultExportPortMap()`。
  - `loadBundle` 深拷贝 `exportPortMap`。
  - `unpackMacro` 读取 `definition.exportPortMap[ref.portName]` 后 `split('#')`，把 composite external port 映射回内部 component port。

- `src/lib/editor/bundle-from-state.ts`
  - 将 `state.macros[k].exportPortMap` 持久化到 `AssemblyBundle.macros`。
  - 这意味着 schema 变更会影响 localStorage/save-load round-trip。

- `src/lib/editor/macro-config.ts`
  - `computeMacroPortOffsets()` 只依赖 `Object.keys(exportPortMap)`，因此对 value 从 string 改为 object 的影响较小，但类型签名要同步。

- `src/lib/framework/macro/composite-component.ts`
  - `CompositeComponentProps.exportPortMap` 仍为 `Record<string, string>`，并影响 composite component 的 port 列表。

### 3. 复杂度评估

复杂度：**Medium-High**。

原因：

- `TemplateRegistry` 本身修改很小，但它是 LLM templateId、iframe 渲染、concept mapping 的安全边界，必须用测试证明 pending/deprecated/unregistered 不会被放行。
- Macro port map 会触及 `contracts/layout.ts`，属于 framework contract 变更，不只是内部实现替换。
- Macro schema 已经进入 bundle/localStorage 持久化路径，因此需要考虑旧字符串格式的兼容读取或明确迁移策略。
- 测试范围较广：flattener、macro-utils、editor reducer、bundle round-trip、macro-config，以及 TemplateRegistry 的新增测试。

### 4. 不显式说明会导致误解的假设

1. **不要求新增模板**：TemplateRegistry 需求只调整上线门禁模型，不新增或审核任何新 HTML 模板。
2. **不要求修改 `public/templates/**`**：项目 C-2 约束要求老模板零改；本需求可以在 TypeScript registry/test 层完成。
3. **不要求新增 npm 依赖**：项目 C-3 要求零新依赖，所有校验应使用现有 TypeScript/Jest 能力完成。
4. **不要求改变渲染路由外观**：`IframeExperiment`、concept mapping、API generate 的行为应保持一致，只是 guard 来源从 whitelist 改为 metadata。
5. **Macro 新结构必须 JSON-safe**：因为它会进入 `AssemblyBundle.macros` 和 localStorage。
6. **旧 bundle 兼容是高风险点**：如果直接把 `Record<string, string>` 改为 `Record<string, SpecPortRef>` 而不做读取兼容，旧用户存档里的 string map 可能在 `loadBundle` 或 `unpackMacro` 运行时报错。
7. **contracts 变更需要架构审查**：`MacroDefinition.exportPortMap` 是 contracts 层字段类型，不能当作普通实现细节直接改。

---

## 📋 User Stories

### US-1：模板维护者避免 registry/whitelist 双写漂移

- **Actor**：模板维护者 / 审核者
- **Goal**：只通过 `TemplateMetadata` 中的审核状态和必要 metadata 控制模板能否上线
- **Benefit**：新增或下线模板时不再需要同时维护 `REGISTRY` 和 `getTemplate()` 内硬编码 `Set`，减少漏改和错误放行风险

### US-2：渲染路径继续阻止未审核模板

- **Actor**：终端用户 / 学生 / 教师
- **Goal**：只看到已审核通过的 iframe 实验模板
- **Benefit**：LLM hallucinated templateId、pending 模板、deprecated 模板仍会被 fail fast，不会进入 iframe 渲染层

### US-3：Macro 作者获得结构化、类型安全的 port mapping

- **Actor**：自定义元件功能的开发者 / 维护者
- **Goal**：用结构化对象表达 external port 到 internal port 的引用，而不是依赖 `componentId#portName` 字符串协议
- **Benefit**：减少 split/parsing 错误，使 nested macro、unpack、bundle round-trip 的端口映射更容易测试和扩展

### US-4：已有 Macro 存档在 schema 演进后仍可加载

- **Actor**：已经创建并保存自定义 Macro 的用户
- **Goal**：升级后旧 bundle/localStorage 中的字符串 `exportPortMap` 不会导致加载崩溃
- **Benefit**：schema 迁移不破坏用户已有实验编辑状态，降低发布风险

### US-5：测试维护者用机器守护替代人工 checklist

- **Actor**：测试维护者 / reviewer
- **Goal**：用 Jest 测试验证 TemplateRegistry 上线条件和 Macro port map 结构化迁移
- **Benefit**：以后新增模板或修改 Macro 时，CI 能及时发现 metadata/port mapping 漂移，而不是依赖人工阅读 `getTemplate()` 或手测存档

---

## ✅ Acceptance Criteria

### AC-1：`getTemplate()` 不再维护硬编码 whitelist

**GIVEN** `src/lib/template-registry.ts` 中存在 `REGISTRY[id]` 且该 entry 的 `auditStatus === 'approved'`  
**WHEN** 调用 `getTemplate(id)`  
**THEN** 返回对应 `TemplateMetadata`，不再额外要求 id 出现在 `getTemplate()` 内部的 hard-coded `Set`。

### AC-2：未审核模板仍被拒绝

**GIVEN** `REGISTRY[id]` 存在但 `auditStatus` 为 `pending` 或 `deprecated`  
**WHEN** 调用 `getTemplate(id)` / `isApprovedTemplate(id)` / `getTemplateUrl(id)`  
**THEN** `getTemplate()` 返回 `null`，`isApprovedTemplate()` 返回 `false`，`getTemplateUrl()` 返回 `null`。

### AC-3：未知模板仍被拒绝

**GIVEN** 调用方传入 `null`、`undefined`、非字符串值或不存在于 `REGISTRY` 的字符串 id  
**WHEN** 调用 `getTemplate(id)`  
**THEN** 返回 `null`，不抛异常。

### AC-4：approved template 列表与 `getTemplate()` 语义一致

**GIVEN** `listApprovedTemplates()` 返回某个 template metadata  
**WHEN** 对该 metadata 的 `id` 调用 `getTemplate(id)`  
**THEN** 必须返回非 `null`，防止列表和单点解析语义漂移。

### AC-5：TemplateRegistry 注释与测试反映 metadata guard，而不是 whitelist guard

**GIVEN** 代码注释、测试名、文档性说明提到模板上线条件  
**WHEN** 本次变更完成  
**THEN** 关键注释应表达 “registry metadata / auditStatus guard”，不再把 `whitelist` 描述为 authoritative source。

### AC-6：MacroDefinition 使用结构化 port 引用

**GIVEN** `MacroDefinition.exportPortMap` 表示 external port 到 internal port 的映射  
**WHEN** 查看 framework contract 类型  
**THEN** value 应为结构化对象，例如 `{ componentId: string; portName: string }`，而不是 `componentId#portName` 字符串。

### AC-7：Macro 封装默认生成结构化 exportPortMap

**GIVEN** 用户选择多个组件并触发 `encapsulateSelection`  
**WHEN** `buildDefaultExportPortMap()` 根据 boundary connections 生成 macro definition  
**THEN** `exportPortMap[externalPort]` 的 value 是结构化 port ref，external port 名仍保持稳定可读，例如 `r1_a`。

### AC-8：Macro flatten 支持结构化 mapping，并保持 nested macro 行为

**GIVEN** parent spec 中连接到 macro external port，且 macro 的 `exportPortMap` 指向内部 atomic component 或 nested macro  
**WHEN** `SpecFlattener.flatten()` 运行  
**THEN** 输出 atomic `AssemblySpec` 的 component id prefix、internal connection、external connection 与现有行为一致。

### AC-9：Macro unpack 支持结构化 mapping

**GIVEN** editor state 中存在 composite macro instance 且外部连接指向 composite external port  
**WHEN** 用户触发 `unpackMacro`  
**THEN** boundary connections 能通过结构化 `exportPortMap` 重写到展开后的内部 component port，不再依赖 `split('#')`。

### AC-10：旧字符串 exportPortMap 可兼容读取

**GIVEN** 旧 bundle/localStorage 中存在 `exportPortMap: { A: 'r1#a' }`  
**WHEN** 通过 `loadBundle` 或 flattener/reducer 使用该 macro definition  
**THEN** 系统应能把旧字符串安全归一化为结构化 port ref，或至少在明确兼容入口执行迁移，避免运行时崩溃。

### AC-11：Bundle round-trip 保持 JSON-safe 和深拷贝隔离

**GIVEN** state 包含一个或多个 macros  
**WHEN** 执行 `bundleFromState(state)`、`JSON.stringify/parse`、再 `loadBundle`  
**THEN** 结构化 `exportPortMap` 能完整保留，且修改 bundle 或 loaded state 不会污染原 state。

### AC-12：无范围外修改

**GIVEN** 本次需求只涉及 TemplateRegistry 与 Macro port map schema  
**WHEN** CODE 阶段完成  
**THEN** 不应修改 `public/templates/**`，不应新增 npm 依赖，不应改变 editor React UI 行为，除非为类型兼容做最小签名同步。

---

## 🗺️ Module Map

### TemplateRegistry 需求影响范围

```text
src/lib/template-registry.ts
  ├─ owns REGISTRY + TemplateMetadata + getTemplate()
  ├─ provides getTemplateUrl() / isApprovedTemplate() / listApprovedTemplates()
  ├─ consumed by src/components/IframeExperiment.tsx
  ├─ consumed by src/app/api/generate/route.ts
  └─ consumed by src/lib/concept-to-template.ts
```

关系说明：

- `template-registry.ts` 是模板 metadata 与 production guard 的 source of truth。
- `IframeExperiment.tsx` 是客户端 iframe 渲染入口，必须继续 fail fast。
- `api/generate/route.ts` 是 LLM/generated experiment fallback 路径，必须继续拒绝不 approved 的 templateId。
- `concept-to-template.ts` 是自然语言概念到 templateId 的映射层，应继续通过 `isApprovedTemplate()` 守卫。

### Macro port map 需求影响范围

```text
src/lib/framework/contracts/layout.ts
  └─ MacroDefinition.exportPortMap canonical type
      ├─ src/lib/framework/macro/flattener.ts
      │   ├─ _resolvePort()
      │   └─ _resolveDeepPort()
      ├─ src/lib/framework/macro/composite-component.ts
      ├─ src/lib/editor/macro-utils.ts
      │   ├─ buildDefaultExportPortMap()
      │   └─ remapBoundaryToComposite()
      ├─ src/lib/editor/editor-state-reducer.ts
      │   ├─ encapsulateSelection
      │   ├─ loadBundle
      │   └─ unpackMacro
      ├─ src/lib/editor/bundle-from-state.ts
      ├─ src/lib/editor/macro-config.ts
      └─ tests under src/lib/editor/__tests__ and src/lib/framework/macro/*.test.ts
```

关系说明：

- `contracts/layout.ts` 是 schema owner，因此结构化 port ref 应在这里定义或引用。
- `macro-utils.ts` 是生成端，必须产出新结构。
- `flattener.ts` 与 `editor-state-reducer.ts` 是消费端，必须不再直接 `split('#')`。
- `bundle-from-state.ts` / `loadBundle` 是持久化边界，必须承担旧格式兼容或迁移。
- `macro-config.ts` 主要依赖 external port names，即 `Object.keys(exportPortMap)`，改动应限于类型签名。

---

## 📦 Functional Requirements

### FR-1：Registry metadata 作为模板上线单一真相源

`getTemplate()` 必须只依赖以下条件决定是否返回模板：

- id 是非空字符串；
- `REGISTRY[id]` 存在；
- entry 的 `auditStatus === 'approved'`；
- 如架构阶段认为必要，可额外校验 metadata 完整性，例如 `templatePath` 非空、`subject` 有效、`id === key`，但这些条件应来自 registry metadata，而不是独立 whitelist。

### FR-2：TemplateRegistry 上线条件必须有测试守护

应新增或更新 TemplateRegistry 单元测试，覆盖：

- approved registry entry 可通过 `getTemplate()`；
- pending/deprecated entry 不可通过；
- unknown/null/undefined 不可通过；
- `listApprovedTemplates()` 与 `getTemplate()` 一致；
- 不存在 “approved 但被 whitelist 漏掉” 的二次门禁。

### FR-3：Macro port map value 升级为结构化引用对象

`MacroDefinition.exportPortMap` 应表达为：

```ts
Record<string, { componentId: string; portName: string }>
```

或复用现有 `SpecPortRef` / `PortRef` 类型。选择标准应由 ARCHITECT 阶段决定，但必须满足：

- JSON-safe；
- 与 `ConnectionDecl.from/to` 的端口引用 shape 一致；
- 不引入 contracts → runtime/builders/domains 依赖；
- 可支持嵌套 macro 递归解析。

### FR-4：旧字符串格式需兼容迁移

系统应在明确边界兼容旧格式：

- 可以在 `loadBundle` 时把 legacy string map normalize 为 structured map；
- 或提供 `normalizeExportPortMap()` 供 flattener/reducer 在读取前调用；
- 但新写出的 bundle 应使用结构化对象，不应继续写 `componentId#portName` 字符串。

### FR-5：Macro 相关测试迁移到结构化断言

现有测试中对 `'r1#a'`、`'r2#b'`、`EVIL = 'x#y'` 等字符串断言需要迁移为结构化对象断言，同时保留 legacy string 兼容测试。

---

## 🚫 Non-Goals / Out of Scope

- 不新增模板 HTML，不修改 `public/templates/**`。
- 不新增 TemplateRegistry 的 admin UI。
- 不改变 `auditStatus` 枚举含义，除非架构审查明确需要新增状态。
- 不重做 Triple-Lock 的前两锁；本次只消除 `getTemplate()` 内部硬编码 whitelist 这一重复锁。
- 不改变 Macro UI 交互流程，不新增拖拽/编辑 external port name 的新功能。
- 不重构整个 editor state 架构。
- 不新增 npm 依赖。

---

## ⚠️ Risk Analysis

| Risk | Severity | Description | Mitigation |
|---|---:|---|---|
| R1: Template guard 放宽误判 | High | 删除 whitelist 后，如果仅看 `auditStatus`，某些 metadata 不完整但 approved 的 entry 可能被放行 | 用测试定义上线 metadata 完整性；至少保证 approved/pending/deprecated/unknown 语义一致 |
| R2: 历史注释和文档继续误导 | Medium | 代码注释仍称 whitelist authoritative，后续维护者可能重新引入 Set | 同步更新关键注释和测试名，将术语改为 metadata guard |
| R3: contracts 字段类型变更影响广 | High | `MacroDefinition.exportPortMap` 位于 contracts 层，直接改类型会影响 editor、flattener、bundle、tests | ARCHITECT 阶段明确 schema owner、迁移边界和 compatibility helper |
| R4: 旧 localStorage/bundle 失效 | High | 用户已有 `exportPortMap` 字符串存档，升级后若直接访问 `.componentId` 会失败 | 在 load/normalize 边界兼容 legacy string；新增 legacy round-trip 测试 |
| R5: nested macro 递归解析回归 | Medium | `_resolveDeepPort()` 当前依赖 split 递归，结构化改造可能破坏 nested macro | 保留/新增 nested macro flattener 单测 |
| R6: inverse map 仍需 key | Medium | `remapBoundaryToComposite()` 需要从 inside port 找 external name，结构化对象不能直接作 object key | 可以继续用 `portKey()` 作为内部 lookup key，但 public/export value 必须结构化 |
| R7: 全仓既有 lint/entropy 债务干扰验收 | Medium | 近期任务已发现 full lint 有既有问题 | TEST 阶段区分 modified-file diagnostics、targeted Jest、ts-check 与 full repo debt |

---

## 🔒 Hard Constraints Continuation

依据 `docs/architecture-constraints.md`：

- **C-1 Framework 物理分层边界**：本次会触及 `src/lib/framework/contracts/layout.ts`，必须在 ARCHITECT 阶段说明这是 contracts schema migration，并保证不引入非法依赖方向。
- **C-2 老模板零改**：本次不得修改 `public/templates/**`。
- **C-3 零新依赖**：不得修改 dependency/devDependency。
- **C-4 Editor 零 React 污染**：`src/lib/editor/**` 只能保持纯 TypeScript，不得引入 React。
- **C-5 iframe 模板底座单一**：本次不应修改 `_shared/experiment-core.js` 或任何 iframe host 通信底座。

---

## 🧪 Required Test Coverage Preview

后续 TEST 阶段至少需要覆盖：

1. TemplateRegistry metadata guard 单测。
2. `getTemplate()` 与 `listApprovedTemplates()` 一致性测试。
3. Macro default export map 生成结构化对象测试。
4. Flattener 使用结构化 map flatten macro 测试。
5. Nested macro flatten 回归测试。
6. `unpackMacro` 使用结构化 map 重写 boundary connection 测试。
7. Bundle save/load round-trip 保留结构化 map 测试。
8. Legacy string `exportPortMap` 兼容加载测试。
9. `macro-config` 仍只根据 external port names 计算 port layout 的测试。
10. Modified files TypeScript diagnostics 和 targeted Jest。

---

## ✅ ANALYSE Exit Summary

本次需求可拆为两个独立但同一性质的维护性 P1：

- `TemplateRegistry`：删除 `getTemplate()` 内部 hard-coded whitelist，以 `REGISTRY` metadata + audit tests 作为上线条件。
- `Macro port map`：将 `exportPortMap` value 从 `componentId#portName` 字符串协议升级为结构化 port ref，并通过兼容迁移保护旧 bundle/localStorage。

二者的共同验收重点是：**单一真相源、类型表达业务语义、测试替代人工同步、保持现有用户路径不回归**。