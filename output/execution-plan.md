## Tasks / 任务分解

## Phase 1: 物理高频缺失模板补全 (光学与力学)
**T-1: 光学透镜与折射动态沙盒**
- **描述**: 开发支持调整物距和焦距的凸透镜成像实验。
- **Acceptance Criteria**:
  1. 能够自由拖动蜡烛（物），并实时计算并显示像的位置和倒立/正立状态。
  2. 提供焦距控制滑块。
  3. `isApprovedTemplate` 注册 `physics/lens`。

**T-2: 引入 matter.js 引擎并实现高中力学碰撞台**
- **描述**: 在物理 shared 目录下封装 `physics-engine.js` (基于 matter.js)，并实现动量守恒与完全弹性/非弹性碰撞模板。
- **Acceptance Criteria**:
  1. `public/templates/_shared` 内集成轻量级 `matter.js` 的核心刚体与碰撞模块。
  2. 实现 `physics/collision` 模板，支持动态调整小球质量、初始速度。
  3. 碰撞过程中能够实时提取物体的速度向量并绘制 v-t 图像，验证动量守恒定律。

## Phase 2: 生物学基础架构建设 (从0到1)
**T-3: 显微镜通用交互组件**
- **描述**: 构建一个带有粗细准焦螺旋、物镜转换、视野平移的公共组件。
- **Acceptance Criteria**:
  1. 支持传入高分辨率的标本大图。
  2. 模糊滤镜模拟焦距，放大滤镜模拟倍率。
  3. 新增 `biology-router.ts` 并注册 `biology/microscope`。

**T-4: 细胞生理动态模拟 (质壁分离)**
- **描述**: 制作一个基于 Canvas 的植物细胞脱水/吸水动态展示。
- **Acceptance Criteria**:
  1. 可调节细胞外液浓度。
  2. 动画平滑展示液泡收缩/膨胀及原生质层分离现象。

## Phase 3: 化学有机微观结构及复杂实验扩展
**T-5: 引入 WebGL 方案实现有机分子 3D 渲染**
- **描述**: 在化学 shared 目录下封装 `webgl-renderer.js` (如基于 Three.js)，实现甲烷、乙烯、乙酸乙酯等有机物的三维球棍模型展示与交互。
- **Acceptance Criteria**:
  1. 实现 `chemistry/organic-molecules` 模板。
  2. 支持鼠标对 3D 分子模型的 360 度旋转、缩放。
  3. 包含断键/成键的简易动画触发接口，支持化学反应微观过程演示。

**T-6: 经典气体制备拼装台**
- **描述**: 实现类似拼图的发生装置（试管/烧瓶+酒精灯）和收集装置的组合。
- **Acceptance Criteria**:
  1. 错误拼装时（如加热高锰酸钾不放棉花）给出红色告警。
  2. 注册 `chemistry/gas-generation`。

## Critical Path
本计划的关键路径在于 **T-2 (引入 matter.js)** 与 **T-5 (引入 WebGL)**。作为突破原生 HTML DOM 渲染瓶颈的核心基建，这两步的成功落地将决定高中复杂物理与化学实验能否顺利支持强交互和动态演化计算。生物学方面，**T-3 (显微镜交互)** 则是开启生物实验的第一把钥匙。

## Risk Mitigation
- **风险**: T-2 和 T-5 引入外部引擎可能会导致单个 iframe 模板的体积显著增大，并增加内存消耗风险。
- **缓解策略**:
  1. 对 `matter.js` 和 WebGL 库采用 CDN 异步按需加载，不在主 bundle 中打包。
  2. 在 `ExperimentRenderer` 组件级联时设置内存回收与销毁钩子，确保 iframe 卸载时一并释放引擎上下文。