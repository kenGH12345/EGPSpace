# ANALYSE · anchor-Spec 解耦（D）

> Session: `wf-20260428153150.`
> Scope: 把视觉坐标 `anchor` 从 Spec / Component 的数据层分离为独立 `LayoutSpec`，为后续 B（编辑器 framework）做架构前置清理。

---

## 根因 / Root Cause

当前 `AssemblySpec<D>.components[i].anchor` 与 `IExperimentComponent.anchor` **把"视觉信息"和"拓扑信息"强绑定在同一数据结构上**。这带来 3 个具体症状：

### 症状 1 · **Engine 被迫接收它不需要的坐标**

`ChemistryReactionEngine / CircuitEngine` 在 v2 path 里收到 `spec.components[i]` 时，`anchor` 也跟着来。引擎做 MNA/化学计量完全不用坐标，但必须把它纳入 **DTO serialize** → **postMessage 载荷** → **hash 计算**。结果：**用户拖一下元件（仅改 anchor），整个 spec hash 变化**，任何基于 hash 的缓存/比对都要重算，尽管拓扑没变。

### 症状 2 · **HTML 模板必须硬编码坐标才能渲染**

`circuit.html` 第 98-101 行和 `metal-acid-reaction.html` 第 99-101 行各写了 4 次 `anchor: {x: 40, y: 110}`——Builder 强制要求 anchor 才能出现在画布上。**没有 anchor 就是 `{x:0, y:0}`**，所有元件挤在左上角，实验不可读。

→ 这意味着**"自由搭建"的前置条件不成立**：用户不可能会手写 `anchor: {x: 280, y: 110}`，而当前架构要求他写。

### 症状 3 · **Reaction 产生的新元件缺省坐标是 (0,0)**

`makeBubble/makeReagent/makeSolid` 都硬编码 `anchor: { x: 0, y: 0 }`，所以 `metal-acid-reaction.html` 的 `applyResult` 里被迫**客户端临时补 anchor**（第 168-175 行的 `bubbleStackY` hack）——这正是耦合最尖锐的体现：**数据层的 anchor 必选字段，强迫渲染层偷偷塞值**。

### 核因（1 句话）

> `anchor` 是**渲染关注点**，却被放在**数据层契约**里，导致所有下游消费者（engine / hash / 序列化 / reaction-rule）被迫携带它。

---

## 受影响位置

| # | File | 触及形式 | 改动性质 |
|---|------|---------|---------|
| 1 | `src/lib/framework/components/base.ts` | `IExperimentComponent.anchor` / `AbstractComponent.anchor` / `ComponentDTO.anchor` | **核心契约** |
| 2 | `src/lib/framework/assembly/spec.ts` | `ComponentDecl.anchor?` / 新增 `LayoutSpec<D>` / `LayoutEntry` | **核心契约** |
| 3 | `src/lib/framework/assembly/fluent.ts` | `FluentAddOptions.anchor` → 转为 `layout` 分支写入 | 新增 `layout(id, anchor)` API |
| 4 | `src/lib/framework/assembly/assembler.ts` | Assembler 不再把 anchor 传给 ComponentBuilder | 轻度改动 |
| 5 | `src/lib/framework/assembly/index.ts` | export LayoutSpec 相关 | 新增 export |
| 6 | `src/lib/framework/index.ts` | 同上，顶层 re-export | 新增 export |
| 7 | `src/lib/framework/domains/circuit/assembly/circuit-builder.ts` | 9 处 `{ id, anchor }` opts → `{ id, anchor }` 走新 layout 分支 | 内部改造 |
| 8 | `src/lib/framework/domains/circuit/assembly/circuit-assembler.ts` | ComponentBuilder 收到的 decl 不含 anchor | 轻度 |
| 9 | `src/lib/framework/domains/chemistry/assembly/chemistry-builder.ts` | 同 circuit-builder 模式 | 内部改造 |
| 10 | `src/lib/framework/domains/chemistry/assembly/chemistry-assembler.ts` | 同上 | 轻度 |
| 11 | `src/lib/framework/domains/chemistry/reaction-utils.ts` | `makeReagent/makeBubble/makeSolid` 不再 hard-code anchor | 轻度 |
| 12 | `src/lib/framework/domains/circuit/reactions/overload-bulb.ts` | 同上（若有 anchor） | 轻度 |
| 13 | `src/lib/framework/domains/circuit/components.ts` | factory 不接收 anchor（由 DTO 兼容层保留） | 向后兼容 |
| 14 | `src/lib/framework/domains/chemistry/components.ts` | 同上 | 向后兼容 |
| 15 | `public/templates/_shared/circuit-builder.js` | 浏览器 Builder 镜像的 anchor opts 走 layout 分支 | 镜像同步 |
| 16 | `public/templates/_shared/chemistry-builder.js` | 同上 | 镜像同步 |
| 17 | `public/templates/physics/circuit.html` | DSL 调用 `.battery({voltage, id, anchor})` 保持不变但语义变为"通过 sugar 同时写 anchor" | 零修改（API 兼容） |
| 18 | `public/templates/chemistry/metal-acid-reaction.html` | 同上 + `applyResult` 里的 `bubbleStackY` hack 可简化 | 简化 |
| 19 | `src/lib/engines/physics/circuit.ts` | `_formatV2Result` components 输出不再包含 anchor | 产出清理 |
| 20 | `src/lib/engines/chemistry/reaction.ts` | 同上 | 产出清理 |
| 21 | `src/lib/framework/__tests__/assembly.test.ts` | anchor 相关断言从 Spec 侧转移到 LayoutSpec 侧 | 测试迁移 |
| 22 | `src/lib/framework/domains/circuit/__tests__/circuit-assembly.test.ts` | 同上 | 测试迁移 |
| 23 | `src/lib/framework/domains/chemistry/__tests__/chemistry-*.test.ts` | 同上（3 测试文件） | 测试迁移 |

**合计** ≈ **23 文件改动**（其中 2 新增概念 · 21 轻度修改 / 测试迁移）

---

## 修改范围

### In-Scope（本轮必做）

| 目标 | 说明 |
|------|------|
| **T1** 新增 `LayoutSpec<D>` 类型 | `{ domain, entries: Array<{componentId, anchor}> }`，独立于 AssemblySpec |
| **T2** 新增 `AssemblyBundle<D>` 类型 | `{ spec: AssemblySpec<D>; layout?: LayoutSpec<D> }`——把两者组合但不合并 |
| **T3** FluentAssembly 新增 `.layout(id, anchor)` + 保留 `add(kind, props, {id, anchor})` sugar | sugar 内部自动分流：props→Spec，anchor→LayoutSpec |
| **T4** `IExperimentComponent.anchor` 标记 `deprecated` 但保留 | 向后兼容；组件不再从 ctor 接收 anchor 作为必需 |
| **T5** Engine v2 path 输出不再包含 anchor | `_formatV2Result` 的 components DTO 去掉 anchor 字段 |
| **T6** 浏览器 Builder 镜像同步 API | JS 端 `.flask({id, anchor})` 内部走 layout 分支 |
| **T7** Reaction-utils 的 makeXxx 不再 hard-code anchor | 改为返回"无 anchor 纯拓扑元件"，anchor 由消费者（template 的 applyResult）补 |
| **T8** 测试迁移 | anchor 相关测试从 Spec 侧 describe 块移到 LayoutSpec 专用 describe |
| **T9** 文档 `docs/layout-spec.md` | 说明为什么分离、如何协同使用、迁移指南 |
| **T10** 全量 TSC + Jest 验证 | 0 新增 error · 446+ 测试全绿 |

### Out-of-Scope（本轮明确不做）

- ❌ 自动布局算法（force-directed / orthogonal routing）— 是 Level 1 的主题，下一轮
- ❌ 编辑器 UI（画布拖拽、元件面板、连线模式）— 是 B 的主题
- ❌ LayoutSpec 的 JSON 文件导入导出接口 — 未来需要再加
- ❌ anchor 迁移到后端持久化 — 未来需要再加
- ❌ 修改任何 solver / reaction 逻辑 — 这些原本就不读 anchor
- ❌ 修改 circuit.html / metal-acid-reaction.html 的视觉表现 — 保持用户可见零变化

---

## 风险评估

| # | 风险 | 严重度 | 缓解 |
|---|------|-------|------|
| R-1 | **向后兼容性破坏**：已有代码依赖 `component.anchor` 或 `spec.components[i].anchor` 会编译失败 | **P0** | 保留 `ComponentDecl.anchor?` 字段（@deprecated 标注）且字段仍可读写；`IExperimentComponent.anchor` 保留但 setter 写入内部默认值 {x:0,y:0}；真正改动仅"引入 LayoutSpec + sugar 分流"——老代码路径零破坏 |
| R-2 | **DTO 序列化漂移**：TS 侧与浏览器 JS 侧 Builder 的 DTO fingerprint 测试已锁定 `anchor` 字段，改 DTO 形状会让 T18-6 快照测试失败 | **P0** | 保留 `ComponentDTO.anchor` 字段（向后兼容）；Engine v2 output 的 components 项保留 anchor 为 `{x:0,y:0}` 占位；由消费者/编辑器通过 LayoutSpec 覆盖 |
| R-3 | **Reaction-utils 的 makeXxx 改动影响现有反应**：如 metalAcidRule 产生的 Bubble 之前 anchor=(0,0)，现在仍 (0,0)——看似无变化，但若反应多次产生同 id Bubble，anchor 永远是 (0,0) 堆叠 | **P1** | 反应产生的元件由 InteractionEngine 消费时 anchor 保持 (0,0) · 浏览器端 applyResult 的"bubbleStackY 堆叠"逻辑改为消费 LayoutSpec.entries（新机会：反应产生元件时同时 spawn LayoutEntry） |
| R-4 | **Fluent sugar API 改动破坏模板**：circuit.html/metal-acid-reaction.html 当前调用 `.battery({voltage, anchor: {...}})`——若 sugar 签名变则模板改 | **P0** | **Sugar API 严格保持不变**：`{id, anchor}` 两个 opts 字段保留；内部实现由把 anchor 写入 ComponentDecl 改为写入 LayoutSpec。API 兼容 = 模板零改 |
| R-5 | **浏览器镜像漂移**：JS `chemistry-builder.js` 的 toSpec() 与 TS 侧返回形状必须对齐 | **P1** | T18-6 快照测试保留；JS builder 新增 `toLayoutSpec()` 方法镜像 TS 侧；DTO fingerprint 依然检查 |
| R-6 | **测试覆盖不足导致回归**：anchor 分离涉及 20+ 文件，漏改测试可能意外删除 anchor 行为 | **P1** | 新增 `layout-spec.test.ts` 覆盖 LayoutSpec 类型定义 + AssemblyBundle 协同 + Fluent sugar 分流三类场景（≥10 测试） |
| R-7 | **API 边界膨胀**：增加 LayoutSpec 概念让装配层从 5 件套变 6 件套 | **P2** | 文档 `docs/layout-spec.md` 显式说明"LayoutSpec 是可选的并列资产，装配层核心仍是 5 件套"；Builder 不强制用户感知 LayoutSpec（sugar API 自动分流） |
| R-8 | **过度设计风险**：仅为 B 做前置就分离 LayoutSpec 是否过早？ | **P2** | 不过早。现状诊断已明确 3 症状（Engine 被迫 hash 坐标 / 模板硬编码 / Reaction 0,0 堆叠）都是今天就在受损。LayoutSpec 本身不引入运行时开销（可选字段），仅是类型级分离 |
| R-9 | **回滚成本**：若 Review Gate 拒绝 | **P2** | 新增概念独立在 `assembly/layout.ts`；回滚 = 删新文件 + revert 5 处 builder 改动，< 10min |
| R-10 | **下轮 B 方案变更导致 D 白做**：编辑器 framework 最终选别的架构（比如直接用第三方拖拽库），LayoutSpec 成孤儿 | **P1** | LayoutSpec 本身独立有价值（Engine 不吃 anchor + hash 不受视觉干扰），即使 B 换路线仍有收益；且 LayoutSpec shape 极简（`{componentId, anchor}[]`），和任何编辑器库都容易桥接 |

---

## AC 验收预定（最终由 TEST 阶段校核）

| AC | 要求 | 验收方法 |
|----|------|---------|
| **AC-D1 · 契约独立** | `LayoutSpec<D>` 与 `AssemblySpec<D>` 类型上完全独立，两者可分别序列化 | grep: `LayoutSpec` 定义里不 import `AssemblySpec` 类型 |
| **AC-D2 · Engine 不吃 anchor** | `ChemistryReactionEngine._computeV2` 的 `spec.components` 在序列化给 solver 之前 anchor 被剥离 | 新 test：compute({graph:spec-with-anchors}) → engine 内部 graph.toDTO().components 的 anchor 应为 {x:0,y:0} 占位 |
| **AC-D3 · Sugar API 保持不变** | `.battery({voltage, id, anchor})` / `.flask({id, volumeML, anchor})` 签名与上轮完全一致 | circuit.html / metal-acid-reaction.html 两个模板文件零修改 |
| **AC-D4 · LayoutSpec 可独立解析** | `LayoutSpec` 能单独 JSON.parse 后经 `isLayoutSpec` type guard | layout-spec.test 专测 |
| **AC-D5 · DTO fingerprint 稳定** | 上轮的 T18-6 快照测试继续通过（DTO 形状兼容） | 回归测试不变 |
| **AC-D6 · 零 solver/reaction 改动** | framework/solvers/** + framework/interactions/** + framework/domains/*/solver.ts + framework/domains/*/reactions/** 零行数改动 | grep audit |
| **AC-D7 · 浏览器零改动** | `circuit.html` + `metal-acid-reaction.html` 文件内容 diff 为空 | git diff |
| **AC-D8 · 无回归** | 上轮 446 测试 + 本轮新增（≥10）全绿 | jest 总量检查 |

---

## 关键前提假设

1. **装配层 5 件套（Spec/Validator/Assembler/Fluent/Errors）已稳定** — 上轮 34+10 测试验证通过，本轮在其基础上**追加** LayoutSpec 而非修改
2. **DTO 向后兼容优先于纯洁性** — 保留 `ComponentDTO.anchor: {x:0,y:0}` 字段而非移除，确保上轮 T18-6 快照测试零破坏
3. **Sugar API 稳定优先于实现改动** — 模板作者接触的 `.battery({voltage, anchor})` 调用方式不变
4. **"清理"≠"重构"** — 本轮不动 solver/reaction/base-framework；仅在 assembly/ 增加新概念 + builder 内部分流

---

## 关键边界（防止 Scope Creep）

- 本轮产出"LayoutSpec 类型 + Builder 内部分流"三件事就结束
- 不做任何 UI · 不做自动布局 · 不做持久化接口
- `AssemblyBundle` 在 TS 类型层面引入但不强制任何模板使用它——保留作为未来 B 阶段的"spec + layout 配对契约"位置
