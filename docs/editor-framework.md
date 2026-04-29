# Editor Framework · B 阶段

> 交互式实验搭建器 · 位于 `/editor` 路由 · 基于 EditorDomainConfig 插件点

---

## 概览

编辑器 framework 是在 **framework (元件/图/求解/装配/反应)** 之上的交互层。
它把"鼠标事件"转换为"Builder DSL 调用"，最终产出标准 `AssemblyBundle`。

```
┌─ 浏览器 /editor 路由
│  ├─ 左 Palette  (ComponentPalette.tsx)
│  ├─ 中 Canvas    (EditorCanvas.tsx · Canvas drawer + DOM port overlay)
│  └─ 右 Property  (PropertyPanel.tsx)
│
│  鼠标事件 → dispatch(EditorAction) → applyEditorAction → EditorState
│                                       (纯函数 zero React, jest 可测)
│
│  Run/Save/Export → bundleFromState(state) → AssemblyBundle
│                    → runEditorBundle(domain, bundle) → Engine.compute
└─
```

## 分层

| 层 | 位置 | 职责 | React? |
|---|------|------|--------|
| **数据** | `src/lib/editor/` | EditorState · Reducer · Bundle 转换 · 持久化 · 端口布局 · Engine 分派 | ❌ 零 React |
| **配置** | `src/lib/editor/domain-configs/` | 每个 domain 一个 config：palette / portLayout / drawers / defaultProps | ❌ |
| **绘制** | `src/lib/editor/drawers/` | Canvas 2D drawer 函数 (TS 镜像 JS 版 drawer) | ❌ |
| **UI** | `src/components/editor/` | Shell · Palette · Canvas · PropertyPanel · RunControls | ✅ |
| **路由** | `src/app/editor/page.tsx` | Next.js 页面入口 | ✅ |

## EditorState 形状

```ts
EditorState<D> {
  domain: D;
  placed: Array<{
    id: string;              // auto-generated "<kind>-N"
    kind: string;
    props: Record<string, unknown>;
    anchor: { x, y, rotation? };  // 画布坐标
  }>;
  connections: ConnectionDecl[];
  selection: { kind:'none'|'component'|'connection'; ... };
  draftWire: { from:{componentId,port}, cursor:{x,y} } | null;
  camera: { offset:{x,y}, zoom };
}
```

**设计要点**：
- `anchor` 保留在 `placed` 内（reducer 写起来更自然）；**导出 Bundle 时才拆到 LayoutSpec**
- `selection / draftWire / camera` 是 **UI-only** 状态，不进入导出的 Bundle
- **纯数据** · JSON.stringify-safe · 便于保存/回放

## Reducer Action

所有 UI 交互通过 `applyEditorAction(state, action)` 这条路径：

```ts
type EditorAction =
  | { type: 'placeComponent', kind, position, defaults?, id? }
  | { type: 'moveComponent', id, delta }
  | { type: 'setComponentAnchor', id, anchor }
  | { type: 'selectComponent', id|null }
  | { type: 'selectConnection', index|null }
  | { type: 'deleteSelection' }                    // 级联删关联连线
  | { type: 'updateProp', id, key, value }
  | { type: 'startWire', componentId, port, cursor }
  | { type: 'updateWireCursor', x, y }
  | { type: 'finishWire', componentId, port }      // 自动拒绝自环+重复
  | { type: 'cancelWire' }
  | { type: 'removeConnection', index }
  | { type: 'setCamera', offset?, zoom? }
  | { type: 'switchDomain', domain }                // 重置所有状态
  | { type: 'loadBundle', bundle };                 // 回放 AssemblyBundle
```

## AssemblyBundle 导出

```ts
bundleFromState(state) → AssemblyBundle
{
  spec: { domain, components, connections },         // engine 消费（无 anchor）
  layout: { domain, entries[componentId, anchor] },  // renderer 消费
}
```

**AC-B4 保障**：editor 导出的 Bundle JSON 与 Builder DSL 产出的 Bundle 字节完全一致（`JSON.stringify` roundtrip 测试）。

## EditorDomainConfig · 扩展新 domain

假设要加 optics domain：

```ts
// src/lib/editor/drawers/optics-drawers.ts
export const mirrorDrawer: CanvasDrawer = (ctx, c, v, selected) => { ... };

// src/lib/editor/domain-configs/optics.ts
export const opticsEditorConfig: EditorDomainConfig<'optics'> = {
  domain: 'optics',
  displayName: '光学',
  palette: [
    { kind: 'mirror', displayName: '平面镜', icon: '🪞', defaultProps: {...}, ... },
    ...
  ],
  portLayout: { mirror: { left: {dx:0,dy:30}, right:{dx:60,dy:30} } },
  drawers: { mirror: mirrorDrawer, ... },
  connection: { stroke: '#F59E0B', strokeWidth: 1 },
  validateBundle: (n, c) => n === 0 ? ['画布空'] : [],
};

// src/lib/editor/domain-configs/index.ts
// 加一行 import + 在 EDITOR_DOMAIN_CONFIGS 里注册
```

**editor 核心代码（EditorShell / EditorCanvas / reducer / bundle-from-state）零改动** = AC-B7 兑现。

## 持久化

- **localStorage**：key = `egpspace-editor-<domain>-<slot>`
- **JSON 导入导出**：`.json` 文件走浏览器下载/上传
- 容量限制 ~5MB · 超限返回 `{ok:false, reason:'quota-exceeded'}` 而非 throw

## Run 流程

```
Click ▶ 运行
  → config.validateBundle(placedCount, connectionCount)
  → bundleFromState(state) → AssemblyBundle
  → runEditorBundle(domain, bundle) → engine.compute(bundle.spec)
  → extractPerComponent(result) → Record<id, values>
  → drawer 下一帧时用 values 绘制 (overlay current/voltage/pH/...)
```

## 撤销 / 重做（C 阶段）

编辑器使用 **高阶 reducer 包装（`withHistory`）** 实现撤销/重做，对业务 reducer 零侵入。

### 架构

```
EditorShell.useReducer(
  withHistory(applyEditorAction, HISTORY_OPTIONS),  ← 高阶包装
  emptyHistory(emptyEditorState(domain))
)

HistoryState<EditorState> = {
  past: EditorState[],    // 过去快照栈（最多 50 条）
  present: EditorState,   // 当前状态（UI 读这个）
  future: EditorState[],  // redo 栈（正常 action 会清空）
}
```

### Squash 策略（避免 push 风暴）

连续的 `moveComponent` / `updateProp` / `updateWireCursor` / `setCamera` 在 500ms 时间窗内对**同一目标**合并为 1 条历史。算法：比较 `actionType + targetId + 时间戳`。

好处：
- 拖动 100 次 mousemove 只留 1 条 undo 条目
- 输入框连续打字只留 1 条 undo

不被 squash：`placeComponent` / `deleteSelection` / `finishWire` / `loadBundle` 等「里程碑」action 一次一条。

### 快捷键

| 键位 | 动作 |
|------|------|
| `Ctrl+Z` / `Cmd+Z` | 撤销 |
| `Ctrl+Shift+Z` / `Cmd+Shift+Z` | 重做 |
| `Ctrl+Y` | 重做 |

输入框 / Textarea / contentEditable 内**不拦截**（避免误触覆盖浏览器原生行为）。

### 内存保护

`maxPast = 50` → 超过时最早的按 FIFO 丢弃。50 步 × ~KB/快照 ≈ 50KB 量级可忽略。

### 扩展新 squash action

在 `EditorShell.HISTORY_OPTIONS.squashActions` 加入 action.type 即可。

## 自动布局（C 阶段）

解决两个问题：① 导入无 layout 的 JSON 时元件挤在 (0,0) · ② 手动摆乱后一键整理。

### 算法

| 算法 | 特点 | 使用场景 |
|------|------|---------|
| **Grid**（默认） | 确定性 · 按 N 计算 cols=min(ceil(√N), 6) · cell=120×100 | `loadBundle` 兜底 · 快速占位 |
| **Force**（Fruchterman-Reingold） | Mulberry32 PRNG 稳定 seed（同 ids → 同结果）· 100 迭代 · temperature 衰减 | 手动点「力导向布局」· 呈现连接拓扑 |

### 触发

- **自动**：`loadBundle` action 内部检测「无 layout + 所有 anchor=(0,0)」→ grid 兜底
- **手动**：header 的「⊞ 自动布局」下拉菜单 → grid / force

⚠️ 「有 layout」或「任何非零 anchor」→ **不覆盖**用户坐标（数据保护）

### 扩展新算法

1. 在 `src/lib/editor/layout/` 加 `my-algo.ts`，导出 `myAlgo(input: LayoutInput): LayoutOutput`
2. 修改 `layout/auto-layout.ts` 的 switch 加一个 case
3. 修改 `LayoutAlgorithm` 类型加字面量
4. 在 `RunControls` 下拉菜单加 `<option>`

### 性能

- Grid: O(N) · 1ms 级别
- Force: O(iter × N²) = O(100 × N²) · 100 元件 < 2000ms（测试覆盖）

## UX 细节（D 阶段）

### 元件几何边界 · `componentBounds`

所有"元件占地面积"的概念（hit-test、hover 检测、选中框）都走 `componentBounds(component, palette)` 单点真相。它根据 palette entry 的 `hintSize` 计算 AABB，fallback 为 50×40。

```ts
import { componentBounds, isPointInBounds } from '@/lib/editor';
const b = componentBounds(placedComp, config.palette);
// { x, y, width, height }
if (isPointInBounds(canvasPt, b)) { /* clicked */ }
```

**好处**：
- 替代硬编码 50×40（B 阶段的近似实现）
- 化学域 60×60 大元件正确命中
- 未来 alignment guides / marquee selection / auto-framing 统一走它

### 拖动网格对齐 · `snapGrid`

每个 domain config 可声明 `snapGrid: number`（默认 20），用户拖动元件时 anchor 自动对齐到此粒度。

```ts
// circuit.ts / chemistry.ts
export const xxxEditorConfig = {
  ...,
  snapGrid: 20, // 20px grid
};
```

**规则**：
- 仅 `moveComponent` action 按 snap 对齐
- `setComponentAnchor` / `loadBundle` / `placeComponent` **保留精确坐标**（保护导入的 JSON 原始值）
- `snapGrid = 0` 或 undefined 关闭 snap
- 拖动结束的 anchor 一定是 snapGrid 的整数倍

### 悬停反馈 · hover state

`state.hoveredId` 跟踪当前悬停的元件 id，drawer 接收 `hovered?: boolean` 参数在元件 AABB 外画浅蓝虚线（blue-300，2px padding）。

- **Selected 优先级高于 hovered**：选中态覆盖 hover 视觉（避免两框叠加）
- `hoverComponent` action 进 `history.ignoreActions` 白名单 · **永不污染 undo 栈**（连续 mousemove 不会把历史打爆）
- 鼠标离开画布时自动清除 hover（`onMouseLeave`）

### history `ignoreActions` 机制

新增通用机制：特定 action type 进 `ignoreActions` 集合 → 更新 present 但完全不影响 past/future。用于 transient UI state（hover、光标位置等）。

```ts
const HISTORY_OPTIONS = {
  maxPast: 50,
  squash: { ... },
  ignoreActions: new Set(['hoverComponent']), // 永不进 undo 栈
};
```

未来可扩展：`updateWireCursor`（连线过程中光标跟随）同类场景。

### `CanvasDrawer` 签名扩展

```ts
// Before (B 阶段)
type CanvasDrawer = (ctx, c, values, selected) => void;

// After (D 阶段 · 可选参数向后兼容)
type CanvasDrawer = (ctx, c, values, selected, hovered?) => void;
```

所有现有 drawer 已更新。新写 drawer 建议用统一 helper `drawHoverFrame(ctx, bounds)`（或各 domain 自己的 `drawInteractionFrame(ctx, ax, ay, selected, hovered)` wrapper）。

## Out-of-Scope（本轮明确不做）


- 多选 / 框选
- 端口吸附
- minimap
- 服务端持久化 / 多人协作
- 触屏 full support
- 美化动画
- 分支撤销树（Git 式）
- 撤销跨会话持久化（history 仅内存）
- Drawer DDL（消除 JS/TS 两端双写）

这些留给 **D 阶段 / 用户体验迭代**。

## 快速开始

```bash
bash ./scripts/dev.sh       # 启动开发预览 (port 5000)
# 访问 http://localhost:5000/editor
```

**基本操作**：
1. 从左侧面板拖元件到画布
2. 点击元件端口小圆点开始连线，点击另一端口完成
3. Esc 取消连线 · Delete 删除选中元件/连线
4. 右侧编辑属性 · 点击 ▶ 运行查看数值
5. 保存/加载/导出 JSON 共享方案

## 相关文档

- **[Architecture Constraints](./architecture-constraints.md)** — 硬约束 + 受控松动条款（E 阶段新增）
- **[Assembly Framework](./assembly-framework.md)** — 装配层底座
- **[Layout Spec](./layout-spec.md)** — anchor 解耦契约（D 阶段）
- **[Component Framework](./component-framework.md)** — 元件抽象与 domain 扩展
- **[Chemistry Domain](./domains/chemistry.md)** — 第二个 framework domain 实例
