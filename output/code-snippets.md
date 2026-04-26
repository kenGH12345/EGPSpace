# EGPSpace 物理实验模板 — 可复用代码片段库

> 基于 10 个模板提炼的标准代码骨架和片段

---

## 1. 标准模板骨架（新架构：experiment-core.js）

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>{实验名称}</title>
  <link rel="stylesheet" href="/templates/_shared/ui-core.css">
  <style>
    .{topic}-canvas-wrapper {
      background: linear-gradient(180deg, {bg-top} 0%, {bg-bottom} 100%);
    }
  </style>
</head>
<body>
<div class="eureka-root">

  <!-- 统计面板 -->
  <div class="eureka-grid-3">
    <div class="eureka-stat">
      <p class="eureka-stat-label">{指标1名称}</p>
      <p class="eureka-stat-value primary" id="stat-1">{默认值1}</p>
    </div>
    <div class="eureka-stat">
      <p class="eureka-stat-label">{指标2名称}</p>
      <p class="eureka-stat-value" id="stat-2">{默认值2}</p>
    </div>
    <div class="eureka-stat">
      <p class="eureka-stat-label">{指标3名称}</p>
      <p class="eureka-stat-value" id="stat-3">{默认值3}</p>
    </div>
  </div>

  <!-- Canvas 容器 -->
  <div class="eureka-canvas-wrapper {topic}-canvas-wrapper">
    <canvas id="canvas" class="eureka-canvas" width="{W}" height="{H}"></canvas>
    <span class="eureka-badge" id="status-badge">就绪</span>
  </div>

  <!-- 参数卡片 -->
  <div class="eureka-card">
    <h3 class="eureka-card-title">参数调节</h3>
    <div id="params-root"></div>
  </div>

  <!-- 公式展示 -->
  <div class="eureka-formula">
    <p class="eureka-formula-title">{公式名称}</p>
    <div class="eureka-formula-expression">{公式表达式}</div>
    <p class="eureka-formula-note">{公式说明}</p>
  </div>

</div>

<script src="/templates/_shared/experiment-core.js"></script>
<script>
(function () {
  'use strict';
  const TEMPLATE_ID = '{category}/{topic}';
  EurekaHost.setTemplateId(TEMPLATE_ID);

  const state = {
    // {参数字段: 默认值}
  };

  const canvas = document.getElementById('canvas');
  const cssW = {W}, cssH = {H};
  const ctx = EurekaCanvas.setupHiDPI(canvas, cssW, cssH);

  // --- bindParam 参数声明 ---
  // bindParam('{paramName}', { min, max, step, defaultValue, unit, label, container: document.getElementById('params-root') });

  function compute() {
    // 纯计算逻辑，返回结果对象 p
    const p = { /* ... */ };
    return p;
  }

  function render(p) {
    EurekaCanvas.clear(ctx, cssW, cssH);
    // 渲染逻辑
  }

  function update(emitParam) {
    const p = compute();
    // 更新 DOM 统计值
    // render(p)
    // emitResultUpdate + emitParamChange
  }

  // --- wire() 事件绑定 ---
  // function wire(el, key, param) { ... }
  // wire(el1, 'key1', 'param1');
  // wire(el2, 'key2', 'param2');

  EurekaHost.onHostCommand((cmd) => {
    if (cmd.type === 'set_param' && typeof cmd.param === 'string' && typeof cmd.value === 'number') {
      applyParam(cmd.param, cmd.value); update();
    } else if (cmd.type === 'set_params' && cmd.params) {
      for (const k in cmd.params) {
        if (Object.prototype.hasOwnProperty.call(cmd.params, k)) applyParam(k, cmd.params[k]);
      }
      update();
    } else if (cmd.type === 'reset') {
      // 重置状态
      // update();
    }
  });

  function applyParam(name, value) {
    switch (name) {
      // case 'paramName': state.key = EurekaFormat.clamp(value, min, max); el.value = state.key; break;
    }
  }

  update();
  setTimeout(() => { try { EurekaHints.show(canvas, '👆 {提示文字}', 5000); } catch {} }, 600);
  EurekaHost.emitReady(['{param1}', '{param2}']);
})();
</script>
</body>
</html>
```

---

## 2. 标准模板骨架（旧架构：physics-core.js）

```html
<!-- 仅替换以下两行 -->
<!-- <script src="/templates/_shared/experiment-core.js"></script> -->
<script src="/templates/_shared/physics-core.js"></script>

<!-- script 内部替换以下全局对象 -->
<!-- EurekaHost  → 使用 physics-core.js 提供的同名 EurekaHost -->
<!-- EurekaCanvas → 使用 physics-core.js 提供的同名 EurekaCanvas -->
<!-- EurekaFormat → 使用 physics-core.js 提供的同名 EurekaFormat -->
<!-- EurekaPhysics → 使用 physics-utils.js 提供的 EurekaPhysics -->

<!-- 新增可选引用 -->
<script src="/templates/_shared/physics-utils.js"></script>

<!-- 新增 physics-utils.js 的内置测试 -->
// 在模板脚本末尾添加：
// EurekaPhysics.runTests();  // 运行内置单元测试
```

---

## 3. 参数绑定模板（bindParam 详解）

### 单参数绑定
```javascript
bindParam('incidentAngle', {
  min: 0, max: 89, step: 1, defaultValue: 30,
  unit: '°', label: '入射角 θ₁',
  container: document.getElementById('params-root')
});
```

### 带小数精度的参数
```javascript
bindParam('n1', {
  min: 1, max: 2.5, step: 0.01, defaultValue: 1.00,
  label: '介质1折射率 n₁',
  container: document.getElementById('params-root')
});
```

### 自定义容器
```javascript
bindParam('frequency', {
  min: 1, max: 20, step: 0.1, defaultValue: 2,
  unit: 'Hz', label: '频率 f',
  container: document.getElementById('freq-group')
});
```

### 带约束的参数
```javascript
bindParam('objectDensity', {
  min: 100, max: 20000, step: 10, defaultValue: 500,
  unit: 'kg/m³', label: '物体密度 ρ',
  container: document.getElementById('params-root')
});
```

---

## 4. Segmented 控件模板

### HTML 结构
```html
<div class="eureka-segmented" id="medium-selector">
  <button class="eureka-segmented-item active" data-medium="air">空气</button>
  <button class="eureka-segmented-item" data-medium="water">水</button>
  <button class="eureka-segmented-item" data-medium="steel">钢铁</button>
</div>
```

### JavaScript 事件绑定
```javascript
const MEDIUMS = {
  air:   { label: '空气', speed: 343 },
  water: { label: '水',   speed: 1482 },
  steel: { label: '钢铁', speed: 5960 },
};

document.querySelectorAll('.eureka-segmented-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.eureka-segmented-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const key = btn.dataset.medium;       // 或 dataset.topology / dataset.mode
    state.currentMedium = key;            // 或 state.topology / state.mode
    state.speedOfSound = MEDIUMS[key].speed;
    update({ param: 'medium', value: key });
  });
});
```

### 运动类型 Segmented（带 applyMode）
```javascript
const MOTION_MODES = {
  uniform: {
    label: '匀速', v0Visible: false, aVisible: false,
    formulaTitle: '匀速运动', formulaExpr: 's = v₀ × t',
    v0Default: 5, aDefault: 0,
  },
  accelerated: {
    label: '匀变速', v0Visible: false, aVisible: true,
    formulaTitle: '匀变速运动', formulaExpr: 'v = v₀ + a·t,  s = v₀t + ½at²',
    v0Default: 0, aDefault: 2,
  },
  acceleratedWithV0: {
    label: '匀变速带初速度', v0Visible: true, aVisible: true,
    formulaTitle: '匀变速运动（带初速度）', formulaExpr: 'v = v₀ + a·t,  s = v₀t + ½at²',
    v0Default: 3, aDefault: 2,
  },
};

function applyMode(mode) {
  const m = MOTION_MODES[mode];
  ctlV0.parentElement.style.display = m.v0Visible ? '' : 'none';
  ctlA.parentElement.style.display = m.aVisible ? '' : 'none';
  if (!m.v0Visible) setParam('v0', m.v0Default, false);
  if (!m.aVisible) setParam('a', m.aDefault, false);
  formulaTitle.textContent = m.formulaTitle;
  formulaExpr.textContent = m.formulaExpr;
}

document.querySelectorAll('.eureka-segmented-item').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.eureka-segmented-item').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const mode = btn.dataset.mode;
    state.motionMode = mode;
    applyMode(mode);
    update({ param: 'mode', value: mode });
  });
});
```

---

## 5. Canvas 初始化与清屏模板

### HiDPI 初始化
```javascript
const canvas = document.getElementById('canvas');
const cssW = 680, cssH = 400;
const ctx = EurekaCanvas.setupHiDPI(canvas, cssW, cssH);
```

### 自定义背景清屏
```javascript
function render(p) {
  EurekaCanvas.clear(ctx, cssW, cssH);

  // 渐变背景
  const grad = ctx.createLinearGradient(0, 0, 0, cssH);
  grad.addColorStop(0, '#F0FDFA');
  grad.addColorStop(1, '#CCFBF1');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cssW, cssH);
}
```

---

## 6. 动画循环模板

### 独立动画循环（waves/buoyancy/lever/refraction/circuit）
```javascript
let animOffset = 0;

function animate() {
  animOffset += 0.04; // 波形偏移（波动类）或 0.5（浮力类）
  const p = compute();
  render(p);
  requestAnimationFrame(animate);
}
animate();
```

### 集成渲染循环（sound/motion — experiment-core.js）
```javascript
const loop = startRenderLoop(update);
// update(dt) 中 dt = delta time in seconds
```

### 插值平滑（lever 模板标杆）
```javascript
let currentAngle = 0;

function animate() {
  const targetAngle = computeTorque(state);  // 目标倾斜角
  currentAngle += (targetAngle - currentAngle) * 0.08;  // 插值因子
  render({ ...compute(), currentAngle });
  requestAnimationFrame(animate);
}
```

---

## 7. 绘制辅助模板

### 画坐标轴
```javascript
function drawAxis(ctx, cx, cy, len, color) {
  ctx.strokeStyle = color || '#6B7280';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(cx, cy - len);
  ctx.lineTo(cx, cy + len);
  ctx.stroke();
  ctx.setLineDash([]);
}
```

### 画力箭头
```javascript
EurekaCanvas.drawArrow(ctx, x1, y1, x2, y2, '#10B981', 'F_浮');
EurekaCanvas.drawArrow(ctx, x1, y1, x2, y2, '#EF4444', 'G');
```

### 画角度弧
```javascript
function drawAngleArc(ctx, cx, cy, radius, startAngle, endAngle, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const ccw = endAngle < startAngle;
  ctx.arc(cx, cy, radius, startAngle, endAngle, ccw);
  ctx.stroke();
}
```

---

## 8. Host 命令处理模板

### 标准命令处理
```javascript
EurekaHost.onHostCommand((cmd) => {
  if (cmd.type === 'set_param' && typeof cmd.param === 'string' && typeof cmd.value === 'number') {
    applyParam(cmd.param, cmd.value); update();
  } else if (cmd.type === 'set_params' && cmd.params) {
    for (const k in cmd.params) {
      if (Object.prototype.hasOwnProperty.call(cmd.params, k)) applyParam(k, cmd.params[k]);
    }
    update();
  } else if (cmd.type === 'reset') {
    // 重置状态到默认值
    state.param1 = default1;
    state.param2 = default2;
    // 重置 DOM 控件
    ctl1.value = default1;
    ctl2.value = default2;
    // 重置 segmented 等
    applyMode(defaultMode);
    update();
  }
});
```

### 带 segmented 重置
```javascript
} else if (cmd.type === 'reset') {
  state.incidentAngle = 30; state.n1 = 1.00; state.n2 = 1.33;
  ctlI.value = 30; ctlN1.value = 1.00; ctlN2.value = 1.33;
  // 重置 segmented
  document.querySelectorAll('#medium-selector .eureka-segmented-item').forEach(b => {
    b.classList.toggle('active', b.dataset.medium === 'air');
  });
  update();
}
```

---

## 9. emitResultUpdate 字段模板

### 声学实验
```javascript
EurekaHost.emitResultUpdate({
  frequency: state.frequency,
  wavelength: wavelength,
  speedOfSound: state.speedOfSound,
  medium: state.currentMedium,
});
```

### 运动学实验
```javascript
EurekaHost.emitResultUpdate({
  velocity: state.v0,
  acceleration: state.a,
  displacement: d,
  motionMode: state.motionMode,
});
```

### 波动叠加
```javascript
EurekaHost.emitResultUpdate({
  frequency1: state.f1,
  frequency2: state.f2,
  amplitude1: state.a1,
  amplitude2: state.a2,
  beatFrequency: beatFreq,
  waveSpeed: state.waveSpeed,
});
```

### 浮力实验
```javascript
EurekaHost.emitResultUpdate({
  buoyancyForce: Fb,
  gravityForce: G,
  objectDensity: state.rhoObj,
  liquidDensity: state.rhoLiq,
  immersion: immersion,
  status: statusText,
});
```

### 折射实验
```javascript
EurekaHost.emitResultUpdate({
  incidentAngle: state.incidentAngle,
  refractionAngle: p.tir ? -1 : Number(p.refractionAngleDeg.toFixed(2)),
  totalInternalReflection: p.tir,
  criticalAngle: p.criticalDeg !== null ? Number(p.criticalDeg.toFixed(2)) : -1,
});
```

---

## 10. emitReady 参数声明模板

### 单一参数
```javascript
EurekaHost.emitReady(['incidentAngle']);
```

### 多参数
```javascript
EurekaHost.emitReady(['frequency', 'amplitude', 'waveSpeed']);
```

### 带 segmented 参数
```javascript
EurekaHost.emitReady(['incidentAngle', 'n1', 'n2', 'medium']);
// 或
EurekaHost.emitReady(['v0', 'a', 'mode']);
```

---

## 11. 内置单元测试模板

### 物理公式验证
```javascript
function assertEquals(actual, expected, tolerance) {
  if (Math.abs(actual - expected) > tolerance) {
    throw new Error(`Expected ${expected} ± ${tolerance}, got ${actual}`);
  }
}

function runTests() {
  let passed = 0, failed = 0;

  const tests = [
    // 力学
    () => assertEquals(EurekaPhysics.buoyancyForce(1000, 9.8, 0.01), 98, 0.1),
    () => assertEquals(EurekaPhysics.gravityForce(2, 9.8), 19.6, 0.01),
    () => assertEquals(EurekaPhysics.leverTorque(10, 0.5), 5, 0.001),
    () => assertEquals(EurekaPhysics.pressureForce(101325, 0.01), 1013.25, 0.01),

    // 运动学
    () => assertEquals(EurekaPhysics.displacement(5, 0, 2), 10, 0.01),
    () => assertEquals(EurekaPhysics.finalVelocity(0, 2, 3), 6, 0.01),
    () => assertEquals(EurekaPhysics.kineticEnergy(2, 3), 9, 0.01),

    // 波动
    () => assertEquals(EurekaPhysics.waveDisplacement(0.1, 2, 3.14, 0), 0.1, 0.001),
    () => assertEquals(EurekaPhysics.waveSpeed(2, 340), 680, 0.1),
    () => assertEquals(EurekaPhysics.superposition(0.5, -0.3), 0.2, 0.001),

    // 光学
    () => assertEquals(EurekaPhysics.snellsLaw(1, 1.33, 30), 22.1, 0.1),

    // 电磁
    () => assertEquals(EurekaPhysics.ohmVoltage(2, 5), 10, 0.01),
  ];

  tests.forEach((t, i) => {
    try { t(); passed++; } catch (e) { failed++; console.error(`Test ${i + 1} FAIL:`, e.message); }
  });

console.log(`EurekaPhysics tests: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}
```

### 模板内调用
```javascript
// 在模板脚本末尾调用
runTests();
```

---

## 12. SVG 光路图模板（光学实验通用）

```html
<!-- HTML 中的 SVG 容器 -->
<svg id="ray-diagram" viewBox="0 0 600 400" xmlns="http://www.w3.org/2000/svg">
  <!-- 主轴 -->
  <line x1="0" y1="200" x2="600" y2="200" stroke="#D1D5DB" stroke-width="1"/>
  <!-- 透镜 -->
  <line x1="300" y1="80" x2="300" y2="320" stroke="#3B82F6" stroke-width="3"/>
  <!-- 焦点标记 -->
  <circle cx="150" cy="200" r="4" fill="#F59E0B"/>
  <circle cx="450" cy="200" r="4" fill="#F59E0B"/>
</svg>
```

```javascript
// 三条特征光线更新（凸透镜）
function updateLensRays(svg, p) {
  const { u, v, f, objectH } = p;
  const isVirtual = u < f;
  const imageH = -objectH * v / u;

  // 光线1: 平行→焦点
  setLineAttrs(svg.line1, { x1: objX, y1: objY, x2: lensX, y2: objY });
  if (!isVirtual) {
    setLineAttrs(svg.line1b, { x1: lensX, y1: objY, x2: imageX, y2: imageY });
    svg.line1b.setAttribute('stroke-dasharray', '');
  } else {
    setLineAttrs(svg.line1b, { x1: lensX, y1: objY, x2: virtualX, y2: virtualY });
    svg.line1b.setAttribute('stroke-dasharray', '6,4');
  }
  // 光线2/3 同理
}

function setLineAttrs(el, attrs) {
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}
```

---

## 13. SVG 声明式动画模板

```html
<!-- 磁铁上下周期运动 -->
<g id="magnet-group">
  <rect x="-25" y="-50" width="50" height="100" fill="#EF4444" rx="4"/>
  <animateTransform
    attributeName="transform" type="translate"
    from="0 0" to="0 120" dur="2s"
    repeatCount="indefinite" fill="freeze"
    id="magnet-anim"/>
</g>
```

```javascript
// 动态调整动画速度（修改 dur 属性）
function setMagnetSpeed(speed) {
  const dur = Math.max(0.5, 3 / speed);
  document.getElementById('magnet-anim').setAttribute('dur', dur + 's');
}
```

---

## 14. 能量柱状图 Canvas 模板

```javascript
function drawEnergyBars(ctx, x, y, w, h, energies) {
  // energies = [{ value, color, label }, ...]
  const maxE = Math.max(...energies.map(e => e.value), 0.01) * 1.15;
  const barW = w / (energies.length * 2 - 1);

  energies.forEach((e, i) => {
    const bx = x + i * barW * 2;
    const bh = (e.value / maxE) * h;

    ctx.fillStyle = e.color;
    ctx.fillRect(bx, y + h - bh, barW, bh);

    ctx.fillStyle = '#111827';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(e.label, bx + barW / 2, y + h + 14);
    ctx.fillText(e.value.toFixed(1) + 'J', bx + barW / 2, y + h - bh - 6);
  });

  // Total energy reference line (dashed)
  const total = energies[energies.length - 1]?.value || 0;
  if (total > 0) {
    const refY = y + h - (total / maxE) * h;
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = '#9CA3AF';
    ctx.beginPath();
    ctx.moveTo(x, refY);
    ctx.lineTo(x + w, refY);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
```

---

## 15. 双物质对比曲线模板

```javascript
function drawDualCurve(ctx, p, mapX, mapY) {
  const { specificHeatA, specificHeatB, mass, heatingPower, timeMax } = p;
  const dt = timeMax / 200;

  // Curve A (blue)
  ctx.strokeStyle = '#3B82F6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let t = 0; t <= timeMax; t += dt) {
    const tempA = heatingPower * t / (mass * specificHeatA);
    const x = mapX(t), y = mapY(tempA);
    t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Curve B (red)
  ctx.strokeStyle = '#EF4444';
  ctx.beginPath();
  for (let t = 0; t <= timeMax; t += dt) {
    const tempB = heatingPower * t / (mass * specificHeatB);
    const x = mapX(t), y = mapY(tempB);
    t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}
```

---

## 16. 像属性判断逻辑模板（透镜成像）

```javascript
function classifyImage(u, f) {
  if (Math.abs(u - f) < 0.01) {
    return { exists: false, reason: '物距等于焦距，不成像' };
  }

  const v = u * f / (u - f); // Gaussian lens formula
  const isVirtual = v < 0;
  const absV = Math.abs(v);
  const magnification = absV / u;

  let nature, orientation, relativeSize;
  if (isVirtual) {
    orientation = '正立';
    relativeSize = '放大';
    nature = '虚像';
  } else {
    orientation = '倒立';
    if (magnification > 1.01) relativeSize = '放大';
    else if (magnification < 0.99) relativeSize = '缩小';
    else relativeSize = '等大';
    nature = '实像';
  }

  return { exists: true, v, isVirtual, nature, orientation, relativeSize, magnification };
}
```

---

## 17. SVG + Canvas 混合渲染模板

```html
<!-- SVG 部分：结构化物理对象 -->
<div class="eureka-canvas-wrapper">
  <svg id="pendulum-svg" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <line id="pend-line" x1="200" y1="20" x2="200" y2="280" stroke="#78350F" stroke-width="3"/>
    <circle id="pend-bob" cx="200" cy="280" r="18" fill="#D97706"/>
  </svg>
</div>

<!-- Canvas 部分：数据图表 -->
<div class="eureka-canvas-wrapper">
  <canvas id="chart-canvas" class="eureka-canvas" width="400" height="300"></canvas>
</div>
```

```javascript
const svgLine = document.getElementById('pend-line');
const svgBob  = document.getElementById('pend-bob');
const chartCtx = EurekaCanvas.setupHiDPI(
  document.getElementById('chart-canvas'), 400, 300
);

function renderHybrid(p) {
  // SVG update: pendulum position
  const bx = 200 + Math.sin(p.angle) * 260;
  const by = 20 + Math.cos(p.angle) * 260;
  svgLine.setAttribute('x2', bx);
  svgLine.setAttribute('y2', by);
  svgBob.setAttribute('cx', bx);
  svgBob.setAttribute('cy', by);

  // Canvas update: energy bar chart
  EurekaCanvas.clear(chartCtx, 400, 300);
  drawEnergyBars(chartCtx, 50, 20, 300, 250, [
    { value: p.kineticEnergy,   color: '#3B82F6', label: 'KE' },
    { value: p.potentialEnergy,  color: '#EF4444', label: 'PE' },
    { value: p.totalEnergy,      color: '#6B7280', label: 'E'  },
  ]);
}
```
