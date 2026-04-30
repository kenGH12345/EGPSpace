# G 阶段 · ARCHITECT · 三轨合一架构设计

> **Session**: `wf-20260430013937.`
> **Precedes**: PLAN
> **Input**: analysis.md · 13 G-Goal + 7 风险 + 5 决策点

---

## 思考摘要

**G 阶段架构本质**：对 F 阶段暴露的"测试空洞 + 底座分叉"做**两阶强化**——短期防 regression（Playwright smoke）+ 长期防复发（底座统一 + 硬约束 C-3 + skill 文档）。

**核心策略**：**测试先行 + 渐进迁移 + 文档兜底**。Track-B（测试）先建立守护 → Track-A（迁移）在守护下安全推进 → Track-C（文档）把结果固化为未来记忆。三者缺一不可。

**约束纪律**：延续 E/F 阶段"硬约束兑现四件套"精神——物理+机器+流程+文档同时守护新边界 C-3。

---

## 1 · 5 决策定型

### D-G1 · physics-core.js 退役方式 → **方案 B1（完全删除）**

**理由**：
1. F 阶段 C-1/C-2 硬约束精神是"物理边界"——保留 shim 违背"单一真相源"
2. `public/templates` 全扫证实 11 个当前用户迁移后无残余引用（A-2 之后 rg 返回空）
3. 若未来有外部 HTML 误引用 → arch-audit 会 fail 暴露问题（机器守护）· 比隐晦 shim 好
4. 简化 · 维护成本最低

**配套机制**：
- `scripts/arch-audit.sh` 新增 check: `if rg 'physics-core\.js' public/templates; then exit 1`（底座单一性守护）
- 迁移 commit 和删除 commit **分两次**：先改 11 模板指向新底座并验证，再单独删 physics-core

### D-G2 · Playwright smoke 覆盖范围 → **方案 C2（4 + 4 采样）**

**4 个 compute-using iframe（深度测试）**：
1. `physics/circuit` — F 阶段 bug 源头 · 含 RPC + 连线闭环
2. `physics/buoyancy` — 同为 Class A · RPC 修复受益者
3. `chemistry/acid-base-titration` — chemistry 侧 RPC 实验
4. `chemistry/metal-acid-reaction` — chemistry reaction engine 消费者

**验证点（每个深度测试）**：
- ✅ 页面 200 响应
- ✅ iframe 加载完成
- ✅ 60s 内 **无 "timeout waiting for host response" 文本** 出现
- ✅ canvas DOM 存在且**非全白**（getImageData 检查非零像素）
- ✅ 至少有一个 stat 显示**具体数值**（非 `—`）

**4 个迁移后的物理-chemistry 采样（浅测试）**：
5. `physics/friction`（用 EurekaCanvas 最多 · 5 次）· 高风险
6. `physics/pressure`（用 EurekaCanvas 4 次 · 用 EurekaHints）
7. `chemistry/combustion-conditions`（用 EurekaCanvas 1 次 · 典型 chemistry）
8. `physics/refraction`（中等复杂度）

**验证点（每个浅测试）**：
- ✅ 页面 200 响应
- ✅ iframe 加载完成
- ✅ **浏览器控制台无 ReferenceError**（迁移后 EurekaCanvas/Hints 仍可用）
- ✅ canvas 非全白

### D-G3 · 视觉基线策略 → **方案 V2（截图但不 pixel diff）**

**实施**：
- Playwright `page.screenshot({ fullPage: true, path: '__screenshots__/{name}.png' })`
- 8 张截图（4 compute + 4 迁移采样）· 提交到 git
- **不**作为 fail 条件 · 仅作为 PR review 时的人工参考
- 命名约定：`{subject}-{experiment}.png`（如 `physics-circuit.png`）
- `.gitattributes` 标 `*.png binary`（避免 LF/CRLF 干扰）

**拒绝 pixel diff（V3）的理由**：
- 不同机器字体抗锯齿差异 → 误 diff
- Canvas 2D 渲染在不同 GPU 下子像素级差异
- Playwright `expect(page).toHaveScreenshot()` 需要 CI 稳定环境 · 本地开发不适合

**未来升级路径**：若 H+ 阶段加 CI · 届时再启用严格 diff（改 V3）· 视觉基线文件可直接复用

### D-G4 · Wave 顺序 → **方案 O1（B → A → C）**

**Wave 顺序**：
```
W0 · 基线冻结 (10min)
W1 · Track-B 先行: Playwright 基础设施 (90min)
  - 装依赖 + config + 4 compute smoke 基础写入
W2 · Track-B 完善: 4 compute smoke 通过 + 8 截图基线 (60min)
W3 · Track-A 底座统一: experiment-core 融合 EurekaCanvas+EurekaHints (40min)
W4 · Track-A 迁移: 11 模板 script src 更新 (30min)
W5 · Track-B 守护: 4 迁移采样 smoke 通过 · 确认零 regression (30min)
W6 · Track-A 清理: 删除 physics-core.js + arch-audit 新规则 (20min)
W7 · Track-C 路线图: roadmap-g.md + constraints.md C-3 + skill (50min)
W8 · 终局验证 + 产出归档 (20min)
```

**总预估**：~5h · analysis 的 6-9h 估计留了 buffer

**Wave 顺序依据**：
- W1~W2（Track-B）**先行**：建立 smoke 守护 · 未来每次 Track-A 动作后立即验证
- W3（底座合并）**单独 Wave**：R-G1 P0 风险 · 合并后 11 模板都受影响 · 先合并再迁移
- W4（11 模板迁移）**在 W3 之后**：此时 EurekaCanvas/Hints 已在 experiment-core · 迁移安全
- W5（迁移后 smoke）**立即验证**：R-G5 迁移 regression 风险
- W6（删 physics-core）**最后**：所有 smoke 绿后才敢删除
- W7（文档）**收尾**：事实固化为制度

**与 E/F 阶段对齐**：
- E: TSC canary 先行 → 清理后 tsc 验证
- F: 分层→迁移→验证
- G: 测试→迁移→验证（同构）

### D-G5 · Coze 环境集成 → **方案 N1（本轮忽略）**

**理由**：
- R-G2（Playwright 环境）+ R-G6（Coze 同步滞后）叠加风险太大
- Coze 环境装 Playwright 浏览器 ~300MB + Linux 依赖不确定
- 本地 Windows Chromium 跑通后 → 对用户已经够用（用户是 Coze 预览的消费者）
- **roadmap-g.md 明确列"Coze + GitHub Actions CI"作为 G+1 候选**

**替代路径（本轮就做）**：
- `scripts/check.sh` 新增可选 `--e2e` 参数 · 允许本地闸门统一
- `docs/roadmap-g.md` 写清楚 "Playwright 本地运行指南"
- 用户拉代码后 `npm install && npx playwright install chromium && npm run test:e2e` 即可

---

## 2 · 目录结构（G 阶段落地后全貌）

```
EGPSpace/
├── public/templates/
│   ├── _shared/
│   │   ├── experiment-core.js        ← 🟢 唯一底座（合并后）
│   │   ├── ui-core.css
│   │   ├── ui-core.js
│   │   ├── chemistry-*.js (4 files)
│   │   ├── physics-draw.js
│   │   ├── physics-utils.js
│   │   ├── circuit-*.js (2 files)
│   │   ├── component-mirror.js
│   │   └── ❌ physics-core.js         ← 本轮删除
│   ├── chemistry/ (6 .html)           ← 全部引用 experiment-core
│   └── physics/ (18 .html)            ← 全部引用 experiment-core
├── tests/
│   └── e2e/
│       └── iframe-smoke/
│           ├── compute.spec.ts        ← 4 compute 深度
│           ├── migration.spec.ts      ← 4 迁移采样浅测
│           └── __screenshots__/       ← 8 PNG 基线（git 跟踪）
├── playwright.config.ts               ← 新建
├── package.json                       ← +devDep @playwright/test + scripts
├── scripts/
│   ├── check.sh (E 建立)              ← 加 --e2e 可选开关
│   ├── arch-audit.sh (F 建立)         ← 新增底座单一 check
│   └── ... (其他 5)
├── docs/
│   ├── roadmap-g.md                   ← 新建
│   ├── architecture-constraints.md    ← 加 C-3 + 记录 #8
│   └── editor-framework.md            ← 加链接
├── .workflow/skills/
│   ├── tsc-workflow-gate.md (E)
│   ├── framework-boundary.md (F)
│   ├── iframe-rpc-safety.md           ← 新建
│   └── ... (其他)
└── output/ (本轮 7 产出)
```

---

## 3 · Architecture Scorecard

14 项目标 · 每项含可执行验证路径：

| # | 维度 | 目标 | 验证 | 权重 |
|---|------|------|------|------|
| 1 | **类型安全** | TSC 0 保持 | `npx tsc --noEmit` | 🔴 critical |
| 2 | **测试基础** | Jest 563+ 保持 | `npx jest` 全绿 | 🔴 critical |
| 3 | **e2e 覆盖** | 4 深度 + 4 浅度全绿 | `npm run test:e2e` | 🔴 critical |
| 4 | **底座单一** | physics-core 引用清零 | `rg physics-core\\.js public/templates` 空 | 🔴 critical |
| 5 | **向后兼容** | 13 原 experiment-core 模板零变化 | 其中 2 纳入 smoke 验证 | 🔴 critical |
| 6 | **零新 runtime 依赖** | Playwright 仅 devDep | `grep -c "\"@playwright/test\"" package.json | dependencies` 为 0 | 🟠 high |
| 7 | **物理守护** | arch-audit.sh pass | `bash scripts/arch-audit.sh` exit 0 | 🟠 high |
| 8 | **文档归档** | roadmap-g + skill + constraints 齐全 | 文件存在 + grep | 🟠 high |
| 9 | **Scope 纯净** | 分 track commit（A/B/C 各独立）| `git log --oneline` 三 commit 语义纯净 | 🟡 medium |
| 10 | **最小扰动** | 单文件 diff ≤ 预期 | W4 迁移 11 模板每个 ≤5 行 | 🟡 medium |
| 11 | **回滚能力** | Wave 级 commit 独立 | 每 Wave 末尾 commit | 🟡 medium |
| 12 | **视觉基线** | 8 PNG 存在 | `ls tests/e2e/.../__screenshots__/*.png | wc -l ≥ 8` | 🟡 medium |
| 13 | **Skill 注册** | workflow.config.js projectSkills 含 iframe-rpc-safety | grep 匹配 | 🟡 medium |
| 14 | **跨 session 防复发** | future /wf reads C-3 | constraints.md 明示 + skill 注册 | 🟡 medium |

---

## 4 · Scenario Coverage（14 场景）

**正向场景（7）**：
1. ✅ 合法迁移：新模板用 experiment-core → 正常工作
2. ✅ 合法依赖：experiment-core → window globals（EurekaHost/EurekaCanvas/EurekaHints）
3. ✅ Playwright smoke compute 实验通过
4. ✅ Playwright smoke 迁移采样通过
5. ✅ TSC 0 + Jest 563+ 保持绿
6. ✅ arch-audit 对当前代码库 exit 0
7. ✅ roadmap-g + skill 被下轮 /wf Agent 读到并遵守

**反向场景（7）**：
8. ❌ 有模板引用 physics-core → arch-audit fail → 阻塞 commit
9. ❌ smoke 测试 iframe timeout → CI red → 阻塞 deploy
10. ❌ EurekaCanvas 合并时实现漂移 → 迁移后浏览器 ReferenceError → smoke 抓到
11. ❌ 新 /wf 改 experiment-core 破坏 RPC → smoke red
12. ❌ pixel diff flaky → 拒绝用 pixel diff（D-G3 选 V2）
13. ❌ Coze 环境装不上 Playwright → OOS 明确不做（D-G5）
14. ❌ commit 跨 track → AC-G12 / Wave commit 分离纪律拦截

14 场景全部映射到 13 G-Goal · 每个 G-Goal 至少有 1 场景验证。

---

## 5 · Failure Model（6 FM）

| FM | 描述 | 检测点 | 恢复动作 |
|----|------|-------|---------|
| **FM-G1** | W3 EurekaCanvas 合并后 API 行为漂移 | 合并后本地跑 friction.html · 肉眼验证 | 对比 diff · 修复漂移 · 或保留 physics-core 内联 |
| **FM-G2** | W4 迁移 11 模板时漏改某个 | W5 smoke 对采样 4 模板跑红 | `rg physics-core` 手动审计遗漏 · 补改 |
| **FM-G3** | Playwright 在 Windows 装失败 | W1 `npx playwright install chromium` 报错 | 降级: 本地 chromium 手动下载 + 配 `executablePath` |
| **FM-G4** | smoke 测试在 dev server 冷启动时超时 | W2 首次运行 timeout | 增加 `webServer.timeout` 到 120s · 或预热 dev server |
| **FM-G5** | 删除 physics-core 后发现外部遗漏引用 | W6 后 smoke red / 手动浏览 red | 回滚删除 commit · 确认后再删 |
| **FM-G6** | Scope creep: 迁移时 "顺便" 改 drawer / builder | 每 commit diff 跨 track | revert 跨 track 改动 · 留下次轮 |

**失败不扩散性**：
- Wave 级 commit（8 Wave）· 失败最多回滚 1 Wave（~40min 工作）
- Track-B 先行 · Track-A 改动都有 smoke 守护
- Track-C 在最后 · 文档错误不影响代码

---

## 6 · Migration Safety Case

### 兼容性契约

| 对象 | G 前 | G 后 | 兼容性 |
|------|------|------|--------|
| `window.EurekaHost` API（7 方法）| 两版同签 | 统一 experiment-core 版 | ✅ 完全兼容（同签名）|
| `window.EurekaCanvas`（setupHiDPI/clear/drawArrow）| physics-core 独有 | **融入 experiment-core** | ✅ 兼容（代码原样复制）|
| `window.EurekaHints`（showFirstRun 等）| physics-core 独有 | 融入 experiment-core | ✅ 兼容 |
| `window.bindParam/getParam/setParam` | experiment-core 独有 | 不变 | ✅ 兼容 |
| `window.requestCompute` | experiment-core 独有 | 不变（80ce8f8 修复生效）| ✅ 兼容 |
| `window.startRenderLoop/stopRenderLoop` | experiment-core 独有 | 不变 | ✅ 兼容 |
| iframe ↔ host L4 协议 v2-atomic | 不变 | 不变 | ✅ 兼容 |
| 24 iframe 模板 DOM/业务逻辑 | 各自原样 | 零改动（除 script src 1 行）| ✅ 兼容 |

### 回滚方案

**Wave 级**：每 Wave commit 独立 · `git revert <wave-sha>` 即可

**整体**：`git reset --hard 6fe982a` 回到 F 阶段末尾

**零副作用证据**：除 11 模板改 1 行 script src 外 · 所有代码层契约 100% 保持

### 漂移检测

- `scripts/arch-audit.sh` 新 check: `if rg 'physics-core\.js' public/templates; then exit 1`
- smoke 测试 Playwright 每次可触发本地
- 未来 /wf Agent 读 constraints.md C-3 条款 + skill

---

## 7 · Consumer Adoption Design

| 消费者 | 适应动作 | 工作量 |
|--------|---------|--------|
| 13 原 experiment-core 模板 | 零 | 0 |
| 11 待迁 physics-core 模板 | script src 1 行 | ~1min × 11 = 11min |
| `tests/e2e/` 新建 | 新建 2 .spec.ts + 8 基线 PNG | W1-W2 完成 |
| `package.json` | +1 devDep + 1 script | 1min |
| `playwright.config.ts` | 新建 | 5min |
| `scripts/arch-audit.sh` | +1 check | 2min |
| `docs/roadmap-g.md` | 新建 | W7 完成 |
| `docs/architecture-constraints.md` | +C-3 + 记录 #8 | W7 完成 |
| `.workflow/skills/iframe-rpc-safety.md` | 新建 | W7 完成 |
| `workflow.config.js` | 注册 skill | 1min |

### 对 IDE Agent / 开发者的 UX

**修改 experiment-core.js** → 触发 3 个守护信号：
1. smoke 测试可能 red · 开发者被强制先跑本地
2. skill iframe-rpc-safety.md 在 ANALYSE 被读到 · 提醒 "修改 RPC 路径需同步 schema + handler + test"
3. arch-audit 不会误伤 · 但 constraints.md 明示 C-3

**新建 iframe 模板** → 必须引用 experiment-core（若用 physics-core · arch-audit red）

---

## 8 · 7 Wave 详细路线

### W0 · 基线冻结（10min）

- 验证本地 tsc=0 · jest=563 · 工作区 clean
- 起 branch `refactor/g-tracks`（或直接 main · 看用户偏好）
- snapshot: 24 模板 + experiment-core 源码

### W1 · Playwright 基础设施（~90min）

- `npm install --save-dev @playwright/test`
- `npx playwright install chromium`（下载 ~150MB）
- 新建 `playwright.config.ts`：
  ```ts
  export default defineConfig({
    testDir: './tests/e2e',
    timeout: 60_000,
    use: {
      baseURL: 'http://localhost:5000',
      screenshot: 'only-on-failure',
    },
    projects: [{ name: 'chromium', use: devices['Desktop Chromium'] }],
    webServer: {
      command: 'bash ./scripts/dev.sh',
      url: 'http://localhost:5000',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  });
  ```
- 骨架 `tests/e2e/iframe-smoke/compute.spec.ts`（先 4 个 it.skip · 验证 config）

### W2 · Compute Smoke 完善（60min）

- 4 compute spec 转为活跃测试
- 每个测试实现 5 验证点
- 8 截图保存到 `__screenshots__/`
- 本地 `npm run test:e2e` 全绿

### W3 · 底座合并（40min · R-G1 P0）

- 精确复制 `physics-core.js` 的 `EurekaCanvas`（setupHiDPI/clear/drawArrow）+ `EurekaHints`（showFirstRun/hide 等）到 `experiment-core.js` IIFE 内
- 挂到 window: `window.EurekaCanvas = EurekaCanvas; window.EurekaHints = EurekaHints;`
- 本地 dev server 跑 · 打开 friction.html（未迁移 · 仍用 physics-core）· 确认 EurekaCanvas 调用仍正常（未损坏老底座）

### W4 · 11 模板迁移（30min · R-G5 P1）

- 每个模板 1 行修改：`physics-core.js` → `experiment-core.js`
- 批量脚本方案（用 node 或 PowerShell replace-in-files）

### W5 · 迁移后 Smoke（30min）

- 新建 `tests/e2e/iframe-smoke/migration.spec.ts`
- 4 采样测试：friction / pressure / combustion-conditions / refraction
- `npm run test:e2e` 全绿 · 确认 11 迁移零 regression

### W6 · physics-core 删除 + arch-audit（20min · R-G1）

- `git rm public/templates/_shared/physics-core.js`
- `scripts/arch-audit.sh` 新增 5th check: iframe 底座单一
- 本地再跑 smoke + arch-audit 确认全绿

### W7 · Track-C 路线图固化（50min）

- `docs/roadmap-g.md` 新建（~2500 字 · 三轨 + 未来候选 + ADR 链）
- `docs/architecture-constraints.md` 追加 C-3 + 使用记录 #8
- `.workflow/skills/iframe-rpc-safety.md` 新建（3 规则 + SOP + checklist）
- `workflow.config.js` projectSkills 加 iframe-rpc-safety
- `docs/editor-framework.md` 加链接

### W8 · 终局验证 + 归档（20min）

- `scripts/check.sh` 三件套 + `npm run test:e2e` + `bash scripts/arch-audit.sh`
- 4 gate 全绿 → 写 code.diff / test-report / review-output / deploy-output

---

## 9 · 对抗自审（Adversarial Review）

### 挑战 1: "测试先行不是 over-engineering?"

- **反驳**：F 阶段 bug 链（c85d25d + 80ce8f8 + afd1a92 + 6fe982a）= 4 次修复才全对 · 全部是**事后发现**
- 若有 smoke · 第一次 bug 就会被 CI 拦住
- e2e 投入 ~2.5h · 未来能省 X 次 4h 的 bug 调试 · 复利收益

### 挑战 2: "C-3 是不是重复 C-1 C-2?"

- **反驳**：
  - C-1 管 framework（TS 侧）
  - C-2 管老实验模板（HTML 侧业务逻辑）
  - C-3 管**共享底座**（HTML 侧工具层）· 三者不重叠
- C-3 诞生的必要性：本轮发现一个"灰区"——底座不属于 framework（C-1）也不属于业务模板（C-2）· 必须独立条款

### 挑战 3: "删除 physics-core 会不会破坏外部 iframe 消费者?"

- **反驳**：
  - 全项目 `rg physics-core` 只在 `public/templates` 里有 · 无外部消费
  - 即使有遗漏 · arch-audit 会立即暴露（W6 之后）
  - 比保留死代码的长期债务小

### 挑战 4: "不跑 CI 集成是不是偷懒?"

- **反驳**：
  - Coze 环境不确定性 + R-G2 Playwright 装依赖风险
  - 本地 checker 覆盖已达 90% · 边际收益递减
  - G+1 明确列为候选 · 不是忘记 · 是优先级选择

---

## 10 · Quality Gates（PLAN 开始前）

ARCHITECT 交付物须通过 3 个 gate：

- ✅ Scorecard 14 项全有可执行验证
- ✅ 7 Wave 每个含时间估计 + 产出 + 验证点
- ✅ 6 FM 每个有检测 + 恢复

---

## 11 · 🛑 MANDATORY REVIEW GATE — STOP HERE

以上是 G 阶段架构设计方案。请审查后做出决定：

1. ✅ 批准 — 继续到 PLAN 阶段做 Wave/任务细化
2. ❌ 拒绝 — 需要修改（请说明修改意见）
3. ⚠️ 有保留地批准 — 继续但记录风险

请回复 1/2/3 或直接说明您的意见。

---

## Architecture Scorecard

14 维度 · 每项含可执行验证 · 与 §3 完全同步：

| 维度 | 目标 | 验证路径 |
|------|------|---------|
| 类型安全 | TSC 0 保持 | `npx tsc --noEmit` |
| Jest | 563+ 保持 | `npx jest` 全绿 |
| e2e 覆盖 | 4 深度 + 4 浅度全绿 | `npm run test:e2e` |
| 底座单一 | physics-core 引用清零 | `rg physics-core public/templates` |
| 向后兼容 | 13 老模板零变化 | 2 采样纳入 smoke |
| 零 runtime 依赖 | Playwright 仅 devDep | package.json 检查 |
| 物理守护 | arch-audit pass | `bash scripts/arch-audit.sh` |
| 文档归档 | 3 文档齐全 | 文件存在 grep |
| Scope 纯净 | 分 track commit | git log 验证 |
| 最小扰动 | ≤5 行/迁移模板 | diff 统计 |
| 回滚能力 | Wave 独立 commit | 8 commit |
| 视觉基线 | 8 PNG 存在 | `ls __screenshots__/` |
| Skill 注册 | projectSkills 含 | workflow.config.js grep |
| 跨 session 防复发 | constraints C-3 明示 | grep C-3 |

---

## Scenario Coverage

14 场景覆盖 · 正向 7 + 反向 7 · 每个 G-Goal 至少 1 场景验证：

**正向**：
1. 合法迁移：新模板用 experiment-core 正常工作
2. 合法依赖：experiment-core → window globals (EurekaHost/EurekaCanvas/EurekaHints)
3. smoke compute 实验通过
4. smoke 迁移采样通过
5. TSC+Jest 保持绿
6. arch-audit exit 0
7. 下轮 /wf Agent 读 C-3 并遵守

**反向**：
8. 有模板引用 physics-core → arch-audit fail → 阻塞
9. smoke iframe timeout → test red → 阻塞
10. EurekaCanvas 合并漂移 → smoke 抓到
11. 新 /wf 改 experiment-core 破坏 RPC → smoke red
12. pixel diff flaky → D-G3 已拒绝（V2 截图不 diff）
13. Coze 装不上 Playwright → D-G5 OOS
14. commit 跨 track → G-Goal-12 拦截

---

## Failure Model

6 FM · 每个含检测 + 恢复 + 不扩散性：

| FM | 描述 | 检测点 | 恢复动作 |
|----|------|-------|---------|
| FM-G1 | W3 EurekaCanvas 合并 API 行为漂移 | 肉眼验证未迁移模板 | 对比 diff · 保留内联 |
| FM-G2 | W4 迁移漏改某模板 | W5 smoke red | `rg physics-core` 手动审 · 补改 |
| FM-G3 | Playwright Windows 装失败 | W1 install 报错 | 降级手动下载 + executablePath |
| FM-G4 | dev server 冷启动 smoke timeout | W2 首运行 | webServer.timeout 120s · 预热 |
| FM-G5 | 删 physics-core 后发现外部引用 | W6 后 smoke red | 回滚 delete commit |
| FM-G6 | Scope creep 跨 track 改动 | 每 commit diff | revert 跨 track · 留下次 |

**失败不扩散性**：
- Wave 级 commit（8 Wave）· 失败最多回滚 1 Wave（~40min）
- Track-B 先行 · Track-A 有 smoke 守护
- Track-C 在最后 · 文档错不影响代码

---

## Migration Safety Case

**兼容性契约**（5 维度保持 100% 兼容）：

| 对象 | G 前 | G 后 | 兼容性 |
|------|------|------|--------|
| `window.EurekaHost` 7 方法 | 两版同签 | 统一 experiment-core | ✅ |
| `window.EurekaCanvas` | physics-core 独有 | **融入 experiment-core** | ✅（原样复制）|
| `window.EurekaHints` | physics-core 独有 | 融入 experiment-core | ✅ |
| `window.bindParam/getParam/requestCompute` | experiment-core 独有 | 不变 | ✅ |
| iframe ↔ host L4 协议 | v2-atomic | 不变 | ✅ |

**回滚方案**：
- Wave 级：每 Wave commit 独立 · `git revert <wave-sha>`
- 整体：`git reset --hard 6fe982a`（回 F 阶段末尾）
- 零副作用证据：除 11 模板改 1 行外 · 所有代码契约 100% 保持

**漂移检测**：
- arch-audit.sh 新 check · 机器守护
- smoke 测试每次可触发
- 未来 /wf Agent 读 constraints C-3 + skill

---

## Consumer Adoption Design

**消费者适应路径**：

| 消费者 | 动作 | 工作量 |
|--------|------|--------|
| 13 原 experiment-core 模板 | 零 | 0 |
| 11 待迁 physics-core 模板 | script src 1 行 | ~1min × 11 |
| tests/e2e/ | 新建 2 spec + 8 基线 PNG | W1-W2 |
| package.json | +1 devDep + 1 script | 1min |
| playwright.config.ts | 新建 | 5min |
| arch-audit.sh | +1 check | 2min |
| docs/roadmap-g.md | 新建 | W7 |
| docs/architecture-constraints.md | +C-3 + #8 | W7 |
| .workflow/skills/iframe-rpc-safety.md | 新建 | W7 |
| workflow.config.js | 注册 skill | 1min |

**IDE Agent UX**：
- 修改 experiment-core.js → 3 个守护信号触发（smoke red · skill 提醒 · constraints 明示）
- 新建 iframe 模板 → 必须引用 experiment-core（否则 arch-audit red）

**采用成功判定**：
- 短期（G 完成）：13 G-Goal 全通过 · smoke 全绿 · arch-audit exit 0
- 中期（G+1、G+2 轮）：未来 2 轮 /wf 无新增 physics-core 引用
- 长期（3 个月）：iframe 层 bug report 数量下降 ≥ 50%
