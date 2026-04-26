# EGPSpace 物理实验模板 — 实现检查清单

> 为后续新实验开发提供的标准化检查清单

---

## 一、新实验创建前检查 (Pre-Development)

### 1. 学科分类
- [ ] 确认学科分类（物理/化学/生物）
- [ ] 选择正确的共享层：
  - 物理 → `experiment-core.js` + `physics-utils.js`
  - 化学 → `experiment-core.js` + (待创建 `chemistry-utils.js`)
  - 生物 → `experiment-core.js` + (待创建 `biology-utils.js`)

### 2. 架构选择
- [ ] 确认使用新架构 (`experiment-core.js`) 还是旧架构 (`physics-core.js`)
  - 新实验建议一律使用新架构
  - 旧架构仅用于已有模板的兼容

### 3. 渲染方式选择
- [ ] Canvas 2D vs SVG 决策：
  - 实时动画 (>30fps) → Canvas
  - 静态/准静态 + 需要交互 → SVG
  - 大量粒子/波形 → Canvas
  - 参考设计模式文档第 4 和第 8 节

---

## 二、模板结构检查 (Template Structure)

### 1. HTML 结构
- [ ] 包含 `<div class="eureka-root">` 根容器
- [ ] 统计面板使用 `.eureka-grid-3` 或 `.eureka-grid-2`
- [ ] Canvas 容器使用 `.eureka-canvas-wrapper` + 模板特定后缀
- [ ] 参数卡片使用 `.eureka-card` + `id="params-root"`
- [ ] 公式展示使用 `.eureka-formula` 三段式结构

### 2. CSS 样式
- [ ] 引入 `ui-core.css`
- [ ] 使用 `eureka-` 前缀的组件类名
- [ ] 自定义样式仅限模板特有的视觉效果（如背景渐变）

### 3. 脚本引用
- [ ] 共享层脚本引用顺序正确：
  - 新架构：`experiment-core.js` (+ `physics-utils.js`)
  - 旧架构：`physics-core.js`
- [ ] 脚本在 IIFE 中执行 (`(function() { 'use strict'; ... })()`)

---

## 三、生命周期检查 (Lifecycle)

### 1. 初始化序列
- [ ] `EurekaHost.setTemplateId(TEMPLATE_ID)` — 第一步
- [ ] `bindParam()` — 声明所有参数
- [ ] `EurekaCanvas.setupHiDPI(canvas, cssW, cssH)` — Canvas 初始化
- [ ] `EurekaHost.onHostCommand(handler)` — 注册命令处理器
- [ ] `EurekaHost.emitReady(supportedParams)` — 最后一步，只调一次

### 2. emitReady 参数一致性
- [ ] `supportedParams` 数组包含所有 `bindParam` 注册的参数名
- [ ] 无遗漏、无多余

---

## 四、参数系统检查 (Parameter System)

### 1. bindParam 声明
- [ ] 每个参数都有完整的配置：`min, max, step, defaultValue, unit, label`
- [ ] `container` 指向正确的 DOM 元素
- [ ] 数值精度 `step` 合理（整数参数 step=1，小数参数 step=0.01）

### 2. Segmented 控件
- [ ] 数据映射表定义完整（如 MEDIUMS / MOTION_MODES）
- [ ] 映射表包含 `label` 显示名称
- [ ] 默认选中项有 `.active` 类
- [ ] 点击事件正确更新 state + DOM + emitParamChange

### 3. 参数可用性控制
- [ ] `applyMode()` 函数实现完整
- [ ] 控件可见性切换正确（`display: none / ''`）
- [ ] 隐藏参数自动设为默认值
- [ ] 公式展示区同步更新

---

## 五、计算逻辑检查 (Computation)

### 1. compute() 函数
- [ ] 纯函数，只依赖 state 计算结果
- [ ] 返回结构化的结果对象 p
- [ ] 边界情况处理（除零保护、clamp、NaN 检查）
- [ ] 数值精度合理（toFixed 位数与 step 精度一致）

### 2. 物理公式正确性
- [ ] 公式与 `physics-utils.js` 中的函数一致
- [ ] 单位转换正确（角度弧度互转）
- [ ] 特殊状态检测（全反射、平衡态、短路等）

---

## 六、渲染逻辑检查 (Rendering)

### 1. render() 函数
- [ ] 纯渲染，接收 compute() 的结果
- [ ] 每帧清屏 (`EurekaCanvas.clear()`)
- [ ] HiDPI 处理完成 (`setupHiDPI`)

### 2. Canvas 绑制
- [ ] 坐标系正确（Y 轴方向、原点位置）
- [ ] 颜色使用 CSS 变量语义（蓝=正、红=负/危险、绿=安全）
- [ ] 文字标注完整（标签、数值、单位）
- [ ] 箭头指向正确

### 3. 动态 Y 轴缩放（如有图表）
- [ ] 根据参数动态计算 Y 轴范围
- [ ] `|| 1` 兜底防零除
- [ ] padding 合理（~15%）
- [ ] 零线始终可见

### 4. 动画
- [ ] 使用 `requestAnimationFrame`（非 setInterval）
- [ ] 插值平滑（lever 模板标杆实现）
- [ ] dt 计算正确（delta time in seconds）

---

## 七、SVG 渲染检查（如适用）

### 1. SVG 命名空间
- [ ] `xmlns="http://www.w3.org/2000/svg"` 声明正确
- [ ] `viewBox` 设置合理

### 2. SVG 动态更新
- [ ] 使用 `setAttribute` 更新属性
- [ ] 无内存泄漏（移除旧元素）

---

## 八、交互逻辑检查 (Interaction)

### 1. 滑块事件
- [ ] `wire()` 辅助函数绑定
- [ ] `input` 事件（非 `change`）实现实时更新
- [ ] 状态同步：slider → state → compute → render → emit

### 2. 拖拽交互（如适用）
- [ ] `pointerdown / pointermove / pointerup / pointercancel` 四事件完整
- [ ] `setPointerCapture` 防止拖出 Canvas
- [ ] 拖拽时不发送 `param_change`（仅 `result_update`）
- [ ] 释放后恢复物理默认

### 3. Host 命令处理
- [ ] `set_param` — 单参数设置
- [ ] `set_params` — 批量参数设置
- [ ] `reset` — 重置到默认状态
- [ ] `pause / resume` — 渲染循环控制
- [ ] 白名单校验：未知命令类型忽略

---

## 九、通信协议检查 (Communication)

### 1. emitResultUpdate
- [ ] 包含所有关键物理量
- [ ] 数值类型正确（number，非 string）
- [ ] 特殊值编码约定（如 -1 表示不适用）

### 2. emitParamChange
- [ ] 仅在用户操作时触发
- [ ] 不在程序化修改时触发

### 3. emitReady
- [ ] 只调用一次
- [ ] 在所有初始化完成后调用
- [ ] supportedParams 完整

---

## 十、测试检查 (Testing)

### 1. 内置单元测试
- [ ] 每个物理公式至少 1 个测试
- [ ] 边界值测试（min, max, 0）
- [ ] 特殊状态测试（全反射、平衡等）
- [ ] 使用 `assertEquals(actual, expected, tolerance)` 模式

### 2. 手动功能测试
- [ ] 每个参数滑块拖动 → 统计值更新 + Canvas 更新
- [ ] Segmented 切换 → 参数可用性切换 + 公式更新 + Canvas 更新
- [ ] 拖拽交互（如适用）→ 物体跟随 + 释放后恢复
- [ ] Host 命令测试（set_param / reset / pause / resume）
- [ ] HiDPI 显示测试

---

## 十一、安全检查 (Security — 三重锁)

### 1. Prompt 禁令
- [ ] 物理常量不可被 LLM 修改
- [ ] 核心算法逻辑不被篡改

### 2. 路由分发
- [ ] `onHostCommand` 仅处理白名单命令
- [ ] 未知参数名被忽略

### 3. 白名单校验
- [ ] `bindParam` 的 `clamp` 确保值在 `[min, max]` 内
- [ ] 即使 LLM 发送越界值也被截断

---

## 十二、代码质量检查 (Code Quality)

### 1. 风格一致性
- [ ] 缩进风格与项目一致（2 空格或 4 空格或 Tab）
- [ ] 大括号风格一致（K&R 或 Allman）
- [ ] 注释语言一致（中文或英文，与技术栈分析文档保持一致）

### 2. 注释规范
- [ ] 仅注释 "why"，不注释 "what"
- [ ] 最大密度：每 10 行代码 1 条注释
- [ ] 无 JSDoc 在私有/内部函数上
- [ ] 无段落分隔横幅注释

### 3. 无冗余代码
- [ ] 无注释掉的代码块
- [ ] 无不可达分支
- [ ] 无重复函数（检查 `physics-utils.js` 中是否已有）

---

## 快速检查清单（精简版）

```
□ 正确的共享层引用 (experiment-core.js / physics-core.js)
□ setTemplateId 第一步调用
□ bindParam 声明完整 + emitReady 参数一致
□ compute() 纯函数 + render(p) 纯渲染
□ setupHiDPI Canvas 初始化
□ wire() 事件绑定
□ onHostCommand 命令处理 + applyParam 白名单
□ Segmented 映射表 + applyMode() 完整
□ 动态 Y 轴缩放 + || 1 兜底
□ emitResultUpdate 关键物理量完整
□ 内置单元测试通过
□ 三重锁机制生效
□ 代码风格与项目一致
```
