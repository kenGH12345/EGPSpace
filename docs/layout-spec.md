# LayoutSpec · 视觉坐标解耦契约

> 相关文档：[Component Framework](./component-framework.md) · [Assembly Framework](./assembly-framework.md) · [Chemistry Domain](./domains/chemistry.md)

## 为什么分离 `anchor`

在此契约之前，`AssemblySpec.components[i].anchor` 与 `IExperimentComponent.anchor` 把**视觉坐标**和**拓扑数据**耦合在同一个对象中。这带来三个具体症状：

1. **Engine 被迫携带视觉字段**：化学/电路引擎只需 topology，却必须把 anchor 带进序列化管线、postMessage 负载、hash 计算。用户拖一下元件，spec hash 变化，所有基于 hash 的缓存失效——尽管拓扑没变。
2. **模板必须硬编码坐标**：`circuit.html` 和 `metal-acid-reaction.html` 里每个元件都写死了 `anchor: {x: 40, y: 110}`。用户自由搭建（未来 B 编辑器的前置条件）在当前契约下不可能——普通用户不会手算坐标。
3. **反应产生的元件 anchor 固定为 (0,0)**：`makeBubble/makeReagent/makeSolid` 硬编码 anchor，渲染层不得不在 `applyResult` 中偷偷补位（如 `bubbleStackY` hack）。

**一句话**：anchor 是**渲染关注点**，不该出现在**数据层契约**里。

## 新契约

### 核心类型

```ts
// 视觉坐标的独立容器
interface LayoutEntry {
  componentId: string;
  anchor: ComponentAnchor;
}

interface LayoutSpec<D extends ComponentDomain = ComponentDomain> {
  domain: D;
  entries: LayoutEntry[];
  metadata?: LayoutMetadata;
}

// 可选的组合容器（留给未来 B 编辑器）
interface AssemblyBundle<D> {
  spec: AssemblySpec<D>;
  layout?: LayoutSpec<D>;
  metadata?: Record<string, unknown>;
}
```

### 分流规则

| 消费者 | 需要什么 | 从哪里拿 |
|--------|---------|---------|
| Solver / InteractionEngine | topology + props | `AssemblySpec` |
| Engine v1 / v2 compute | `spec.components` + `spec.connections` | `AssemblySpec`（**不看 anchor**） |
| Renderer / Canvas | topology + 坐标 | `AssemblySpec` + `LayoutSpec`（或 `Builder.components()` 视图） |
| 持久化 / 编辑器 | 两者合一 | `AssemblyBundle` |

## Builder Sugar API：零改动

**以前**：
```ts
new CircuitBuilder()
  .battery({ voltage: 6, id: 'B1', anchor: { x: 40, y: 110 } })
  .build(circuitAssembler);
```

**现在**（签名完全不变）：
```ts
new CircuitBuilder()
  .battery({ voltage: 6, id: 'B1', anchor: { x: 40, y: 110 } })
  .build(circuitAssembler);
```

内部行为改变：
- `spec.components[i]` 不再含 `anchor` 字段
- anchor 写入并列的 `_layout.entries[]`
- `toSpec()` 产出纯净 spec
- 新增 `toLayout()` 取 LayoutSpec
- 新增 `toBundle()` 取 `{spec, layout}`

## 浏览器侧镜像

`public/templates/_shared/circuit-builder.js` 和 `chemistry-builder.js` 同步实现分流：

```js
const b = new CircuitBuilder()
  .battery({ voltage: 6, id: 'B1', anchor: { x: 40, y: 110 } });

b.toSpec();        // { domain, components: [{id, kind, props}], connections: [] }  // 无 anchor
b.toLayoutSpec();  // { domain, entries: [{componentId: 'B1', anchor: {x:40,y:110}}] }
b.components();    // [{id, kind, props, anchor: {x:40,y:110}}]  // 渲染视图（合并 layout 后的 anchor）
```

**关键**：`components()` 是**合并视图**，供 Canvas 渲染；`toSpec()` 是**纯净数据**，供 Engine 消费。模板代码`ComponentMirror.renderAll(ctx, circuit.components(), ...)` 保持零改动。

## 迁移指南

对绝大多数调用者来说**不需要迁移**。如果你以前写：

| 以前 | 现在 |
|------|------|
| `builder.toSpec().components[i].anchor` | `builder.toLayout().entries.find(e => e.componentId === id)?.anchor` |
| `component.anchor` （读） | 仍可读，值为 `{x:0, y:0}` 占位；真实坐标用 LayoutSpec |
| `spec.components[i].anchor` 字段 | 字段仍可写（@deprecated），Assembler 会 console.warn |
| `makeReagent(...).anchor` | 仍可读，值为 `{x:0, y:0}` 占位 |

## 向后兼容保证

| 兼容承诺 | 机制 |
|---------|------|
| 旧模板（`.battery({anchor})`）不改动仍能工作 | Sugar 签名保持；内部分流透明 |
| 旧 `ComponentDecl.anchor` 字段仍被接受 | 保留为 `@deprecated` 可选字段 |
| `component.anchor` 读取仍返回值 | 默认 `{x:0, y:0}` 占位 |
| T18-6 DTO fingerprint 测试 | `components[i].anchor` 占位为 `{x:0,y:0}`，shape 稳定 |
| 老 test 无需修改 | 所有现有断言都是结构级，零具体坐标硬断言 |

## Engine 端契约验证

```ts
// 给 engine 传带 anchor 的 spec
const spec = builder.toSpec();  // 不含 anchor，但假设有的话...
engine.compute({ graph: spec });
// → engine 的 perComponent 输出绝对不含 anchor/x/y 字段
// → Assembler 遇到 legacy decl.anchor 会 console.warn（不 throw）
```

## FAQ

**Q: 我应该把 `component.anchor` 彻底从代码里删掉吗？**
A: 现阶段不必。字段保留为向后兼容占位。下一轮 B 阶段（编辑器 framework）可能正式移除。

**Q: LayoutSpec 能独立 JSON.stringify 吗？**
A: 可以。这是分离的主要收益之一——为未来"只保存布局方案"或"只分享拓扑"留接口。

**Q: 为什么不直接删 `ComponentDecl.anchor` 字段？**
A: 破坏了上轮 test 里的 literal spec 写法（如 `{id, kind, props, anchor: {x:0, y:0}}`）。保留 @deprecated 字段让老代码零改动运行，console.warn 引导新代码迁移。

**Q: 反应产生的组件 anchor 仍是 (0,0)，这不是还没解决吗？**
A: 这是**本轮的正确状态**。PLACEHOLDER_ANCHOR 的意图在 `reaction-utils.ts` 里有明确注释。B 阶段的编辑器会把"反应产生元件"这个事件 → 自动在 LayoutSpec 里补一个合理位置（比如源 flask 上方）。本轮只把**架构清理**做完。

## 关键文件

| 文件 | 角色 |
|------|------|
| `src/lib/framework/assembly/layout.ts` | LayoutSpec / AssemblyBundle / helpers 定义 |
| `src/lib/framework/assembly/fluent.ts` | Builder 内部分流（`_layout` + `toLayout/toBundle`） |
| `src/lib/framework/assembly/assembler.ts` | `assembleBundle` + legacy `decl.anchor` warn |
| `public/templates/_shared/circuit-builder.js` | 浏览器 Builder 镜像（同分流逻辑） |
| `public/templates/_shared/chemistry-builder.js` | 浏览器 Builder 镜像（同分流逻辑） |
| `src/lib/framework/__tests__/layout-spec.test.ts` | 19 测试覆盖 AC-D1 ~ D14 |

## 下一步（B 阶段预告）

本轮产出是 B（编辑器 framework）的前置条件。B 阶段将引入：
- 画布拖拽 + 吸附网格
- 元件面板（拖拽源）
- 端口点击连线模式
- `LayoutSpec` 持久化到 localStorage / 后端
- `AssemblyBundle` 作为强制契约（编辑器输出）

所有这些都可以**零改动**消费当前的 `LayoutSpec` 类型——这是分离带来的真实投资回报。
