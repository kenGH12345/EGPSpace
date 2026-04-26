# EGPSpace 物理实验模板 — 技术栈归纳

> 基于 10 个物理实验模板 + 3 层共享架构的深度分析

---

## 1. 架构模式：3 层共享模型 (3-Layer Shared Model)

```
┌──────────────────────────────────────────────────────┐
│  Layer 1: experiment-core.js (跨学科通用共享层)        │
│  ├── Host 通信 (postMessage 协议 v1.0)                │
│  ├── 模板生命周期 (setTemplateId, emitReady, emitError)│
│  ├── 参数系统 (bindParam 自动生成 DOM 控件)            │
│  ├── 渲染循环管理 (startRenderLoop, stopRenderLoop)    │
│  └── Host 命令处理 (set_param, reset, pause, resume)  │
├──────────────────────────────────────────────────────┤
│  Layer 2: {subject}-utils.js (学科专用工具层)          │
│  ├── physics-utils.js (物理学科专用)                   │
│  │   ├── 物理常量 (G, PI)                             │
│  │   ├── 力学公式库 (buoyancyForce, gravityForce...)   │
│  │   ├── 运动学公式 (displacement, finalVelocity...)   │
│  │   ├── 波动公式 (waveDisplacement, superposition...) │
│  │   ├── 电磁学公式 (faradayEMF, ohmVoltage)          │
│  │   ├── 光学公式 (snellsLaw)                         │
│  │   ├── Canvas 渲染辅助 (drawArrow, drawAxis...)     │
│  │   └── 内置单元测试系统                              │
│  └── (预留：chemistry-utils.js, biology-utils.js)     │
├──────────────────────────────────────────────────────┤
│  Layer 3: template-specific logic (模板专属逻辑)       │
│  ├── HTML 结构 + CSS 样式                             │
│  ├── 状态管理 (本地 state 对象)                        │
│  ├── 计算-渲染分离 (compute → render)                 │
│  └── 用户交互绑定 (wire, pointer events)              │
└──────────────────────────────────────────────────────┘
```

---

## 2. 通信协议：postMessage v1.0

### 消息格式
```json
{
  "source": "eureka-experiment",
  "type": "<message_type>",
  "templateId": "<template_id>",
  "protocolVersion": "1.0",
  "timestamp": "<ISO 8601>",
  // ... type-specific fields
}
```

### 消息类型
| 方向 | type | 用途 | 关键字段 |
|------|------|------|----------|
| Template → Host | `ready` | 模板初始化完成 | `supportedParams` |
| Template → Host | `param_change` | 参数变化通知 | `param`, `value` |
| Template → Host | `result_update` | 计算结果更新 | `results` (JSON object) |
| Template → Host | `interaction` | 用户交互事件 | `kind`, `data` |
| Template → Host | `error` | 错误上报 | `message`, `code` |
| Host → Template | `set_param` | 设置单个参数 | `param`, `value` |
| Host → Template | `set_params` | 批量设置参数 | `params` (object) |
| Host → Template | `reset` | 重置到默认状态 | — |
| Host → Template | `pause` | 暂停渲染循环 | — |
| Host → Template | `resume` | 恢复渲染循环 | — |
| Host → Template | `highlight` | 高亮特定元素 | — |

### 安全约束
- 消息源过滤：`event.origin !== window.location.origin` 时忽略
- 消息来源校验：`data.source !== 'eureka-experiment'` 时忽略
- 类型校验：`typeof data.type !== 'string'` 时忽略
- 命令白名单：`['set_param', 'set_params', 'reset', 'pause', 'resume', 'highlight']`

---

## 3. 参数系统：bindParam 声明式参数绑定

### 设计理念
通过 `bindParam(name, config)` 声明参数，框架自动生成对应的 DOM 控件（slider + label + value display），并管理事件绑定和状态同步。

### 配置项
```javascript
bindParam(name, {
  min,             // 最小值
  max,             // 最大值
  step,            // 步长（默认 1）
  defaultValue,    // 默认值（默认 = min）
  unit,            // 单位（默认 ''）
  label,           // 显示标签（默认 = name）
  container,       // 父容器 DOM（默认 #eureka-params-root 或 body）
  onChange,        // 变化回调
})
```

### 生成的 DOM 结构
```html
<div class="eureka-control">
  <div class="eureka-control-header">
    <span class="eureka-control-label">{label}</span>
    <span class="eureka-control-value">
      <span id="v-{name}">{value}</span> {unit}
    </span>
  </div>
  <input id="ctl-{name}" class="eureka-slider" type="range"
         min="{min}" max="{max}" step="{step}" value="{defaultValue}">
</div>
```

### 返回的 API
```javascript
const param = bindParam('name', config);
param.get()            // 获取当前值
param.set(value, emit) // 设置值（emit 控制是否通知 Host）
param.element          // DOM 元素引用
param.input            // input 元素引用
param.config           // 原始配置
```

### 内部工具函数
- `clamp(v, min, max)` — 限制范围
- `snap(v, step)` — 对齐到步长
- `fmt(v, step)` — 格式化数值（自动推断小数位数）

---

## 4. 渲染策略：Canvas 2D vs SVG

### 选择标准
| 特征 | Canvas 2D | SVG |
|------|-----------|-----|
| 适用场景 | 连续动画、大量元素、实时更新 | 静态/少量元素、需要交互事件、缩放不失真 |
| 性能 | 大量元素时更好 | 少量元素时更好 |
| 交互 | 需要手动实现 hit-test | 原生 DOM 事件 |
| 缩放 | 像素化 | 矢量无损 |

### 实际使用
| 模板 | 渲染方式 | 原因 |
|------|----------|------|
| sound | Canvas 2D | 波形实时动画 |
| motion | Canvas 2D | v-t/s-t 图实时绘制 |
| waves | Canvas 2D | 波形叠加动画 |
| buoyancy | Canvas 2D | 物体浮沉动画 + 气泡 |
| circuit | Canvas 2D | 电路图绘制 + 电流动画 |
| lever | Canvas 2D | 杠杆倾斜动画 |
| refraction | Canvas 2D | 光线折射/全反射动画 |
| reflection | **SVG** | 光线反射静态图，利用 SVG 原生交互 |
| electromagnetism | **SVG + SVG图表** | 磁铁/线圈 SVG 动画 + 磁通量曲线图 |
| energy | **SVG + Canvas 混合** | SVG 单摆动画 + Canvas 能量柱状图 |
| heat | **Canvas + Canvas** | 温度-时间曲线图 + 能量柱状图 |
| lens | **SVG 光路图** | 三条特征光线 + 物体/透镜/像 |
| motion-prototype | Canvas 2D | v-t/s-t 图（原型版） |

### 混合渲染策略（energy.html 首创）
当同一实验需要不同渲染特性的可视化时，可混合使用 SVG 和 Canvas：
- SVG 适合：结构化图形（单摆、光路图、电路图）、矢量缩放需求、少量元素
- Canvas 适合：实时数据图表（柱状图、曲线图）、大量元素、高频更新
- 混合使用时，SVG 和 Canvas 各自独立，共享同一个 compute() 结果

### SVG 动画子模式

**子模式 A：JS 驱动 SVG 属性更新**（reflection, lens, energy 单摆）
```javascript
// 定期更新 SVG 元素属性
function updateSVG(p) {
  elLine.setAttribute('x1', ...);
  elLine.setAttribute('y1', ...);
}
// 配合 setInterval 或 rAF
```

**子模式 B：SVG 声明式动画**（electromagnetism 磁铁运动）
```html
<animateTransform attributeName="transform" type="translate"
  from="0 0" to="0 120" dur="2s" repeatCount="indefinite" fill="freeze"/>
```
- 适合简单周期性运动，无需 JS 控制
- 动画速度通过修改 `dur` 属性动态调整

**子模式 C：SVG polyline 曲线图**（electromagnetism 磁通量曲线）
```javascript
// 实时更新 polyline 的 points 属性
elPolyline.setAttribute('points', pointsStr);
```

### Canvas 初始化模式
```javascript
const ctx = EurekaCanvas.setupHiDPI(canvas, cssW, cssH);
// 内部处理 devicePixelRatio 缩放
```

---

## 5. 动画模式：requestAnimationFrame + 插值平滑

### 两种模式

**模式 A：独立动画循环**（waves, buoyancy, lever, refraction, circuit）
```javascript
function animate() {
  animOffset += 0.04; // 或 0.5
  const p = compute();
  render(p);
  requestAnimationFrame(animate);
}
animate();
```

**模式 B：集成渲染循环**（sound, motion — 使用 experiment-core.js 的 startRenderLoop）
```javascript
startRenderLoop(update);
// update(dt) 中 dt = delta time in seconds
```

### 插值平滑（lever 模板的标杆实现）
```javascript
let currentAngle = 0;
// 在 animate 中：
currentAngle += (targetAngle - currentAngle) * 0.08;
// 平滑过渡而非瞬间跳变
```

### dt 计算
```javascript
const dt = _lastTime ? (time - _lastTime) / 1000 : 0;
_lastTime = time;
```

---

## 6. 状态管理：本地 state 对象 + 单向数据流

### 模式
```javascript
const state = { /* 参数字段 */ };

// 数据流：
// 用户输入 → state 更新 → compute(state) → render(physics) → update UI + emitResultUpdate
```

### 拖拽交互状态（buoyancy 模板的标杆实现）
```javascript
state.userImmersion = null; // null = 使用物理默认值

// 拖拽时：
state.userImmersion = r;    // 用户手动控制

// 滑块改变时：
state.userImmersion = null; // 重置为物理默认
```

---

## 7. 样式系统：CSS 变量 + 组件化类名

### CSS 变量体系（ui-core.css）
```css
:root {
  /* 颜色 */
  --eureka-primary: #3B82F6;
  --eureka-danger: #EF4444;
  --eureka-success: #10B981;
  --eureka-warning: #F59E0B;
  --eureka-info: #8B5CF6;

  /* 间距 */
  --eureka-gap: 16px;
  --eureka-radius: 12px;

  /* 字体 */
  --eureka-font: 'system-ui', sans-serif;

  /* 阴影 */
  --eureka-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
```

### 组件化类名约定（eureka- 前缀）
| 类名 | 用途 |
|------|------|
| `.eureka-root` | 根容器 |
| `.eureka-grid-3` / `.eureka-grid-2` | 统计面板网格 |
| `.eureka-stat` | 统计指标容器 |
| `.eureka-stat-label` | 统计标签 |
| `.eureka-stat-value` | 统计值（+ `.primary` `.danger` `.success` `.warning` `.info`） |
| `.eureka-canvas-wrapper` | Canvas 容器（+ 模板特定后缀如 `.buoyancy-canvas-wrapper`） |
| `.eureka-canvas` | Canvas 元素 |
| `.eureka-card` | 参数/公式卡片 |
| `.eureka-card-title` | 卡片标题 |
| `.eureka-control` | 参数控件容器 |
| `.eureka-control-header` | 控件头部（label + value） |
| `.eureka-control-label` | 控件标签 |
| `.eureka-control-value` | 控件当前值 |
| `.eureka-slider` | 滑块输入 |
| `.eureka-formula` | 公式展示区 |
| `.eureka-formula-title` | 公式标题 |
| `.eureka-formula-expression` | 公式表达式 |
| `.eureka-formula-note` | 公式说明 |
| `.eureka-badge` | 状态徽章 |
| `.eureka-segmented` | 分段控制器容器 |
| `.eureka-segmented-item` | 分段控制器选项（+ `.active`） |

### 颜色语义
| 颜色 | 语义 | CSS 变量 |
|------|------|----------|
| 🔵 Blue | 主要指标、正面值 | `--eureka-primary` |
| 🔴 Red | 重力、危险、下沉 | `--eureka-danger` |
| 🟢 Green | 浮力、安全、漂浮 | `--eureka-success` |
| 🟡 Yellow/Amber | 警告、临界 | `--eureka-warning` |
| 🟣 Purple | 反射、叠加 | `--eureka-info` |

---

## 8. 测试策略：内置 assert 单元测试

### physics-utils.js 的测试系统
```javascript
// 内置测试运行器
function runTests() {
  let passed = 0, failed = 0;
  const tests = [
    // 每个公式至少一个测试
    () => assertEquals(EurekaPhysics.buoyancyForce(1000, 9.8, 0.01), 98, 0.1),
    () => assertEquals(EurekaPhysics.gravityForce(2, 9.8), 19.6, 0.01),
    () => assertEquals(EurekaPhysics.snellsLaw(1, 1.33, 30), 22.1, 0.1),
    // ... 更多
  ];
  tests.forEach(t => { try { t(); passed++; } catch(e) { failed++; console.error(e); } });
  console.log(`Tests: ${passed} passed, ${failed} failed`);
}
```

### 测试辅助
```javascript
function assertEquals(actual, expected, tolerance) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`Expected ${expected} ± ${tolerance}, got ${actual}`);
  }
}
```

---

## 9. 旧模板兼容方案（physics-core.js）

### 兼容层
```javascript
// physics-core.js 提供旧版 API 包装
const EurekaHost = { ... };     // Host 通信封装
const EurekaCanvas = { ... };   // Canvas 辅助（setupHiDPI, clear, drawArrow）
const EurekaHints = { ... };    // 首次运行提示
const EurekaFormat = { ... };   // 数值格式化
```

### 迁移路径
旧模板（buoyancy, circuit, lever, refraction）使用 `physics-core.js`，
新模板（sound, motion, reflection）使用 `experiment-core.js + physics-utils.js`。

兼容方式：`experiment-core.js` 提供了与 `physics-core.js` 相同的全局对象
（`EurekaHost`, `EurekaCanvas`, `EurekaFormat`），旧模板无需修改即可运行。

---

## 10. 三重锁机制 (Triple Lock)

确保 LLM 输出不会破坏实验画面的确定性：

### 锁 1：Prompt 禁令
系统提示词中明确禁止 LLM 修改实验的物理常数和核心算法。

### 锁 2：路由分发
LLM 的 `set_param` 命令通过 `onHostCommand` 路由到 `applyParam`，
仅允许修改已通过 `bindParam` 注册的参数，未知参数名被忽略。

### 锁 3：白名单校验
`bindParam` 的 `clamp` 函数确保参数值始终在 `[min, max]` 范围内，
即使 LLM 发送越界值也会被截断。

---

## 技术栈总结

| 层级 | 技术 | 用途 |
|------|------|------|
| 语言 | JavaScript (ES5+) | 模板逻辑 |
| 标记 | HTML5 | 结构 |
| 样式 | CSS3 (变量 + 组件化) | UI |
| 渲染 | Canvas 2D / SVG | 可视化 |
| 通信 | postMessage v1.0 | Host ↔ Template |
| 参数 | bindParam 声明式 | 参数绑定 |
| 动画 | requestAnimationFrame | 渲染循环 |
| 状态 | 本地 state 对象 | 数据流 |
| 测试 | 内置 assert | 单元测试 |
| 兼容 | physics-core.js wrapper | 旧模板兼容 |
| 安全 | 三重锁 | 输出确定性 |

---

## 11. 13 个模板全景对比表

| # | 模板 | 文件名 | 架构 | 渲染 | 动画 | 行数 | 学科 | 核心公式 | 特色交互 |
|---|------|--------|------|------|------|------|------|----------|----------|
| 1 | 声学 | sound.html | **新** | Canvas | startRenderLoop | 270 | 波动 | v=fλ | Segmented介质切换 |
| 2 | 运动学 | motion.html | **新** | 双Canvas | startRenderLoop | 362 | 运动 | s=v₀t+½at² | Segmented运动类型+映射表驱动 |
| 3 | 波动叠加 | waves.html | 旧 | Canvas | 独立rAF | 250 | 波动 | y=A₁sin+y₂sin | 实时波形叠加+拍频 |
| 4 | 浮力 | buoyancy.html | 旧 | Canvas | 独立rAF | 484 | 力学 | F=ρgV | **拖拽交互**标杆+气泡动画 |
| 5 | 电路 | circuit.html | 旧 | Canvas | 独立rAF | 374 | 电磁 | U=IR | Segmented串并联+电流动画(动点) |
| 6 | 杠杆 | lever.html | 旧 | Canvas | 独立rAF+插值 | 280 | 力学 | M=FL | **插值平滑**标杆(currentAngle) |
| 7 | 折射 | refraction.html | 旧 | Canvas | 独立rAF | 321 | 光学 | n₁sinθ₁=n₂sinθ₂ | 全反射检测+临界角计算 |
| 8 | 反射 | reflection.html | **新** | SVG | 无(静态) | — | 光学 | θᵢ=θᵣ | SVG原生DOM事件 |
| 9 | 电磁感应 | electromagnetism.html | 旧 | SVG+SVG图表 | **声明式animate** | 251 | 电磁 | ε=-NΔΦ/Δt | SVG声明式周期动画+磁通量曲线 |
| 10 | 机械能守恒 | energy.html | 旧 | **SVG+Canvas混合** | JS驱动SVG | 235 | 力学 | KE+PE=E | **混合渲染首创**+能量柱状图 |
| 11 | 比热容 | heat.html | 旧 | Canvas+Canvas | 独立rAF | 273 | 热学 | Q=mcΔT | **双物质对比**+温度曲线 |
| 12 | 凸透镜 | lens.html | 旧 | SVG光路图 | JS驱动SVG | 312 | 光学 | 1/f=1/u+1/v | **三线法**+虚像/实像判断 |
| 13 | 运动原型 | motion-prototype.html | **旧原型** | Canvas | 手动rAF | 334 | 运动 | s=vt | 架构演进对比基准 |

### 架构演进路线图

```
Phase 1: 旧原型 (motion-prototype.html)
  ├── physics-core.js 手动API
  ├── addSlider / addStat 手动DOM创建
  ├── 无 Host 通信协议
  └── 无首次运行提示

       ↓ 演进 ↓

Phase 2: 旧架构模板 (buoyancy/circuit/lever/refraction/waves/electromagnetism/energy/heat/lens)
  ├── physics-core.js 旧版共享层
  ├── EurekaHost 基础通信
  ├── 独立 rAF 动画循环
  ├── EurekaHints 首次提示
  └── 拖拽/Segmented 等交互增强

       ↓ 演进 ↓

Phase 3: 新架构模板 (sound/motion/reflection)
  ├── experiment-core.js 新版共享层
  ├── bindParam 声明式参数绑定
  ├── startRenderLoop 集成渲染循环
  ├── emitReady/emitResultUpdate 完整协议
  ├── 映射表驱动模式切换
  └── 动态公式展示
```

### 渲染策略分布

```
纯 Canvas (7个): sound, motion, waves, buoyancy, circuit, lever, refraction, heat
纯 SVG (2个): reflection, lens
SVG+Canvas 混合 (1个): energy
SVG+SVG图表 (1个): electromagnetism
旧原型 (1个): motion-prototype
```

### 动画策略分布

```
startRenderLoop (新架构): sound, motion
独立 rAF (旧架构): waves, buoyancy, circuit, lever, refraction, heat
JS驱动SVG更新: reflection, lens, energy
SVG声明式动画: electromagnetism
静态无动画: reflection
```
