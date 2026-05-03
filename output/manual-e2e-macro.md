# 手动 E2E 脚本 · 自定义元件（Macro）功能验证

> **目的**：在浏览器中逐步验证 Phase 1-3 完成后的「多选 → 封装 → 复用 → 嵌套 → 解散 → 持久化」完整闭环。
>
> **范围**：E 阶段 8 个验收标准（AC-1 ~ AC-8）。
>
> **执行者**：手动测试人员。每步之后检查「期望结果」，失败立即记录并停止。
>
> **预计时间**：15-20 分钟。
>
> **预置条件**：
> 1. 运行 `npm run dev` 启动 Next.js 开发服务器
> 2. 在浏览器打开任一 circuit 实验页（例如 `/experiments/ohms-law` 或等效入口）
> 3. 等待 Canvas 可见、Palette 左侧列出「原子组件」分组

---

## Scene 1 · 基础多选与工具栏（AC-2 局部）

### 步骤

| # | 操作 | 期望结果 |
|---|------|----------|
| 1.1 | 从左侧 Palette 拖拽 2 个电阻（resistor）到画布 | 画布出现 `resistor-1` 和 `resistor-2` 两个组件 |
| 1.2 | 点击画布上 `resistor-1` | 组件高亮（蓝色边框）；底部状态栏显示 `选中: resistor-1` |
| 1.3 | **按住 Shift** 点击 `resistor-2` | 两个组件都高亮；画布顶部中央浮现 SelectionToolbar，显示 "已选 2 个组件"；底部状态栏显示 `已选 2 个组件` |
| 1.4 | 再次按住 Shift 点击 `resistor-1` | 选中数变为 1；Toolbar 消失（回到单选）；底部状态栏 `选中: resistor-1` |
| 1.5 | 按 Shift 再次点击 `resistor-2` 使两者都被选中 | Toolbar 再次出现并显示 "已选 2 个组件" |

✅ 验收：Shift+Click 可递增/递减多选；单选自动取消 multi 状态；Toolbar 只在 multi 时可见。

---

## Scene 2 · 封装 Dialog 校验（AC-2 + AC-3）

### 步骤

| # | 操作 | 期望结果 |
|---|------|----------|
| 2.1 | 在 multi 状态下点击 Toolbar 上的「📦 封装…」按钮 | 弹出 MacroEncapsulateDialog，标题「封装为自定义元件」 |
| 2.2 | 观察 Dialog 顶部的预览信息 | 显示 "内部组件 **2** 个 · 导出端口 **N** 个"（N 视连线而定：未连线时 N=0）|
| 2.3 | 直接点击「封装」按钮（name 为空） | 按钮灰色禁用；黄色提示 "元件名称不能为空" |
| 2.4 | 在「名称」输入框输入 `RC 低通 Filter!` | kind 自动生成为 `macro:rc-filter`（特殊字符被 slugify 去除，多段空白转单 `-`）|
| 2.5 | 手动修改 kind 为 `resistor`（非 macro: 前缀）| 黄色提示 "kind 必须匹配 \"macro:小写字母或数字开头的短横线串\""；按钮禁用 |
| 2.6 | 把 kind 恢复为 `macro:rc-filter`，在「描述」填入 `两电阻串联` | 错误提示消失；「封装」按钮变蓝可点 |
| 2.7 | 点击「封装」 | Dialog 关闭；画布上原两个电阻消失，出现 1 个深色圆角方块 `📦 RC 低通 Filter`；底部状态栏显示 `✅ 已封装: RC 低通 Filter` |
| 2.8 | 观察左侧 Palette | 多出一个「我的元件」分组，含一条 `📦 RC 低通 Filter` 条目 |

✅ 验收：Dialog 校验 3 种错误路径工作；slugify 正确；封装后画布只剩 composite、Palette 新增分组条目。

---

## Scene 3 · 复用与连线（AC-4 局部 + AC-1 无回归）

### 步骤

| # | 操作 | 期望结果 |
|---|------|----------|
| 3.1 | 从「我的元件」分组拖拽 `📦 RC 低通 Filter` 到画布空白处 | 画布上出现第二个 composite 实例（与原实例不同 id） |
| 3.2 | 再拖 1 个原子电阻到画布 | 画布现有 3 个组件：2 个 composite + 1 个 resistor |
| 3.3 | 点击 composite 的端口小圆点（底部黄色），拖向 resistor 的端口 | 出现连线 draft；到达目标端口时完成连接 |
| 3.4 | 连线完成后观察自动运行面板（如已启用） | 没有引擎错误；结果面板显示计算值（具体值取决于 domain） |

✅ 验收：macro 可作为组件反复放置；端口连线和原子组件完全一致；引擎求解无报错。

---

## Scene 4 · 嵌套封装（AC-6）

### 步骤

| # | 操作 | 期望结果 |
|---|------|----------|
| 4.1 | 沿用 Scene 3 的画布；Shift+Click 把一个 composite 实例和原子 resistor 都选中 | Toolbar 显示 "已选 2 个组件" |
| 4.2 | 点击「📦 封装…」，名称填 `Outer`，提交 | 画布上 2 个被选组件消失，出现 `📦 Outer`；Palette 多一条 `📦 Outer` 条目（现在有 2 条自定义元件）|
| 4.3 | 打开浏览器 DevTools Console，观察是否有引擎错误 | 无错误；如果页面有自动求解结果，数值稳定 |
| 4.4 | 展开 Palette 的「我的元件」分组 | 同时有 `RC 低通 Filter` 和 `Outer`；后者内部嵌套前者 |

✅ 验收：嵌套封装可创建；SpecFlattener 递归展平由 T-3 和 unit tests 已保证（本步骤只看 UI 无报错）。

---

## Scene 5 · 解散（Unpack）AC-7

### 步骤

| # | 操作 | 期望结果 |
|---|------|----------|
| 5.1 | 单选画布上的 `📦 Outer` composite | Toolbar 切换显示：`元件 📦 Outer` + 「🔓 解散」按钮 |
| 5.2 | 点击「🔓 解散」 | composite 消失；画布上出现它的内部组件（1 个 `📦 RC 低通 Filter` 嵌套实例 + 1 个 resistor），状态栏显示 `🔓 元件已解散` |
| 5.3 | 单选恢复出来的 `📦 RC 低通 Filter` | Toolbar 再次显示「🔓 解散」按钮 |
| 5.4 | 点击「🔓 解散」第二次 | 该 composite 也被拆开；画布上 2 个原子电阻出现 |
| 5.5 | 观察 Palette 的「我的元件」分组 | 两个定义仍然存在（解散不删除定义，只是拆开当前实例）|

✅ 验收：解散递归可用；元件定义保留；id 自动加前缀防冲突（如 `macro:outer-1:macro:rc-filter:r1`）。

---

## Scene 6 · Palette 删除定义（AC-3 局部）

### 步骤

| # | 操作 | 期望结果 |
|---|------|----------|
| 6.1 | 鼠标悬停 Palette 中 `RC 低通 Filter` 条目 | 右侧出现灰色 ✕ 删除按钮 |
| 6.2 | 点击 ✕ | 弹出浏览器 confirm 对话框："删除元件定义「RC 低通 Filter」？…" |
| 6.3 | 点确认 | 该条目从 Palette 消失 |
| 6.4 | 再次尝试删除 `Outer`（在画布上已经没有 outer 实例的情况下）| 同样正常删除 |
| 6.5 | 重新封装一个新 macro，然后**不要**解散它就在 Palette 里点 ✕ | 因为还有实例在画布上，删除被静默拒绝（Palette 条目仍在）|

✅ 验收：删除 UI 可用；受保护的删除（在用实例）不会破坏引用完整性。

---

## Scene 7 · 持久化（AC-8）

### 步骤

| # | 操作 | 期望结果 |
|---|------|----------|
| 7.1 | 画布保持至少 1 个 macro 定义 + 1 个 composite 实例 | - |
| 7.2 | 点击工具栏的「保存」或等效按钮（触发 bundleFromState → localStorage） | 状态栏反馈 "已保存到槽位 N" |
| 7.3 | 打开 DevTools Application → Local Storage，查找 EGP 相关 key | 值为 JSON，字段含 `spec`, `layout`, `macros`；`macros` 是对象，键为 `macro:xxx` |
| 7.4 | 刷新页面（F5）| - |
| 7.5 | 加载刚才保存的槽位 | 画布恢复：composite 实例在原位置；Palette 的「我的元件」分组恢复所有定义 |
| 7.6 | 继续操作已恢复的 macro（放置新实例、解散等）| 功能完整可用 |

✅ 验收：JSON round-trip 成功；新存档含 macros 字段；加载后功能无退化。

---

## Scene 8 · 向后兼容（AC-8 · 旧存档兼容）

### 步骤

| # | 操作 | 期望结果 |
|---|------|----------|
| 8.1 | 在 DevTools Console 执行： `localStorage.setItem('egp-bundle-circuit-0', JSON.stringify({spec:{domain:'circuit',components:[{id:'r1',kind:'resistor',props:{}}],connections:[]}}))` | 模拟一个 T-6 之前的旧存档（无 macros 字段）|
| 8.2 | 在编辑器中加载槽位 0 | 画布出现 r1；Palette 的「我的元件」分组显示空态提示 "多选 2+ 组件后点击「封装」生成"；Console 无报错 |

✅ 验收：旧存档不报错加载；`state.macros` 默认为 `{}`；新功能保持禁用（无 macro 可用）。

---

## 整体通过标准

| AC | 描述 | 对应 Scene |
|----|------|-----------|
| AC-1 | 画布基础组合 | Scene 3.3-3.4 |
| AC-2 | 多选 + 封装按钮 | Scene 1, 2 |
| AC-3 | macros 入库 + 调色板 | Scene 2.7-2.8, 6 |
| AC-4 | 复用与属性编辑 | Scene 3.1-3.2（复用部分） |
| AC-5 | 运行展平 | Scene 3.4（自动求解无错）|
| AC-6 | 嵌套递归展平 | Scene 4 |
| AC-7 | 子图编辑 / 解散 | Scene 5 |
| AC-8 | 持久化存档 | Scene 7, 8 |

---

## 失败记录模板

```
Scene: [编号]
Step: [编号]
期望: [复制期望结果]
实际: [观察到的行为]
Console 错误: [有/无；如有则贴出]
重现步骤: [精确步骤以便其他人验证]
```

提交失败单时请带上：浏览器版本、操作系统、是否启用了任何 ad-blocker / React-DevTools 等可能干扰的扩展。

---

## 附录 · 快速命令

**启动开发服务器**（默认端口 3000）：
```bash
npm run dev
```

**跑所有 macro 相关单测**（离线验证，不需要浏览器）：
```bash
npx jest macro
```

**检查 bundle 序列化**（Node REPL 示例）：
```javascript
const { emptyEditorState, applyEditorAction, bundleFromState } = require('./src/lib/editor');
let s = emptyEditorState('circuit');
// ... place / encapsulate / ...
console.log(JSON.stringify(bundleFromState(s), null, 2));
```
