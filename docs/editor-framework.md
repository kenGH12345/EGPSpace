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

## Out-of-Scope（本轮明确不做）

- 撤销/重做 undo/redo
- 自动布局 / 正交布线
- 多选 / 框选
- 端口吸附
- minimap
- 服务端持久化 / 多人协作
- 触屏 full support
- 美化动画

这些留给 C 阶段 / 用户体验迭代。

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

- **[Assembly Framework](./assembly-framework.md)** — 装配层底座
- **[Layout Spec](./layout-spec.md)** — anchor 解耦契约（D 阶段）
- **[Component Framework](./component-framework.md)** — 元件抽象与 domain 扩展
- **[Chemistry Domain](./domains/chemistry.md)** — 第二个 framework domain 实例
