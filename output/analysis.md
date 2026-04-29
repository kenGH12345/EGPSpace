# ANALYSE · B 阶段 · 编辑器 framework

> Session: `wf-20260428234611.` · 承接 D 阶段（LayoutSpec 解耦已完成）

---

## 根因 / Root Cause

### 用户终极目标（跨越 B/C 多阶段）
让**用户在浏览器里拖拽元件 + 点击连线**完成一个实验搭建——不写 TS/JS 代码，鼠标即可。等价于工业界的 **CircuitJS / EveryCircuit / PhET** 级别体验。

### 当前阻塞（即 B 必须解决的）
三层原子化重构完成 A→D 四轮之后，**全链条具备"程序化搭建"能力**但**零"交互式搭建"能力**：

| 能力 | 现状 | 缺口 |
|------|------|------|
| 元件抽象 + 端口 + 连接语义 | ✅ 完备（`AbstractComponent` / `DomainGraph` / `ConnectionDecl`） | 0 |
| 数据序列化（Spec 纯 POJO） | ✅ 完备（D 阶段分离为 `{spec, layout}` Bundle） | 0 |
| 程序化装配 DSL | ✅ 完备（`CircuitBuilder` / `ChemistryBuilder` fluent API） | 0 |
| 反应引擎循环 | ✅ 完备（`InteractionEngine.tick`） | 0 |
| **画布 + 拖拽放置元件** | ❌ 零 | **本轮目标** |
| **端口点击连线** | ❌ 零 | **本轮目标** |
| **Bundle 持久化 + 回放** | ❌ 零 | **本轮目标** |
| **自动布局（力导向/栅格）** | ❌ 零 | C 阶段（不在 B 范围） |
| **撤销/重做 undo/redo** | ❌ 零 | C 阶段 |
| **端口可视锚点** | ❌ 零（drawer 只画外形，不画端口点） | **本轮必须加** |

### 本质洞察

B 的**最小可行路径**不是"新做一个自由搭建平台"——而是**把现有 framework 暴露给 React Client Component，让用户通过 DOM 事件构造 `AssemblyBundle`**。这是交互层的**输入适配器**：鼠标事件 → Builder DSL 调用 → Bundle。输出端复用现有 engine/drawer/ComponentMirror 管线。

本质上：
```
old:  开发者编程 → CircuitBuilder.battery(...).toSpec() → Engine → Canvas
new:  用户鼠标 → EditorState → buildFromEditorState() → Bundle → Engine → Canvas
```

---

## 受影响位置

### 新增层（集中在 `src/components/editor/` + `src/lib/editor/`）

| 文件 | 类型 | 职责 |
|------|------|------|
| `src/lib/editor/editor-state.ts` | 新 · 类型 | `EditorState` 定义：placed components + draft connections + selection + active domain |
| `src/lib/editor/editor-state-reducer.ts` | 新 · 逻辑 | `applyEditorAction(state, action) → state` 纯 reducer（不含 React） |
| `src/lib/editor/bundle-from-state.ts` | 新 · 逻辑 | `EditorState → AssemblyBundle`：把 UI 状态转换为框架可消费的 Bundle |
| `src/lib/editor/editor-config.ts` | 新 · 类型/数据 | `EditorDomainConfig<D>`：每个 domain 注册 palette 元件列表 + port 视觉偏移 + 默认 props |
| `src/lib/editor/port-layout.ts` | 新 · 逻辑 | `getPortScreenPos(component, layout, portName, config)` 纯函数 |
| `src/lib/editor/persistence.ts` | 新 · 逻辑 | `saveBundle(key, bundle)` / `loadBundle(key)` localStorage 封装 |
| `src/lib/editor/domain-configs/circuit.ts` | 新 · 配置 | circuit palette（5 元件）+ 端口偏移表 |
| `src/lib/editor/domain-configs/chemistry.ts` | 新 · 配置 | chemistry palette（5 元件）+ 端口偏移表 |
| `src/components/editor/EditorShell.tsx` | 新 · 组件 | 顶层容器 · 左 palette · 中画布 · 右属性面板 |
| `src/components/editor/ComponentPalette.tsx` | 新 · 组件 | 左侧可拖拽元件列表（kind + 预览图标） |
| `src/components/editor/EditorCanvas.tsx` | 新 · 组件 | 中间画布：React/SVG 渲染 placed components + draft wires |
| `src/components/editor/PlacedComponent.tsx` | 新 · 组件 | 单个元件视图：外形 + 端口 hotspot + 选中态 |
| `src/components/editor/ConnectionLayer.tsx` | 新 · 组件 | 渲染所有 connection + draft wire |
| `src/components/editor/PropertyPanel.tsx` | 新 · 组件 | 右侧：选中元件时编辑 props（如 resistor.resistance） |
| `src/components/editor/RunControls.tsx` | 新 · 组件 | 运行按钮 · 触发 engine.compute(bundle) · 展示 perComponent 结果 |
| `src/app/editor/page.tsx` | 新 · 路由 | `/editor` 页面入口 · 承载 EditorShell |
| `src/lib/editor/__tests__/editor-state-reducer.test.ts` | 新 · 测试 | reducer 纯函数测试 |
| `src/lib/editor/__tests__/bundle-from-state.test.ts` | 新 · 测试 | state → Bundle 转换正确性 |
| `src/lib/editor/__tests__/persistence.test.ts` | 新 · 测试 | localStorage 保存/加载（mock storage） |
| `src/lib/editor/__tests__/port-layout.test.ts` | 新 · 测试 | 端口坐标计算 |

### 修改层（最小侵入）

| 文件 | 修改内容 |
|------|---------|
| `src/lib/framework/index.ts` | 顶层 re-export 已足（`AssemblyBundle` 已导出） — **零改动** |
| 现有 circuit.html / metal-acid-reaction.html | **零改动**（editor 是并列路径，不影响老实验模板） |
| `docs/editor-framework.md` | 新文档（B 阶段总览 + 扩展指南） |
| `docs/component-framework.md` | 索引新增 editor 章节链接 |
| `output/{analysis,architecture,execution-plan,code.diff,test-report,review-output,deploy-output}.md` | 工作流产出 |

### 复用既有（零改动但关键依赖）

| 文件 | 复用方式 |
|------|---------|
| `src/components/infinite-canvas.tsx` | pan/zoom 基础壳 · EditorCanvas 包在它里面 |
| `src/lib/framework/assembly/*` | FluentAssembly/Assembler/LayoutSpec/AssemblyBundle 作为输出契约 |
| `src/lib/framework/domains/*/assembly/*-builder.ts` | Builder DSL（editor reducer 最终调用它们产出 Bundle） |
| `src/lib/framework/domains/*/components.ts` | 运行时元件类（画布渲染需要 port 名字等元数据） |
| `src/lib/framework/components/registry.ts` | `componentRegistry.create(dto)` 产出元件实例 |
| `src/lib/engines/physics/circuit.ts` + `src/lib/engines/chemistry/reaction.ts` | RunControls 调用 `engine.compute({graph: bundle.spec})` 得 perComponent |
| `src/components/ui/*` | shadcn/ui 按钮/卡片/面板等 UI 原语 |

**估算总文件影响**：20 新 + 2 改 + 7 工作流 = **29 文件**

---

## 修改范围

### In-Scope（本轮 B 必做 · P0）

| # | 功能 | 描述 |
|---|------|------|
| **IS-1** | 画布基础 | 基于 `InfiniteCanvas` 的 pan/zoom · 栅格背景（无吸附） |
| **IS-2** | 元件面板 | 左侧列出当前 domain 的所有可用 kind（从 `EditorDomainConfig.palette`） |
| **IS-3** | 从面板拖到画布 | HTML5 drag API · drop 后 `placeComponent` action · 生成唯一 id |
| **IS-4** | 画布内移动元件 | mousedown + mousemove 改 `LayoutEntry.x/y`（实时） |
| **IS-5** | 端口视觉化 | 每个元件绘制端口小圆点（颜色区分 + hover 高亮） |
| **IS-6** | 端口点击连线 | 点端口 A → 鼠标跟随 draft 线 → 点端口 B 完成 connection · Esc 取消 |
| **IS-7** | 选择 + 删除 | 点选元件（高亮边框） · Delete/Backspace 删除 + 级联删相关 connection |
| **IS-8** | 属性面板编辑 | 选中元件后右侧显示其 props，input change 实时写入 state |
| **IS-9** | 运行按钮 | RunControls 调 `bundleFromState(state)` + `engine.compute(bundle.spec)` · 结果展示在侧边 |
| **IS-10** | 持久化 | "保存"按钮 → localStorage（key=`egpspace-editor-<domain>-<slot>`） · "加载"下拉 |
| **IS-11** | Domain 切换 | 顶部 tab 切换 `circuit` / `chemistry` · 切换清空当前 state（提示保存） |
| **IS-12** | 画布 → Bundle 导出 JSON | "导出"按钮 → 下载 .json（Bundle 格式） |
| **IS-13** | JSON → 画布导入 | "导入"按钮 → 读取 .json → validate → 恢复 state |

### Out-of-Scope（明确不做 · 留给 C）

- ❌ 自动布局算法（力导向、栅格吸附）
- ❌ 正交布线（wire 走 L 形直角）
- ❌ 撤销/重做 undo/redo（stack-based）
- ❌ 多选（框选/多选批量操作）
- ❌ 缩略图 minimap
- ❌ 美化（过渡动画、主题色定制、元件图形精修）
- ❌ 分享/协作（URL 分享、多人协作）
- ❌ 服务端持久化（只做 localStorage，不连后端）
- ❌ 模板库（仅基础空白画布起步，不含"载入示例实验"按钮——但可通过导入 JSON 实现）
- ❌ 端口吸附（mouse hover 自动吸附到最近端口）
- ❌ 连线样式定制（颜色/粗细/类型）

---

## 关键设计约束（Acceptance Criteria）

| ID | 约束 | 验证方式 |
|----|------|---------|
| **AC-B1** | `EditorState` 是纯数据 · 可 JSON.stringify | 测试 roundtrip |
| **AC-B2** | `editor-state-reducer.ts` 无 React 依赖 · 可在 Node 测试 | jest 直接 import |
| **AC-B3** | `bundleFromState(state)` 产出的 Bundle 能被现有 Assembler 成功 `assembleBundle` | 测试 assembler 不抛错 |
| **AC-B4** | Editor 导出的 Bundle JSON 与 Builder DSL 产出的 Bundle JSON 字节完全一致（同样 input） | fingerprint 比对 |
| **AC-B5** | circuit.html / metal-acid-reaction.html 零 byte 变动 | git diff 空 |
| **AC-B6** | framework/{components,solvers,interactions,assembly} 零修改 | git diff --stat 空 |
| **AC-B7** | `EditorDomainConfig` 可扩展：新 domain 只需加 1 个 config 文件 | 类型签名审查 |
| **AC-B8** | 新增测试 ≥ 20 · 总量 465 → ≥485 全绿 | jest |
| **AC-B9** | TSC 零错误 | `npx tsc --noEmit` |
| **AC-B10** | 运行按钮 → engine.compute → 画布显示 perComponent 数值（电流/电压/反应摩尔等） | 浏览器 Runbook |
| **AC-B11** | 保存到 localStorage + 刷新页面 + 加载 → state 完全恢复 | 浏览器 Runbook |
| **AC-B12** | 端口点击连线正确形成 ConnectionDecl（端口名+组件 id 匹配） | 测试 + Runbook |
| **AC-B13** | Port 视觉偏移来自 `EditorDomainConfig.portLayout` · drawer 可独立演化 | 代码审查 |
| **AC-B14** | 属性面板编辑 props 实时反映在画布 drawer | Runbook |

---

## 风险评估

### P0 风险（4 条）

| ID | 风险 | 影响 | 缓解 |
|----|------|------|------|
| **R-1** | React 渲染开销：placed components > 50 时 mousemove 卡顿 | UX 劣化 · 工程师放弃 | ① PlacedComponent 用 React.memo · props 用 ref 稳定 · ② mousemove 走 requestAnimationFrame 节流 · ③ 本轮不做大规模实验（< 50 元件内是 sweet spot） |
| **R-2** | DOM 坐标系 vs 画布逻辑坐标系混淆 | 点错位置/端口抓不到 | 抽 `screenToCanvas(e, canvasRef) → {x,y}` 单一函数 · 所有事件都走它 · 写测试 |
| **R-3** | Bundle 导出导入 roundtrip 不等价（Map 序列化、undefined 丢失等） | 加载后 state 损坏 | `persistence.ts` 用 JSON schema 验证 · 新增 roundtrip 测试（AC-B4） |
| **R-4** | Engine.compute 对 editor 空画布崩溃（spec.components=[]） | 运行按钮闪退 | `RunControls` 加前置 validation · 空画布禁用运行按钮 |

### P1 风险（3 条）

| ID | 风险 | 缓解 |
|----|------|------|
| **R-5** | `EditorDomainConfig` 和 framework Builder DSL 出现字段漂移 | config 从 `componentRegistry` 派生元件 kind 列表 · 新增元件 config 加不上就报错 |
| **R-6** | localStorage 满了（>5MB）保存失败 | try/catch 包保存逻辑 · UI 显示"保存失败，容量已满"提示 |
| **R-7** | 拖拽时鼠标移出画布后丢失事件 | mouseup 监听挂在 `window` 不是 canvas |

### P2 风险（3 条）

| ID | 风险 | 缓解 |
|----|------|------|
| **R-8** | 连线交叉杂乱（无自动布线） | 本轮明确不做，文档里注明"请用户自行编排" |
| **R-9** | iPad/触屏事件不完善 | 本轮只保证桌面体验 · 文档注明"建议桌面使用" |
| **R-10** | 刷新页面丢失未保存 state | 本轮不做自动保存 · UI 提示"记得手动保存" |

---

## Domain 分层（架构约束延续）

| 层 | 归属 | 能否访问 React？ | 能否访问 framework？ |
|----|------|----------------|-------------------|
| `src/lib/framework/*` | 纯 TS · 通用装配 | ❌ 不得 | — |
| `src/lib/engines/*` | 纯 TS · 计算引擎 | ❌ 不得 | ✅ |
| `src/lib/editor/*` | 纯 TS · editor 数据/逻辑层（reducer/state/config/persistence） | ❌ 不得（保持可测） | ✅ |
| `src/components/editor/*` | React TSX · UI | ✅ 可以 | ✅ 通过 `@/lib/editor` 和 `@/lib/framework` |

> **这是本轮最关键的架构约束**：`src/lib/editor/` 必须纯 TS 零 React，让 reducer 和 bundle 转换可独立测试。

---

## 总结

B 是 D 的直接延续。D 把"数据契约"擦干净了，B 把"交互层"接上去。核心 ~20 新文件集中在 `src/lib/editor/` 和 `src/components/editor/` 两个目录，framework 核心**零修改**（AC-B6），老实验模板**零改动**（AC-B5），不碰服务端。

14 AC / 10 风险（4 P0 + 3 P1 + 3 P2）/ 13 In-Scope 功能 / 11 Out-of-Scope 明确划线 / 29 文件影响。
