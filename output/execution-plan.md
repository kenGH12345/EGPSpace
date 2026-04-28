# Execution Plan · anchor-LayoutSpec 解耦（D）

> Session: `wf-20260428153150.`
> Stage: PLAN
> 14 tasks / 5 waves / ~4h est

---

## 依赖图

```mermaid
graph TD
  W0_START([Wave 0 · 类型层 + FluentAssembly 分流])
  T1[T-1 · assembly/layout.ts<br/>LayoutSpec + LayoutEntry + AssemblyBundle + helpers]
  T2[T-2 · FluentAssembly<br/>_layout 字段 + sugar 分流 + toLayout/toBundle]
  T3[T-3 · Assembler<br/>assembleBundle + legacy decl.anchor warn]
  T4[T-4 · Spec.ComponentDecl.anchor<br/>@deprecated + JSDoc]
  T5[T-5 · assembly barrel + framework/index.ts re-export]

  W1_START([Wave 1 · 跨层适配])
  T6[T-6 · base.ts<br/>IExperimentComponent.anchor @deprecated]
  T7[T-7 · reaction-utils.ts<br/>makeXxx 去掉 anchor hardcode]
  T8[T-8 · Circuit/Chemistry Builder<br/>继承新分流 + sugar 签名零改验证]
  T9[T-9 · 浏览器 builder.js 镜像<br/>_layout + toLayoutSpec]
  T10[T-10 · Engine v2.0 输出清理<br/>components DTO anchor={0,0} 占位]

  W2_START([Wave 2 · 测试新增 + 迁移])
  T11[T-11 · layout-spec.test.ts<br/>新增 ≥10 测试 覆盖 AC-D1/D4/D9-D14]
  T12[T-12 · 迁移老测试<br/>assembly.test + circuit-assembly + chemistry-* 5 文件]

  W3_START([Wave 3 · 文档 + 全量验证])
  T13[T-13 · docs/layout-spec.md<br/>+ component-framework.md 索引]
  T14[T-14 · TSC + Jest 全量 · AC 审计]

  W0_START --> T1 --> T2
  T2 -.GATE.-> W0_CHECK{FluentAssembly<br/>toSpec+toLayout<br/>正确?}
  W0_CHECK -->|pass| T3
  W0_CHECK -->|fail| T2
  T3 --> T4 --> T5
  T5 --> W1_START
  W1_START --> T6
  T6 --> T7
  T6 --> T8
  T6 --> T9
  T8 --> T10
  T9 --> T10
  T10 --> W2_START
  W2_START --> T11
  T11 --> T12
  T12 --> W3_START
  W3_START --> T13 --> T14
```

---

## Wave 0 · 类型层 + FluentAssembly 分流（90 min）

### T-1 · `assembly/layout.ts` 新文件（20 min）

**File**: `src/lib/framework/assembly/layout.ts`

**Contents**:
```ts
// LayoutEntry + LayoutSpec + AssemblyBundle 类型
// + isLayoutSpec / emptyLayout / layoutLookup / isAssemblyBundle helpers
```

**AC**:
- ✅ 不 import `AssemblySpec` 类型（AC-D1）
- ✅ 文件 < 120 行
- ✅ 每个 exported symbol 有 JSDoc
- ✅ `isLayoutSpec(value): value is LayoutSpec` runtime type guard
- ✅ `layoutLookup(layout): Map<string, ComponentAnchor>` O(1) 查询视图

**Risk**: 类型命名冲突 → 所有 export 前缀 `Layout`/`Bundle` 唯一化

---

### T-2 · `assembly/fluent.ts` 内部分流（30 min）

**File**: `src/lib/framework/assembly/fluent.ts`

**Changes**:
- 新增 `protected readonly _layout: LayoutSpec<D>` 字段（ctor 初始化为 `emptyLayout(domain)`）
- 新增私有 `_writeAnchor(componentId, anchor?)` helper：`push` 到 `_layout.entries`（去重：同 id 后写覆盖）
- 改造 `add(kind, props, opts?)`：
  ```
  // BEFORE:
  this._spec.components.push({ id, kind, props, anchor: opts?.anchor });
  // AFTER:
  this._spec.components.push({ id, kind, props });  // anchor 不再写入 spec
  if (opts?.anchor) this._writeAnchor(id, opts.anchor);
  ```
- 新增 `toLayout(): LayoutSpec<D>` — 返回 `{...this._layout}` 浅拷贝
- 新增 `toBundle(): AssemblyBundle<D>` — 返回 `{spec: this.toSpec(), layout: this.toLayout()}`
- `toSpec()` 保持行为（返回纯 Spec，components 项不含 anchor）

**AC**:
- ✅ 调用 `.add('kind', props, {id:'X', anchor:{x:1,y:2}})` 之后：`toSpec().components[0].anchor === undefined` AND `toLayout().entries[0] === {componentId:'X', anchor:{x:1,y:2}}`
- ✅ 不加 anchor 的 add：`toLayout().entries.length === 0`
- ✅ 同 id 两次 add（极端案例）: layout 只保留最后一条

**Risk**: TS 编译因 `readonly _layout` 的内部 push 违规 → 用 `as` cast 或改非 readonly（保持 `private`）

---

### 🚦 **Wave 0 Gate**：T-1 + T-2 必须先通过再进 Wave 1

用一个最小新测试快速验证：
```ts
// quick smoke
const b = new CircuitBuilder();
b.battery({voltage: 6, id: 'B1', anchor: {x: 40, y: 110}});
expect(b.toSpec().components[0].anchor).toBeUndefined();
expect(b.toLayout().entries.find(e => e.componentId === 'B1').anchor).toEqual({x: 40, y: 110});
```

---

### T-3 · `assembly/assembler.ts` 新增 `assembleBundle` + legacy 兼容（15 min）

**Changes**:
- 新增 `assembleBundle(bundle, opts?): DomainGraph<C>` — 等价于 `assemble(bundle.spec, opts)`（layout 不参与 assemble，仅伴随）
- 在 `assemble(spec)` 的 Step 3（build components）前：扫描 `spec.components[]`，若有 `decl.anchor` → `console.warn` once + 不 throw
- 不修改其他逻辑

**AC**:
- ✅ `assembleBundle({spec, layout})` 返回 graph，etalon equal `assemble(spec)` 结果
- ✅ `assemble(spec)` 遇 `decl.anchor` 发 warn（spy test 验）
- ✅ 老 test（literal spec with decl.anchor）继续通过（通过 console.warn，不 throw）

---

### T-4 · `assembly/spec.ts` · `ComponentDecl.anchor` 标 @deprecated（5 min）

**Changes**:
- 仅修改 JSDoc：加 `@deprecated LayoutSpec 取代；本字段保留用于向后兼容`
- **不删除字段**（避免编译失败）

**AC**: JSDoc 修改生效（IDE hover 显示 deprecation）

---

### T-5 · barrel · `assembly/index.ts` + `framework/index.ts`（10 min）

**Changes**:
- `assembly/index.ts`：新增 re-export `LayoutSpec` / `LayoutEntry` / `AssemblyBundle` / `isLayoutSpec` / `emptyLayout` / `layoutLookup` / `isAssemblyBundle`
- `framework/index.ts`：顶层一并 re-export

**AC**: 从 `@/lib/framework` import 新符号成功

---

## Wave 1 · 跨层适配（55 min）

### T-6 · `components/base.ts` · @deprecated 标注（5 min）

**Changes**:
- `IExperimentComponent.anchor` JSDoc 加 `@deprecated`
- `AbstractComponent` ctor 的 anchor 参数保留 + 默认 `{x:0,y:0}`
- `ComponentDTO.anchor` 保留（占位）

**AC**: JSDoc 生效；不破坏编译

---

### T-7 · `reaction-utils.ts` + `overload-bulb.ts` 去 anchor hardcode（15 min）

**Files**:
- `src/lib/framework/domains/chemistry/reaction-utils.ts`
- `src/lib/framework/domains/circuit/reactions/overload-bulb.ts`

**Changes**: `makeReagent/makeBubble/makeSolid` 中的 `anchor: { x: 0, y: 0 }` 硬编码删除；factory 构造器已有默认值 `{x:0,y:0}`，所以组件创建行为不变

**AC**:
- ✅ grep: `reactions/` + `reaction-utils.ts` 中 0 处 `anchor:` 硬编码
- ✅ T13-4（上轮）金属+酸 Bubble spawn 仍通过
- ✅ circuit overload-bulb 上轮测试仍通过

---

### T-8 · Circuit/Chemistry Builder 确认继承新分流（20 min）

**Files**:
- `src/lib/framework/domains/circuit/assembly/circuit-builder.ts`
- `src/lib/framework/domains/chemistry/assembly/chemistry-builder.ts`

**Changes**:
- **Sugar 签名保持完全不变**（AC-D3）
- 由于 FluentAssembly.add 已内部分流（T-2），Builder 子类无需修改
- **仅需**确认：chemistry-builder 的 `pour/drop/observe` 中对 `opts.anchor` 的传递正确（这些方法内部调 `this.add('reagent', props, {id: opts.id, anchor: opts.anchor})`）

**AC**:
- ✅ circuit-builder.ts + chemistry-builder.ts 方法签名 git diff 无改动
- ✅ Sugar API 字段列表（TSDoc + 方法 signature）与上轮一致

---

### T-9 · 浏览器 JS builder 镜像（25 min）

**Files**:
- `public/templates/_shared/circuit-builder.js`
- `public/templates/_shared/chemistry-builder.js`

**Changes**:
- 加 `this._layout = { domain: 'circuit'/'chemistry', entries: [] }`
- `_add(kind, props, opts)` 内部：`spec.components.push({id, kind, props})` (去掉 anchor) + `if (opts.anchor) this._layout.entries.push({componentId: id, anchor: opts.anchor})`
- 新增 `toLayoutSpec()` 方法
- `components()` 返回的列表保持含 anchor（供渲染；因为浏览器 builder 同时是数据层和视图层，不必严格分离）

**AC**:
- ✅ 浏览器 `toSpec()` 产出的 components 不含 anchor（保持与 TS 侧 DTO 一致）
- ✅ 浏览器 `toLayoutSpec().entries` 长度 = 带 anchor 的 sugar 调用次数
- ✅ `components()` 方法仍有 anchor 字段（for render）

**Risk**: R-5（浏览器漂移）→ T-11 加 cross-builder fingerprint test

---

### T-10 · Engine v2 输出清理（15 min）

**Files**:
- `src/lib/engines/physics/circuit.ts` (`_formatV2Result`)
- `src/lib/engines/chemistry/reaction.ts` (`_computeV2` 的 components 输出)

**Changes**:
- `components` 输出项显式附 `anchor: { x: 0, y: 0 }`（占位）
- 不改其他 field

**AC**:
- ✅ 新 test：`engine.compute({graph: spec-with-anchors-somehow})` → result.values.components 所有 anchor 为 `{x:0,y:0}`
- ✅ 上轮 T18-6 DTO fingerprint 测试继续通过
- ✅ 上轮 circuit.html 浏览器渲染不变（因为浏览器 render 用的是本地 builder.components() 而非 engine 返回的 components）

---

## Wave 2 · 测试新增 + 迁移（90 min）

### T-11 · `layout-spec.test.ts` 新增（30 min）

**File**: `src/lib/framework/__tests__/layout-spec.test.ts`

**12 测试**（覆盖 14 AC 中的 D1/D2/D4/D9-D14）:
1. **AC-D1** · layout.ts 文件不 import AssemblySpec → 通过 `readFileSync` + regex 验证
2. **AC-D4** · `isLayoutSpec` type guard 正例 + 3 反例（null / 非 object / 缺 entries）
3. **AC-D9** · `JSON.parse(JSON.stringify(layout))` 深等 layout
4. **AC-D10a** · `assembleBundle({spec})` 不含 layout 正常工作
5. **AC-D10b** · `assembleBundle({spec, layout: emptyLayout('circuit')})` 正常工作
6. **AC-D11** · Builder 5 次 `.add(...,{id, anchor})` 后 `toLayout().entries.length === 5`
7. **AC-D12** · spy `console.warn`；Assembler.assemble(spec with decl.anchor) 发 warn
8. **AC-D13** · `toBundle().spec` + `toBundle().layout` 分别通过 isAssemblySpec / isLayoutSpec
9. **AC-D14** · `makeReagent('r','X',0.1,'aq').anchor === {x:0,y:0}`
10. **AC-D2 (核心)** · `circuitEngine.compute({graph: spec})` 返回的 `values.components[i].anchor === {x:0,y:0}`
11. **Sugar 分流** · `.battery({voltage, anchor})` → spec 不含 anchor + layout 含 anchor 条目
12. **跨 builder fingerprint** · TS builder 和 JS 侧（通过 readFile + 简单 regex 检查 JS 内部写 `_layout`）两端都有 layout 分流代码

---

### T-12 · 迁移老测试（60 min）

**Files**:
- `src/lib/framework/__tests__/assembly.test.ts`
- `src/lib/framework/domains/circuit/__tests__/circuit-assembly.test.ts`
- `src/lib/framework/domains/chemistry/__tests__/chemistry-components.test.ts`
- `src/lib/framework/domains/chemistry/__tests__/chemistry-assembly.test.ts`
- `src/lib/framework/domains/chemistry/__tests__/chemistry-reactions.test.ts`

**Migrations**:
- 所有 `expect(component.anchor).toEqual({x, y})` → 改为 `expect(builder.toLayout().entries.find(e=>e.componentId===id)?.anchor).toEqual({x,y})` 或**直接删除**（如断言本就不关键）
- 所有 `expect(spec.components[i].anchor)...` → 同理迁移
- 如有 `expect(dto.anchor)...` 场景：改断言 `{x:0, y:0}` 占位（engine 输出）或从 layout 查

**AC**:
- ✅ 5 个测试文件迁移后跑 jest 全部通过
- ✅ 上轮 446 测试数不降低（允许等价合并导致 -1 ~ -2）
- ✅ 无新增 `anchor` 硬编码于 spec 断言

---

## Wave 3 · 文档 + 全量验证（30 min）

### T-13 · 文档（15 min）

**Files**:
- `docs/layout-spec.md` 新建（~150 行）
- `docs/component-framework.md` 顶部索引加 `Layout Spec` 链接

**Contents of layout-spec.md**:
- 为什么分离 anchor（3 症状复述）
- LayoutSpec / AssemblyBundle 类型定义
- Builder 分流示意
- 迁移指南（"如果你以前这样写，现在这样写"）
- FAQ：何时用 toSpec / toLayout / toBundle

---

### T-14 · TSC + Jest 全量 + AC 审计（15 min）

**Commands**:
1. `npx tsc --noEmit` · 0 errors
2. `npx jest` · 446+10 = 456+ 全绿
3. AC 审计（手动 grep）:
   - AC-D1: `grep 'AssemblySpec' src/lib/framework/assembly/layout.ts` → 0 hits
   - AC-D3: `git diff -- src/lib/framework/domains/*/assembly/*-builder.ts` 只含 JSDoc 级改动
   - AC-D6: `git diff --shortstat -- src/lib/framework/solvers src/lib/framework/interactions src/lib/framework/domains/*/solver.ts src/lib/framework/domains/*/reactions` → 仅 T-7 的 reaction-utils 一处
   - AC-D7: `git diff -- public/templates/physics/circuit.html public/templates/chemistry/metal-acid-reaction.html` → 0 bytes

---

## 验收门槛（14 AC 对应）

| AC | 任务 | 证据位置 |
|----|------|---------|
| AC-D1 | T-11 测试 1 | 自动化 grep |
| AC-D2 | T-10 + T-11 测试 10 | jest |
| AC-D3 | T-8 | git diff |
| AC-D4 | T-11 测试 2 | jest |
| AC-D5 | T-12 迁移 | 回归测试 |
| AC-D6 | T-14 审计 | manual grep |
| AC-D7 | T-14 审计 | git diff |
| AC-D8 | T-14 全量 | jest |
| AC-D9 | T-11 测试 3 | jest |
| AC-D10 | T-11 测试 4/5 | jest |
| AC-D11 | T-11 测试 6 | jest |
| AC-D12 | T-11 测试 7 | jest with spy |
| AC-D13 | T-11 测试 8 | jest |
| AC-D14 | T-11 测试 9 | jest |

---

## 风险与缓解

| # | 风险 | 级别 | 缓解 |
|---|------|------|------|
| R-A | T-2 FluentAssembly.add 改动影响上轮 Builder 行为 | P0 | Wave 0 Gate 先用小 smoke test 验证 toSpec/toLayout；fail 则回 T-2 |
| R-B | T-12 测试迁移量大，漏改 | P0 | 5 个文件逐个跑 `npx jest <file>`，逐个确认；不批量提交 |
| R-C | Engine v2 输出占位 anchor 破坏上轮 fingerprint | P0 | T-10 与 T-11 测试 10 并行验证；若破坏即刻 T-12 同步调整 |
| R-D | 浏览器 JS builder 与 TS 漂移 | P1 | T-11 测试 12 双向 fingerprint；T-9 同 session 写 |
| R-E | @deprecated 标注在老代码中触发 lint 警告流 | P2 | 仅加 JSDoc 标注，不启用 `noImplicitDeprecation` |

---

## 预估时间表

| Wave | Tasks | 子时 | 累计 |
|------|-------|------|------|
| Wave 0 | T-1~T-5 | 90 min | 1.5h |
| Wave 1 | T-6~T-10 | 55 min | 2.4h |
| Wave 2 | T-11+T-12 | 90 min | 3.9h |
| Wave 3 | T-13+T-14 | 30 min | **4.4h** |

---

## 明确不做（Out-of-Scope）

- ❌ 自动布局算法（force-directed / orthogonal routing）— B 阶段主题
- ❌ 编辑器 UI / 画布拖拽 — B 阶段主题
- ❌ LayoutSpec 持久化到后端 / JSON import/export — 下次讨论
- ❌ 修改任何 solver / reaction 逻辑（T-7 只删 hardcode，不改算法）
- ❌ 修改 `circuit.html` / `metal-acid-reaction.html` 任何一行
- ❌ `ComponentDecl.anchor` 字段删除（本轮仅 @deprecated）
