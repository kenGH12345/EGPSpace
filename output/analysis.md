# G 阶段 · ANALYSE · iframe e2e + 底座统一 + 防复发路线图

> **Session**: `wf-20260430013937.`
> **Requirement**: iframe e2e smoke 测试（Playwright 视觉回归）+ physics-core.js→experiment-core.js 模板底座统一 + G 阶段路线图（防复发 · 覆盖 L4 协议 RPC 路径）
> **Baseline**: F 阶段 `6fe982a` · C/D/E/F + 4 个 bug fix 已全部 commit+push · 工作区 clean · TSC 0 · Jest 563/563

---

## 思考摘要

**一句话**：G 阶段是对 F 阶段尾声暴露的**两个结构性缺口**（iframe 层零测试 + 底座分叉）做**系统性兑现**——同时推进测试、底座、文档三轨才能真正防复发。

**三轨内在因果**：
1. **底座不统一 → 未来再改 experiment-core 修的 bug 在 physics-core 会再炸**
2. **无 e2e 测试 → 底座迁移无法自动守护 · 每次都要人工目视**
3. **无路线图文档 → 未来 /wf Agent 不知道 C-3 约束 · 又会造第二底座**

**三者必须一起做**：单独做 e2e → 不改底座 · 测试只守护现状；单独做底座 → 无测试 · 迁移时无法自动验证；单独做路线图 → 文档无实际兑现。

**关键洞察（统计意义上的好消息）**：11 个待迁模板 + 7 个 EurekaHost 方法完全同签 + 无交集同时加载——**底座统一可能只需 11 行 script src 更改 + experiment-core 补充 EurekaCanvas/EurekaHints 两对象**。工作量集中在"测试编写"而非"迁移本身"。

**关键洞察（风险意义上的警告）**：Playwright 在 Windows + Coze 双环境的兼容性（R-G2）+ iframe 加载时序 flaky（R-G3）是两大 P1 风险——都要用"先测试后迁移"的 Wave 顺序 + 宽松超时 + 结构断言（非 pixel diff）来缓解。

**约束纪律**：OOS 10 条明确不做——不搞 GitHub Actions CI 集成 · 不搞 mobile 视口 · 不重构 L4 协议 · 不升级到 L5。只做本轮真正必需的事。

---

## 根因 / Root Cause

### 动机：F 阶段尾声暴露的两个结构性缺口

F 阶段刚完成物理分层后，用户在 Coze 预览里报了 **circuit 实验 compute timeout + 连线无闭环** 两重 bug。深入排查 (`80ce8f8` / `afd1a92` / `6fe982a`) 后发现**两个长期存在但一直未被发现的架构级缺陷**：

#### 缺陷 1 · iframe 层零测试覆盖（R-FM）

**证据**：
- `public/templates/_shared/*.js` （13 个底座 / drawer / builder 文件）**jest 零测试覆盖**
- `experiment-core.js` 的 `compute_result` listener 只在 `EurekaHost.onHostCommand(cb)` 被调用时才挂载——这个架构 bug **从 L4 协议 v1.0 设计之初就存在**，4 个生产模板（physics/circuit · buoyancy · chemistry/acid-base-titration · metal-acid-reaction）**长期 timeout 无人发现**
- `jest.config.js` 的测试范围只覆盖 `src/**/*.ts`，**不扫 public/templates**
- L4 协议（iframe ↔ host postMessage）的 **RPC 路径**从未有过端到端验证

**后果**：同类 bug 可以在几个月内沉睡，只有用户亲眼打开特定页面才能发现。这是**纯用户报告驱动**的 QA 模式——不可扩展，不可预防。

#### 缺陷 2 · 底座分叉（R-FB）

**证据**：
- 24 iframe 模板被**两套互斥底座**切分：13 用 `experiment-core.js` (L4 v1.0 · 含 RPC 协议)，11 用 `physics-core.js` (更老版本 · 无 RPC 协议)
- 两版 `EurekaHost` 的 7 个方法（setTemplateId/emitReady/emitParamChange/emitResultUpdate/emitInteraction/emitError/onHostCommand）**完全同名同签**——说明本来就是演化自同一祖先 · 但现在分叉
- 由于同名 global 变量，一旦未来有模板**同时加载两者**（虽然目前无交集），`window.EurekaHost` 会被后加载者覆盖——**silent breakage 风险**
- 80ce8f8 的 RPC listener 修复只在 `experiment-core.js`——如果未来把某个模板意外换到 `physics-core.js`，**同一类 bug 还会再炸一遍**

**后果**：F 阶段的修复本身就是脆弱的——它依赖"未来模板继续用 experiment-core"这个假设。底座统一才是**永久性修复**。

### 统一根因：**Host 边界层的协议演化未完成 + 无测试守护**

L4 协议（iframe ↔ host）从 v1.0 演化到 v2-atomic（加 compute RPC），但：
1. **演化没覆盖全部模板**（11 个被遗留在老底座）
2. **演化没带测试**（iframe 层 jest 零覆盖）
3. **演化没有契约防护**（两套底座可以同名同签共存而不报警）

本轮修复三件事**就是把这三条缺口都补上**——同时做才成体系；单独做任一件都是治标。

---

## 受影响位置

### 文件清单（G 阶段要接触的范围）

| 类别 | 文件 | 总量 | 动作 |
|------|------|------|------|
| **iframe 底座** | `public/templates/_shared/experiment-core.js` | 1 | 补充 EurekaCanvas + EurekaHints（吸收 physics-core.js 独有 API）|
| **iframe 底座** | `public/templates/_shared/physics-core.js` | 1 | 迁移完成后删除 / 或改为 thin shim 转发到 experiment-core |
| **待迁移模板** | `public/templates/chemistry/{combustion-conditions,electrolysis,iron-rusting,reaction-rate}.html` | 4 | `<script src="physics-core.js">` → `experiment-core.js` |
| **待迁移模板** | `public/templates/physics/{density,friction,lever,phase-change,pressure,refraction,work-power}.html` | 7 | 同上 |
| **e2e 测试新建** | `tests/e2e/iframe-smoke/**` | ~5 新建 | Playwright smoke 测试 · 覆盖 4 个 compute-using + 若干采样 |
| **Playwright 配置** | `playwright.config.ts` + `package.json` 新增 devDeps + scripts | 2 | 安装并配置 |
| **CI/本地闸门** | `scripts/check.sh`（E 阶段已建立）| 1 | 可选集成 playwright smoke |
| **文档** | `docs/roadmap-g.md` 新建 + `docs/editor-framework.md` 加链接 | 2 | G 阶段路线图文档 + 导航 |
| **跨 session 约束** | `docs/architecture-constraints.md`（F 阶段已建立）| 1 | C-3 新增"iframe 底座单一化"条款 + 使用记录 #8 |
| **防复发 skill** | `.workflow/skills/iframe-rpc-safety.md` 新建 | 1 | 未来 /wf Agent 必读 |

### 规模估计

- **修改文件**: ~15 个
- **新建文件**: ~6 个
- **删除文件**: 0-1 个（physics-core.js 视策略决定）
- **净代码**: +350 行左右（主要是 Playwright smoke 测试）
- **新增 npm devDeps**: `@playwright/test` + 可选 `playwright`（浏览器驱动）
- **预估工时**: **6-9h**（含 Playwright 浏览器下载 + 本地调试）

---

## 修改范围

### 范围 1 · iframe 底座统一（Track-A）

| 子范围 | 文件 | 变更描述 |
|--------|------|---------|
| A-1 · 底座合并 | `public/templates/_shared/experiment-core.js` | 从 `physics-core.js` 复制 `EurekaCanvas` (setupHiDPI/clear/drawArrow) + `EurekaHints` (showFirstRun 等) 到 experiment-core IIFE 内；挂到 `window.EurekaCanvas/EurekaHints` |
| A-2 · 11 模板迁移 | 11 个 .html 文件 | `<script src="/templates/_shared/physics-core.js"></script>` → `<script src="/templates/_shared/experiment-core.js"></script>` · 每文件 1 行 |
| A-3 · 老底座退役 | `public/templates/_shared/physics-core.js` | 选项 B1 直接删除；选项 B2 改为 thin shim（`window.EurekaHost = window.EurekaHost` 之类的 no-op 兼容）。决策留 ARCHITECT。 |
| A-4 · 审计脚本 | `scripts/arch-audit.sh` (F 阶段已有) | 新增 check: 禁止**新**模板 import physics-core.js（如果 A-3 选择保留 shim）· 或直接检查**任何**模板都不引用 physics-core（A-3 选删除时）|

### 范围 2 · Playwright 视觉回归（Track-B）

| 子范围 | 文件 | 变更描述 |
|--------|------|---------|
| B-1 · 依赖安装 | `package.json` | devDependencies 新增 `@playwright/test` · scripts 新增 `test:e2e` |
| B-2 · 配置文件 | `playwright.config.ts` 新建 | 浏览器: Chromium · baseURL: http://localhost:5000 · webServer 配置自启动 dev.sh · screenshot mode: only-on-failure |
| B-3 · Smoke 测试 | `tests/e2e/iframe-smoke/compute.spec.ts` 新建 | 4 个 compute-using iframe 实验（circuit/buoyancy/acid-base-titration/metal-acid-reaction）· 每个测：页面加载 · iframe ready 信号 · 无 timeout 警告 · canvas 非空（像素检查）· 滑块交互后数值变化 |
| B-4 · 视觉基线 | `tests/e2e/iframe-smoke/__screenshots__/` | 对每个实验截图一张 "happy path" 基线图 · 作为回归锚点 |
| B-5 · CI 集成（可选）| `scripts/check.sh` | 加 `npm run test:e2e -- --headed=false` 作为可选闸门 |

### 范围 3 · 防复发路线图（Track-C）

| 子范围 | 文件 | 变更描述 |
|--------|------|---------|
| C-1 · 路线图文档 | `docs/roadmap-g.md` 新建 | 三轨说明 · 验收标准 · 未来扩展（H+ 阶段方向）· 架构决策链（与 ADR 关联）|
| C-2 · 架构约束升级 | `docs/architecture-constraints.md` | 新增 **C-3**: "iframe 底座单一化硬约束"（只允许 experiment-core.js · 禁止再造第二套底座）· 使用记录表追加 #8 |
| C-3 · 防复发 skill | `.workflow/skills/iframe-rpc-safety.md` 新建 | ANALYSE 阶段必读 · 规则: "修改 experiment-core.js 必须先跑 e2e smoke" · "新建 iframe 模板必须走 experiment-core · 禁用 physics-core" · "修改 L4 协议需同步更新 ExperimentMessage schema + IframeExperiment handler + smoke 测试" |
| C-4 · 文档导航 | `docs/editor-framework.md` | 新增 roadmap-g + iframe-rpc-safety 链接 |

### 范围 4 · 不做（Out-of-Scope · OOS）

| OOS # | 事项 | 原因 |
|-------|------|------|
| OOS-1 | 给每个模板都写独立 unit test（jest 层）| 超出本轮范围 · 只做 e2e 级 smoke · unit 测试留 H 阶段 |
| OOS-2 | 对所有 24 模板都录视觉基线 | 只为 4 个 compute-using 模板录基线 · 其他 20 模板无 RPC 风险 · 视觉基线本身有维护成本（字体/时钟变化会误 diff）|
| OOS-3 | 把 experiment-core.js 重构成 ES modules | L4 协议通过 `<script src>` 全局变量暴露是契约 · 重构会破坏兼容性 · 留 H+ 阶段独立立项 |
| OOS-4 | 做通用 graph layout 自动路由 | circuit 连线绘制已在 F 阶段解决 · auto-routing 是另一个问题 · 留未来 |
| OOS-5 | 改 iframe sandbox / CSP 策略 | 安全边界由 `IframeExperiment.tsx` 管理 · 本轮不动 |
| OOS-6 | 把 Playwright 测试集成到 GitHub Actions CI | 本轮只做本地可跑 · CI 集成留下阶段（需要 Actions 秘钥 / 运行时 / 成本评估）|
| OOS-7 | 覆盖 mobile 视口的视觉回归 | 默认 desktop Chromium 足够 · mobile 差异留未来 |
| OOS-8 | 给 chemistry-utils / physics-utils 等其他共享文件加 unit test | 本轮仅锁定底座和 RPC 路径 |
| OOS-9 | 升级到 L5 协议（如 WebSocket / SharedWorker）| L4 已足够 · 协议升级不在本轮范围 |
| OOS-10 | 改 MNA solver 算法 / 电路求解精度 | 求解器归 framework/domains/circuit · 不是 iframe 层问题 |

---

## 下游消费者 / Downstream Consumers

| 消费者 | 当前状态 | G 阶段后 | 必须改动？ |
|--------|---------|---------|----------|
| 13 个用 experiment-core 的模板 | barrel import 方式 · 正常 | 继续正常工作 · 底座变成唯一标准 | ❌ 无需改 |
| 11 个用 physics-core 的模板 | 加载 `physics-core.js` | **加载 `experiment-core.js`** · 可能需改 helper 调用（若 A-3 完全删除 physics-core）| ✅ Script 引用必改 |
| `src/components/IframeExperiment.tsx` | 处理 L4 v2 协议（compute_request → compute_result）| 协议不变 · 只是 iframe 端底座统一 | ❌ 无需改 |
| `src/lib/experiment-message-schema.ts` | L4 消息 validate schema | 不变 | ❌ 无需改 |
| Jest 测试套 (563 个) | 覆盖 src/**/*.ts | **继续通过** · 不受 iframe 层影响 | ❌ 无需改 |
| Playwright e2e 测试（新建）| 不存在 | 4 个 compute 实验 smoke + 视觉基线 | ✅ 新建 |
| `scripts/check.sh` | lint+tsc+jest 三件套 | 新增 playwright smoke 段（可选）| ⚠️ 看 ARCHITECT 决策 |
| `docs/architecture-constraints.md` | C-1 物理边界 · C-2 老模板零改 | 新增 **C-3 iframe 底座单一化** | ✅ 追加 |
| 未来 /wf Agent | 读 constraints.md + skills | 读**新版 C-3** + 新 skill · 禁止再造第二底座 | ✅ 元契约更新 |
| 未来新 iframe 实验 | 可能误选 physics-core | ESLint/audit 阻止（新增规则）| ✅ 守护机制 |

### 契约要点

1. **L4 协议稳定契约**: `ExperimentMessage` schema 和 `IframeExperiment.tsx` 的 handler **不改**——本轮只统一 iframe 端底座
2. **迁移透明契约**: 11 个老模板**视觉和行为不变**（同一套 API · 同一个 window 全局对象）· 用户无感
3. **Test 引入不破坏契约**: jest 563 不动 · Playwright 是**新增**非替代
4. **零新 runtime 依赖契约**: Playwright 只放 devDependencies · 生产包不引入
5. **硬约束无损契约**: F 阶段的 C-1 物理分层 + C-2 老模板零改 · 全部保留 · C-3 新增

---

## 风险评估

### R-G1 · 底座合并可能破坏 EurekaCanvas/EurekaHints 行为 · **P0**

**量化**：11 个 physics-core 模板全部用 `EurekaCanvas`（最多 friction.html 5 次调用）· 7/11 用 `EurekaHints`（首次 tooltip）。任一行为回归都会让该模板无法正确显示。

**缓解**：
1. ARCHITECT 方案: **不修改 physics-core 里的 EurekaCanvas/EurekaHints 代码 · 原样复制**到 experiment-core.js
2. 逐个迁移 + 浏览器目视确认（Coze 预览或本地 dev server）
3. Playwright smoke 测试**应该先写**（Track-B）· 再迁移（Track-A）—— 用测试守护迁移

### R-G2 · Playwright 在 Windows/Coze 环境的兼容性 · **P1**

**量化**：项目 `.coze` 配置 `requires = ["nodejs-24"]` · Playwright 浏览器下载需要 ~300MB · Coze 环境是否允许？

**缓解**：
1. 优先本地跑通（Windows PowerShell）· 再考虑 Coze/CI 集成
2. 如果 Coze 环境装不上，**至少保证本地能跑** · 本地测试产物（截图基线）提交到 git · Coze 跳过
3. 测试用 Chromium only（不装 Firefox/WebKit）· 减小依赖
4. OOS-6 明确"本轮不做 CI 集成"· 降低风险传导

### R-G3 · iframe 加载时序问题导致 smoke 测试 flaky · **P1**

**量化**：iframe 加载 → experiment-core 初始化 → emitReady → host 发 set_params → iframe 渲染 → compute RPC → canvas 绘制。任一步慢几百毫秒都可能让测试 timeout。

**缓解**：
1. 等 ready 信号（而非硬等 `waitForTimeout`）· Playwright `waitForFunction` 等 iframe 内 `window.__EUREKA_READY === true` 之类 flag
2. 测试 timeout 设宽松（30s 默认 → 60s）
3. 先测"非 compute 依赖"的交互（canvas 非空 · 滑块存在），compute 结果值留二阶
4. 如果持续 flaky · 加 retry 策略 + 测试环境 console log 收集

### R-G4 · 视觉回归基线 flaky（字体/抗锯齿差异）· **P2**

**量化**：不同机器/浏览器版本的字体渲染差异可能让 pixel diff 误报 · 截图测试是出了名的易碎。

**缓解**：
1. 先**不做严格 pixel diff** · 只做 "canvas 有内容"（非全白）· "特定 DOM 元素存在" · "无 error 警告元素" 这种结构断言
2. 视觉基线仅作**人工 review 参考**（把 screenshot 存 git · 用肉眼+PR diff 判断）· 不作为 CI fail 条件
3. 若未来要做严格 diff · 锁死浏览器版本 + 禁用字体平滑

### R-G5 · 11 模板迁移中引入 regression · **P1**

**量化**：physics-core 和 experiment-core 的 EurekaHost 虽然 API 同签，但实现细节可能有差（如 `_post` 的 origin 处理、timestamp 格式）。11 模板里可能有 edge case 依赖特定实现。

**缓解**：
1. **先 diff 两版代码**（ARCHITECT 阶段做）· 列出所有行为差异清单
2. 差异若存在 → 在 experiment-core 里保留**兼容分支** · 而非丢弃 physics-core 行为
3. 迁移后每个模板都在本地 dev server 过一次（浏览器访问）· 耗时 ~5min/模板 ≈ ~1h
4. Playwright smoke 对 11 模板也加最低标准（"页面能打开" + "canvas 可见"）—— 作为 floor 保护

### R-G6 · Coze 环境不同步 GitHub（F 阶段已暴露）· **P1**

**量化**：F 阶段最后两次 bug fix 用户在 Coze 预览看不到效果 · 需要手动 pull。G 阶段如果 Playwright 测试在本地通过但 Coze 预览仍是旧代码，**e2e 测试的真实保护力打折**。

**缓解**：
1. 本轮不强求 Coze 集成 · 本地闸门为主（OOS-6 明确）
2. `docs/roadmap-g.md` 里明确列 "Coze GitHub 同步" 作为**未来 G+1 候选**（不本轮做）
3. 让用户在 Coze IDE 里 `git pull + bash scripts/dev.sh` 作为手动兑现路径

### R-G7 · Scope creep 风险 · **P2**

**量化**：三轨并行容易让 scope 失控——写 Playwright 测试时可能忍不住"顺便"修 bug / 加 feature · 底座合并时可能"顺便"重构 EurekaHost API。

**缓解**：
1. AC-G13 审计: 每个 commit diff **必须**只落在三轨的一个范围内（A/B/C）· 跨范围拆 commit
2. Out-of-Scope 10 条明确
3. Wave 严格按 "Track-B 测试先行 → Track-A 底座统一 → Track-C 路线图归档" 顺序 · 不倒装

---

## 验收指标（留给 PLAN 细化）

以下是 ANALYSE 识别出的可量化终态指标 · ARCHITECT 会转为技术决策 · PLAN 会拆成带 acceptance 的任务。本小节仅列**概念性终态**：

| # | 概念终态 | 验证手段（PLAN 细化）|
|---|---------|---------------------|
| G-Goal-1 | Playwright 可用 | `npx playwright --version` |
| G-Goal-2 | 4 个 compute iframe 实验 smoke 通过 | `npm run test:e2e` 全绿 |
| G-Goal-3 | 11 模板迁移完成 · physics-core 引用清零 | `rg 'physics-core\.js' public/templates` 空 |
| G-Goal-4 | experiment-core 含 EurekaCanvas+EurekaHints | 浏览器无 ReferenceError |
| G-Goal-5 | physics-core.js 删除/退役 | 文件不存在或 ≤50 行 shim |
| G-Goal-6 | TSC 0 + Jest 563+ 保持 | check.sh 三件套 |
| G-Goal-7 | arch-audit 新增"底座单一"check 通过 | `bash scripts/arch-audit.sh` exit 0 |
| G-Goal-8 | roadmap-g.md 存在且结构完整 | 文件存在 + 字数 >2500 |
| G-Goal-9 | constraints.md 含 C-3 + 记录 #8 | grep 匹配 |
| G-Goal-10 | iframe-rpc-safety.md skill 注册 | 文件存在 + workflow.config.js 引用 |
| G-Goal-11 | 视觉基线截图存在（4 × 1）| `__screenshots__/` 含 ≥4 png |
| G-Goal-12 | Scope 纯净（三 commit 各不跨 track）| git log 检查 |
| G-Goal-13 | 无 regression · 原 13 experiment-core 模板视觉零变化 | smoke 跑在 4+4 采样中全绿 |

---

## 下一步：ARCHITECT 决策清单

留给 ARCHITECT 回答的 5 个关键决策点：

### D-G1 · physics-core.js 退役方式（A-3）

- **方案 B1**: 完全删除 · 好处简洁 · 坏处若外部 HTML（非当前代码库）引用会 404
- **方案 B2**: 改为 thin shim（`<script>` 加载后转发 window.EurekaHost = window.EurekaHost · 或直接加载 experiment-core 再 alias）· 好处向后兼容 · 坏处保留分叉符号
- **推荐**：**B1 删除** + arch-audit 强制检查 · 因为：(a) 全项目扫过没外部引用；(b) 保留 shim 违反 C-3 精神"单一底座"

### D-G2 · Playwright smoke 的覆盖范围

- **方案 C1**: 只测 4 个 compute-using 实验（最小必要）· 估 3h
- **方案 C2**: 4 + 4 个采样 physics-core 老模板（验迁移不破）· 估 4h
- **方案 C3**: 24 个全覆盖 · 估 8h · 基线维护成本高
- **推荐**：**C2** · 对 4 compute 深度测 + 4 迁移模板浅测 "页面能打开+canvas 可见" · 对迁移最有保护意义

### D-G3 · 视觉基线策略

- **方案 V1**: 纯结构断言（DOM 存在 / canvas 非空 / 无 error 元素）· 无 pixel diff
- **方案 V2**: 结构断言 + 截图保存但不做 diff（仅 review 用）
- **方案 V3**: 结构断言 + 严格 pixel diff（threshold 0.2%）
- **推荐**：**V2** · 截图作为**人工审查**参考 · pixel diff 留 G+1 · 避免 R-G4 flaky

### D-G4 · Track 顺序（Wave 策略）

- **方案 O1**: B（测试）→ A（迁移）→ C（文档）· 测试先行守护迁移
- **方案 O2**: A（迁移）→ B（测试）→ C（文档）· 先改再测
- **方案 O3**: A/B 并行 → C · 并发
- **推荐**：**O1** · 先写测试再迁移 · 和 F 阶段 "tsc canary 先行" 的成功经验对齐

### D-G5 · Coze 环境集成策略

- **方案 N1**: 本轮彻底忽略 Coze · 只做本地 + docs 说明
- **方案 N2**: 尝试把 playwright 配 Coze · 若装不上则降级
- **推荐**：**N1** · OOS-6 已明确 · R-G2+R-G6 叠加风险太大 · 留 G+1

---

## 数据支撑摘要

- F 阶段 `6fe982a` 落定以来 · 本地 git = 远程 in-sync · 工作区 clean
- 24 iframe 模板 · 分布 **13 experiment-core + 11 physics-core**
- EurekaHost API · **7 方法完全同名同签**（两版本可迁移性高）
- EurekaCanvas / EurekaHints · **11/11 用 canvas · 7/11 用 hints** · 迁移必须合并这两对象
- Jest 30.x 已装 · Playwright **未装**（本轮新增）
- scripts/check.sh 已有（E 阶段）· `scripts/arch-audit.sh` 已有（F 阶段）· 基础设施就位
- `.workflow/skills/tsc-workflow-gate.md` (E) + `framework-boundary.md` (F) · 本轮新增 iframe-rpc-safety.md 成三件套
