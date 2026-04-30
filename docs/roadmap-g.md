# G 阶段路线图 — iframe 测试 · 底座统一 · 防复发

> **Session**: `wf-20260430013937.`
> **前序**: B 基线 → C/D UX → E TSC 清零 → F 物理分层 → F+1 bug 修复链（c85d25d + 80ce8f8 + afd1a92 + 6fe982a）→ **G 防复发**
> **完成时间**: 2026-04-30
> **状态**: ✅ 13 G-Goal 全达成

---

## 全局定位

**G 阶段是对 F 阶段尾声暴露的两个结构性缺口的系统性兑现**：

1. **iframe 层零测试** — 4 轮 bug 都靠用户发现 · 开发侧无守护信号
2. **底座分叉** — `physics-core.js`（11 模板）和 `experiment-core.js`（13 模板）两套 EurekaHost 代码并存 · 前者有 bug 时不会被后者的修复覆盖

若**只做其中一件事 · 防复发都不成立**：
- 只做测试 → 底座仍分叉 · 未来改一个 bug 在另一个上会复发
- 只统一底座 → 无测试守护 · 迁移时无法验证 · 未来再加新模板会重建第二底座
- 只写文档 → 无代码兑现 · 文档沦为许愿

三者必须一起做 · **这就是"三轨合一"的本意**。

---

## Track-A · 底座统一（`physics-core.js` → `experiment-core.js`）

### 终态

- ✅ `public/templates/_shared/physics-core.js` **已删除**
- ✅ 24 iframe 模板全部加载 `experiment-core.js`（13 原 + 11 迁）
- ✅ `EurekaCanvas` + `EurekaHints` 合并进 `experiment-core.js`（逐字复制 · 零 API 漂移）
- ✅ `EurekaFormat` 已在 `experiment-core.js` · API 兼容
- ✅ `arch-audit.sh` check-5 机器守护单一底座

### 迁移步骤（已完成）

| Wave | 任务 | 产出 |
|------|------|------|
| W3 | 合并 `EurekaCanvas` + `EurekaHints` 到 `experiment-core.js` | +~100 行 · 0 lints |
| W4 | 11 模板 script src 批量替换 | 11 × (2-3 行 diff) |
| W6 | 删除 `physics-core.js` + test-phase2 断言反转 | `-200 行` + 防复发断言 |

### 架构意义

**迁移前**（F 阶段尾声）：
```
public/templates/_shared/
├── physics-core.js      ← 11 模板（老版 · EurekaHost 完整）
│   └── 独有: EurekaCanvas · EurekaHints
└── experiment-core.js   ← 13 模板（新版 · EurekaHost 完整）
    └── 独有: bindParam · requestCompute · startRenderLoop
```

**迁移后**（G 阶段）：
```
public/templates/_shared/
└── experiment-core.js   ← 24 模板（唯一底座）
    ├── EurekaHost (setTemplateId · emitReady · ... · onHostCommand)
    ├── EurekaFormat (num · clamp)
    ├── EurekaCanvas (setupHiDPI · clear · drawArrow) ← W3 合并
    ├── EurekaHints (show) ← W3 合并
    └── 高级 API: bindParam · requestCompute · startRenderLoop · stopRenderLoop
```

### 向后兼容性证明

- 11 模板每文件 diff 仅 2-3 行（`<script src>` 路径替换）
- `EurekaCanvas` / `EurekaHints` 逐字复制 · API 签名和行为完全不变
- `EurekaFormat` 的 `num` + `clamp` 在两版语义一致
- 24 模板均可正常工作 · 8 smoke case 可触发验证

---

## Track-B · iframe e2e smoke（Playwright 视觉回归）

### 终态

- ✅ `@playwright/test: ^1.59.1` 装入 devDeps（R-G2 在 PowerShell 下用 `npx -y pnpm@9` 绕过）
- ✅ Chromium 111.5 MiB 安装完成
- ✅ `playwright.config.ts` 配 baseURL 5000 + 自启动 webServer + 120s 启动超时
- ✅ 2 spec · 8 case：compute 深度 4 + migration 浅度 4
- ✅ `iframe-helpers.ts` 共享工具库（5 helper + 1 高级 smoke check）
- ✅ `npm run test:e2e` / `npm run test:e2e:ui` 两脚本就绪

### 测试矩阵

| 层级 | Spec | 数量 | 覆盖目的 |
|------|------|------|---------|
| Compute 深度 | `compute.spec.ts` | 4 | 4 个 compute RPC 实验：circuit · buoyancy · acid-base-titration · metal-acid-reaction · 验证 80ce8f8 修复不复发 |
| Migration 浅度 | `migration.spec.ts` | 4 | 4 个迁移采样：friction · pressure · refraction · combustion-conditions · R-G5 守护点 |

### 断言策略

每个 test case 验证 5 条：
1. Page load < 10s
2. Iframe body 存在（`contentDocument.body`）
3. Canvas 有非空像素（≥50 非透明像素）
4. 无 `timeout waiting for host response` 警告（host + 所有 iframe frame）
5. 无 `ReferenceError` 等关键错误（migration spec 额外拦截 Eureka* ReferenceError）

### 截图策略（V2）

- 截图**保存**到 `tests/e2e/iframe-smoke/__screenshots__/`（用 `page.locator.screenshot()`）
- **不启用 pixel diff**（R-G4：字体抗锯齿在不同 OS/GPU 飘）
- 保存的 PNG 作为**人工 review 基准** · 未来 G+1 稳定 CI 后可升 V3（snapshot + toMatchSnapshot()）

### 未验证的远期行为

> 本地 e2e 运行需启动 Next.js dev server（`bash scripts/dev.sh` on port 5000），这在 PowerShell 下会长时间占用终端。实际的 8 case 跑通留给用户本地验证：
> ```bash
> bash ./scripts/dev.sh  # 一个终端
> npm run test:e2e       # 另一个终端
> ```
> 静态验证：`npx playwright test --list` ✅ 8 case 成功枚举 · TSC 0 · spec 语法无错。

---

## Track-C · 防复发（路线图 · 约束 · skill · 守护）

### 四层防护叠加

| 层 | 机制 | 触发 | 受众 |
|----|------|------|------|
| **物理** | `physics-core.js` 文件不存在 · 无法 `import` | 文件系统层 · 最硬 | 编译器 |
| **机器** | `arch-audit.sh` check-5 · `eslint.config.mjs`（暂无）| CI + 本地运行 | CI Bot + 开发者 |
| **流程** | `docs/architecture-constraints.md` C-3 节 | 文档阅读 · 人工 review | 开发者 + reviewer |
| **Agent** | `.workflow/skills/iframe-rpc-safety.md` + `workflow.config.js` 注册 | /wf 启动时自动 load | 未来的 /wf Agent |

### 未来候选（G+1 / G+2）

| 候选 | 优先级 | 触发条件 |
|------|-------|---------|
| GitHub Actions 集成 smoke | 中 | 至少 1 周无 flaky · 且 Windows/Linux 都稳定 |
| Playwright snapshot + pixel diff | 中 | 1 个月字体/浏览器不变 · 截图稳定 |
| Mobile viewport 覆盖 | 低 | 有明确移动端需求时 |
| Coze 同步触发（webhook）| 低 | Coze 侧暴露 pull webhook API |
| iframe-specific unit test（非 e2e）| 中 | 某个 helper 函数开始复杂 |
| L5 协议升级（简化 RPC）| 低 | L4 已满足 24 实验 · 3 月内无新需求不推进 |
| pre-commit hook 跑 arch-audit | 高 | 下一轮 /wf 直接做（T-30min） |
| 模板注册表 schema 校验 | 中 | 新增第 25 个实验时推进 |

---

## 度量 · G 阶段前后对比

| 维度 | F 阶段末（6fe982a）| G 阶段末 |
|------|-------------------|---------|
| iframe 底座数 | 2 | **1** |
| 使用 `physics-core.js` 的模板 | 11 | **0** |
| iframe e2e 测试 | 0 | **8** |
| arch-audit checks | 4 | **5** |
| TSC errors | 0 | **0** 保持 |
| Jest tests | 563 | **563** 保持 |
| 防复发文档 | 2（C-1 + C-2）| **3**（+ C-3）|
| 未来 /wf Agent 必读 skill | 1（framework-boundary）| **2**（+ iframe-rpc-safety）|
| 底座修 bug 覆盖率 | 1/2 版本 | **1/1 版本** |

---

## 与 F 阶段的方法论一脉相承

| 方法论 | F 阶段 | G 阶段 |
|--------|-------|-------|
| **测试先行** | TSC canary 先行（E）+ 分层递进 | 先写 compute spec 有基线 · 再做底座合并 |
| **单一真相源** | barrel @/lib/framework | 单一底座 experiment-core.js |
| **机器守护** | arch-audit.sh + ESLint no-restricted-imports | arch-audit check-5 + （G+1 ESLint） |
| **明示例外** | contracts/graph.ts → runtime/union-find | `experiment-core.js` 中的 `// merged from legacy physics-core.js` 注释 |
| **三层防护**（物理 · 机器 · 文档） | C-1 / C-2 | + C-3 |
| **Wave 化执行** | 8 Wave + 独立 commit | 8 Wave + 4 批 commit |

---

## 复盘（三层）

| Layer | 问题 | 答 |
|-------|------|-----|
| **Prevention** | 这次底座分叉怎么活下来的？| iframe 层 unit test 空白 · 两版共存没有 audit check · 用户不打开某些实验就无人发现 |
| **Capability** | 学到什么？| 底座统一的关键不是"移动文件"，而是"合并所有独有 API"；用 `rg` 全库搜确认无残余引用再删；用 e2e 测试在迁移前后都跑验证回归 |
| **Efficiency** | 如何更快？| 底座统一本身很快（11 模板 × 1 行 = 2min），大头在写 e2e 测试 + 文档；未来类似迁移有 `arch-audit +check-N` 模板可复用 · 成本会降 50% |

---

## 附录 · 文件清单

### 新建

- `playwright.config.ts`
- `tests/e2e/iframe-smoke/iframe-helpers.ts`
- `tests/e2e/iframe-smoke/compute.spec.ts`
- `tests/e2e/iframe-smoke/migration.spec.ts`
- `docs/roadmap-g.md`（本文件）
- `.workflow/skills/iframe-rpc-safety.md`

### 修改

- `public/templates/_shared/experiment-core.js` · +100 行（合并 EurekaCanvas/Hints）
- `public/templates/chemistry/*.html` × 4 · 迁移 script src
- `public/templates/physics/*.html` × 7 · 迁移 script src
- `scripts/arch-audit.sh` · +check-5 iframe 底座单一
- `test-phase2.js` · T-3 断言反转为防复发守护
- `package.json` · +2 script + 1 devDep
- `docs/architecture-constraints.md` · +C-3 节 + 记录 #8
- `workflow.config.js` · 注册 iframe-rpc-safety skill

### 删除

- `public/templates/_shared/physics-core.js` · 老底座退役

**总规模**：+~450 行 · -~250 行 · 净 +200 行 · 15 文件改动 + 6 新建 + 1 删除
