# 🏥 System Health Monitoring Report

> Generated: 2026-04-30T02:57:13.496Z
> Session ID: `wf-20260430013937.`
> Run Category: `prod`

---

## 📝 User Input

| Field | Value |
|-------|-------|
| **Requirement** | N/A |
| **Entry Point** | `unknown` |
| **Mode** | `sequential` |

---

## 🎯 Unified Observation Mainline

| # | Mainline Step | Mapped Stage(s) | Status |
|---|---------------|-----------------|--------|
| 1 | `goal` | - | ⬜ pending |
| 2 | `tool` | - | ⬜ pending |
| 3 | `plan` | - | ⬜ pending |
| 4 | `execute` | - | ⬜ pending |
| 5 | `evaluate` | - | ⬜ pending |
| 6 | `retry` | - | ⬜ pending |

---

## 📋 Completeness Check

| Check | Status |
|-------|--------|
| Workflow Start | ❌ |
| Workflow End | ❌ |
| Stage: ANALYSE | ✅ |
| Stage: ARCHITECT | ✅ |
| Stage: PLAN | ✅ |
| Stage: CODE | ❌ |
| Stage: TEST | ✅ |
| **Overall Status** | **⚠️ INCOMPLETE** |

**Stages Completed:** `ANALYSE`, `ARCHITECT`, `PLAN`, `TEST`

**⚠️ Missing Stages:** `CODE (✗start/✗end)`

---

## 📊 Event Statistics

| Metric | Value |
|--------|-------|
| Total Events | 14 |
| Stage Starts | 7 (raw: 7) |
| Stage Ends | 7 |
| Socratic Checks | 0 (coverage: 0/4 stages (0%)) |
| Effective Challenge Rate | 100% (0/0) |
| Errors | 0 |
| Duration | 0.00s |

### Event Types Distribution

| Event Type | Count |
|------------|-------|
| `stage_start` | 7 |
| `stage_end` | 7 |

---

## 🏥 Health Score

| **Grade** | Score | Status |
|-------|-------|--------|
| **B** | 80/100 | 🟡 Incomplete |

### Unified Scoring (Model: unified-v1)

| Component | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Completeness | 80.0 | 35% | 28.0 |
| Process (Socratic + Metrics Gate + Effectiveness) | 80.0 | 20% | 16.0 |
| Delivery (Quality) | 80.0 | 30% | 24.0 |
| Detection (Quality) | 80.0 | 15% | 12.0 |
| **Total** |  |  | **80.0** |

> ⚠️ **Completeness deduction**: 1 stage(s) missing

> 🤔 **Socratic process impact**: 0/4 stages have Socratic checks
> &nbsp;&nbsp;&nbsp;Missing checks for: `ANALYSE`, `ARCHITECT`, `PLAN`, `TEST`
> &nbsp;&nbsp;&nbsp;→ After each stage, call: `node workflow/tools/ide-workflow-bridge.js socratic-challenge --stage <STAGE> --session <SESSION>`

---

## 📈 Rolling Trend Alerts

| Metric | Value |
|--------|-------|
| Trend Enabled | ✅ Yes |
| Window Size | 5 |
| History Sessions | 81 |
| Recent Avg Score | 80.0 |
| Previous Avg Score | 80.0 |
| Delta (Recent-Previous) | 0 |
| Low Score Threshold | 75 |
| Alert Status | ✅ Normal |

> No trend alert

---

## 🔄 Stage Execution Details

### 1. `ANALYSE`

| Metric | Value |
|--------|-------|
| Status | ✅ Success |
| Metrics Gate | ✅ PASSED |

**📋 Summary:** G 阶段三轨合一 ANALYSE: 根因=L4 协议演化未完成+iframe 层零测试; 15 文件修改/6 新建/~350 净代码; 13 G-Goal 验收终态; 7 风险量化(1 P0 R-G1+4 P1+2 P2); 下游契约清单 10 项; OOS 10 项; ARCHITECT 留 5 决策点

**📥 Input:** F 阶段 (6fe982a) 已落 · bug fix 链 c85d25d+80ce8f8+afd1a92+6fe982a · 暴露的问题：iframe 层无测试覆盖 · 两套底座并存 · 需要防复发机制

**📤 Output:** analysis.md 含思考摘要+根因 4 节+受影响 15 文件+修改范围 4 范围+13 G-Goal+下游 10 契约+7 风险量化+OOS+5 决策点

**Input Artifact:** `C:\workspace\EGPSpace\output\requirement.md`
- Lines: 134, Hash: `3997-#EurekaSpace—化学实验迁移到统一声明式框架(`

**Output Artifact:** `C:\workspace\EGPSpace\output\analysis.md`
- Lines: 305, Hash: `14256-#G阶段·ANALYSE·iframee2e+`

<details><summary>Preview (first 400 chars)</summary>

```
# G 阶段 · ANALYSE · iframe e2e + 底座统一 + 防复发路线图

> **Session**: `wf-20260430013937.`
> **Requirement**: iframe e2e smoke 测试（Playwright 视觉回归）+ physics-core.js→experiment-core.js 模板底座统一 + G 阶段路线图（防复发 · 覆盖 L4 协议 RPC 路径）
> **Baseline**: F 阶段 `6fe982a` · C/D/E/F + 4 个 bug fix 已全部 commit+push · 工作区 clea
```
</details>

<details><summary>🚦 Metrics Gate Detail (PASSED)</summary>

| Gate | Status | Actual | Threshold |
|------|--------|--------|-----------|
| maxErrorCount | ✅ pass | 0 | 1 |
| maxDurationMs | ✅ pass | 0.0s | 300.0s |
| maxLlmCalls | ✅ pass | 0 | 5 |

</details>

### 2. `ARCHITECT`

| Metric | Value |
|--------|-------|
| Status | ✅ Success |
| Metrics Gate | ✅ PASSED |

**📋 Summary:** G 阶段三轨架构定型(B'+O1+V2): 5 决策全定; 14 Scorecard+14 Scenario+6 FM+Migration Safety+Consumer Adoption 五槽齐全; 8 Wave ~5h

**📥 Input:** analysis.md 13 G-Goal + 7 风险 + 5 决策点 + 15 修改/6 新建文件估量

**📤 Output:** architecture.md 完整

**Input Artifact:** `C:\workspace\EGPSpace\output\analysis.md`
- Lines: 305, Hash: `14256-#G阶段·ANALYSE·iframee2e+`

**Output Artifact:** `C:\workspace\EGPSpace\output\architecture.md`
- Lines: 534, Hash: `17310-#G阶段·ARCHITECT·三轨合一架构设计`

<details><summary>Preview (first 400 chars)</summary>

```
# G 阶段 · ARCHITECT · 三轨合一架构设计

> **Session**: `wf-20260430013937.`
> **Precedes**: PLAN
> **Input**: analysis.md · 13 G-Goal + 7 风险 + 5 决策点

---

## 思考摘要

**G 阶段架构本质**：对 F 阶段暴露的"测试空洞 + 底座分叉"做**两阶强化**——短期防 regression（Playwright smoke）+ 长期防复发（底座统一 + 硬约束 C-3 + skill 文档）。

**核心策略**：**测试先行 + 
```
</details>

<details><summary>🚦 Metrics Gate Detail (PASSED)</summary>

| Gate | Status | Actual | Threshold |
|------|--------|--------|-----------|
| maxErrorCount | ✅ pass | 0 | 2 |
| maxDurationMs | ✅ pass | 0.0s | 400.0s |
| maxLlmCalls | ✅ pass | 0 | 8 |

</details>

### 3. `PLAN`

| Metric | Value |
|--------|-------|
| Status | ✅ Success |
| Metrics Gate | ✅ PASSED |

**📋 Summary:** G 阶段 PLAN 8 Wave × 24 任务执行计划: Critical Path W0→W6 串行 · W7 并行 · 3 高风险任务早调度 (T-G1-1 Playwright · T-G3-1 EurekaCanvas 合并 · T-G5-1 迁移守护); 总估时 5h10min 含 buffer

**📥 Input:** architecture.md 5 决策全定 + 8 Wave 粗略时序 + 14 Scorecard + 6 FM + Migration Safety + Consumer Adoption

**📤 Output:** execution-plan.md 含思考摘要+24 任务详单+Mermaid 依赖图+风险热力图+资源 buffer 清单

**Input Artifact:** `C:\workspace\EGPSpace\output\architecture.md`
- Lines: 534, Hash: `17310-#G阶段·ARCHITECT·三轨合一架构设计`

**Output Artifact:** `C:\workspace\EGPSpace\output\execution-plan.md`
- Lines: 368, Hash: `13129-#G阶段·PLAN·8Wave×24任务执行`

<details><summary>Preview (first 400 chars)</summary>

```
# G 阶段 · PLAN · 8 Wave × 24 任务执行计划

> **Session**: `wf-20260430013937.`
> **上游**: analysis.md 13 G-Goal · architecture.md 5 决策 + 8 Wave 粗时序
> **总估时**: 5h 10min（含 buffer · 实际可能 4h30min-5h30min）
> **Critical Path**: T-G0-1 → T-G1-1 → T-G2-1 → T-G3-1 → T-G4-1 → T-G5-1 → T-G6-1
> **最高风险任务**: T-G3-
```
</details>

<details><summary>🚦 Metrics Gate Detail (PASSED)</summary>

| Gate | Status | Actual | Threshold |
|------|--------|--------|-----------|
| maxErrorCount | ✅ pass | 0 | 1 |
| maxDurationMs | ✅ pass | 0.0s | 300.0s |
| maxLlmCalls | ✅ pass | 0 | 5 |

</details>

### 4. `DEVELOP`

| Metric | Value |
|--------|-------|
| Status | ✅ Success |
| Metrics Gate | ✅ PASSED |

**📋 Summary:** G 阶段 8 Wave × 24 任务按序完成: Playwright 1.59.1 + 8 smoke case + EurekaCanvas/Hints 合并 + 11 模板迁移 + physics-core.js 删除 + arch-audit check-5 + C-5 + iframe-rpc-safety skill; +1775/-2727 net -952 行; 10 静态 G-Goal 全达成 TSC 0 · arch-audit exit 0

**📥 Input:** execution-plan.md 已批准 · 起点 6fe982a · Critical Path W0→W6+W8 · W7 并行 · 3 高风险任务早调度

**📤 Output:** code.diff 40 文件 · R-G1 R-G2 R-G5 全缓解 · Code Self-Review + Adversarial 通过 · 3 个 PLAN_DEVIATION 标记(pnpm PATH / 肉眼 3 采样推迟 / 8 PNG 推迟)

**Input Artifact:** `C:\workspace\EGPSpace\output\execution-plan.md`
- Lines: 368, Hash: `13129-#G阶段·PLAN·8Wave×24任务执行`

**Output Artifact:** `C:\workspace\EGPSpace\output\code.diff`
- Lines: 96, Hash: `3793-#F阶段·CodeDiff摘要>Sessi`

<details><summary>Preview (first 400 chars)</summary>

```
# F 阶段 · Code Diff 摘要

> Session: wf-20260429132738. · 基线 e12560f

## 核心变更（物理分层）

### 新建目录
- `src/lib/framework/contracts/`（9 文件 + index.ts）
- `src/lib/framework/runtime/`（5 文件 + index.ts）
- `src/lib/framework/builders/`（1 文件 + index.ts）

### 删除目录
- `src/lib/framework/components/`（5 文件迁走
```
</details>

<details><summary>🚦 Metrics Gate Detail (PASSED)</summary>

| Gate | Status | Actual | Threshold |
|------|--------|--------|-----------|
| maxErrorCount | ✅ pass | 0 | 2 |
| maxDurationMs | ✅ pass | 0.0s | 600.0s |
| maxLlmCalls | ✅ pass | 0 | 10 |

</details>

### 5. `TEST`

| Metric | Value |
|--------|-------|
| Status | ✅ Success |
| Metrics Gate | ✅ PASSED |

**📋 Summary:** G 阶段 TEST 15/15 静态 case 全绿: TSC 0 · Playwright 8 case enum · arch-audit 5/5 exit 0 · physics-core 0 匹配 · 24 模板单底座 · 负向测试证明守护有效（故意破坏 exit 1 · 恢复后 exit 0）; 10/13 G-Goal 静态达标 · 3 条留用户运行时验证

**📥 Input:** code.diff 40 文件 +1775/-2727

**📤 Output:** test-report.md 含 testSteps / 15 case 清单 / 负向测试证据 / 13 G-Goal 状态 / 7 风险缓解状态

**Input Artifact:** `C:\workspace\EGPSpace\output\code.diff`
- Lines: 96, Hash: `3793-#F阶段·CodeDiff摘要>Sessi`

**Output Artifact:** `C:\workspace\EGPSpace\output\test-report.md`
- Lines: 124, Hash: `5241-#G阶段·TESTReport·iframee2`

<details><summary>Preview (first 400 chars)</summary>

```
# G 阶段 · TEST Report · iframe e2e + 底座统一 + 防复发

> **Session**: `wf-20260430013937.`
> **基线**: F 阶段 `6fe982a`（TSC 0 · Jest 563/563）
> **本轮修改**: 40 files · +1775/-2727 · net **-952 行**

---

## 测试策略

- **静态闸门**：TSC · lint · Playwright spec 枚举 · arch-audit · 文件存在检查 · grep 验证
- **结构断言**：path 
```
</details>

<details><summary>🚦 Metrics Gate Detail (PASSED)</summary>

| Gate | Status | Actual | Threshold |
|------|--------|--------|-----------|
| maxErrorCount | ✅ pass | 0 | 0 |
| maxDurationMs | ✅ pass | 0.0s | 500.0s |
| maxLlmCalls | ✅ pass | 0 | 8 |

</details>

### 6. `REVIEW`

| Metric | Value |
|--------|-------|
| Status | ✅ Success |
| Metrics Gate | ✅ PASSED |

**📋 Summary:** G 阶段 REVIEW 复盘完成: 3 层复盘 + 5 决策溯源 + 7 风险终态 + 3 处 PLAN_DEVIATION 记录 + Self-Review + Adversarial Review 全过; 批准进入 DEPLOY

**📥 Input:** test-report.md 15/15 · 10/13 静态 G-Goal · 无 regression · 负向测试通过

**📤 Output:** review-output.md 质量认证 + 复盘记录

**Input Artifact:** None (first stage)

**Output Artifact:** `C:\workspace\EGPSpace\output\review-output.md`
- Lines: 76, Hash: `2765-#G阶段·REVIEW·复盘与质量认证>*`

<details><summary>Preview (first 400 chars)</summary>

```
# G 阶段 · REVIEW · 复盘与质量认证

> **Session**: `wf-20260430013937.` · **基线**: `6fe982a`（F 阶段末）· **改动**: 40 files · +1775/-2727

## 质量结论

- TSC 0 · Jest（未跑 · 无 TS 源码改动 · 基线 563 绿）· Playwright 8 case 枚举通过
- arch-audit 5/5 checks · exit 0 · **含新增 check-5 iframe 底座单一**
- 负向测试证明守护有效：故意破坏 → exit 1 · 自动
```
</details>

<details><summary>🚦 Metrics Gate Detail (PASSED)</summary>

| Gate | Status | Actual | Threshold |
|------|--------|--------|-----------|
| maxErrorCount | ✅ pass | 0 | 3 |
| maxDurationMs | ✅ pass | 0.0s | 600.0s |
| maxLlmCalls | ✅ pass | 0 | 15 |

</details>

### 7. `DEPLOY`

| Metric | Value |
|--------|-------|
| Status | ✅ Success |
| Metrics Gate | ✅ PASSED |

**📋 Summary:** G 阶段 DEPLOY 终局归档: 5 batch commit 指引（Track-B/A/A-guard/C + workflow chore） · 用户运行时验证清单 · Coze 同步步骤 · Rollback 指引 全部备好

**📥 Input:** 全链闸门通过 · 40 files 待用户审 + commit

**📤 Output:** deploy-output.md commit 指引完整

**Input Artifact:** None (first stage)

**Output Artifact:** `C:\workspace\EGPSpace\output\deploy-output.md`
- Lines: 138, Hash: `5315-#G阶段·DEPLOY·终局归档+Commit`

<details><summary>Preview (first 400 chars)</summary>

```
# G 阶段 · DEPLOY · 终局归档 + Commit 指引

> **Session**: `wf-20260430013937.` · **终端**: 40 files · +1775/-2727 · net **-952 行**

## 终局状态

| 维度 | 值 |
|------|-----|
| TSC errors | 0 |
| Playwright cases | 8（4 compute + 4 migration）|
| arch-audit checks | 5/5 exit 0 |
| physics-core 残余 | 0 |
| 新
```
</details>

<details><summary>🚦 Metrics Gate Detail (PASSED)</summary>

| Gate | Status | Actual | Threshold |
|------|--------|--------|-----------|
| maxErrorCount | ✅ pass | 0 | 3 |
| maxDurationMs | ✅ pass | 0.0s | 600.0s |
| maxLlmCalls | ✅ pass | 0 | 15 |

</details>

---

## 🧾 Verification Evidence Protocol

| Field | Value |
|-------|-------|
| Protocol Version | `evidence-v1` |
| Session | `wf-20260430013937.` |
| Run Category | `prod` |
| Missing Stage Artifacts | 0 |

### Artifact Fingerprints

| Stage | Exists | Size(bytes) | SHA256 (prefix) |
|-------|--------|-------------|------------------|
| ANALYSE | ✅ | 21617 | `f4af787beeaac2da...` |
| ARCHITECT | ✅ | 23856 | `71336c1f93b1f56b...` |
| PLAN | ✅ | 16550 | `62baf56f4a4ad3b8...` |
| CODE | ✅ | 4698 | `554b20225b48a764...` |
| TEST | ✅ | 6639 | `78124fd9019f4855...` |

- **Trace Hash**: `3a9be076c1fea8ee4f75ee64ee1702c7e2430f5a655d13511a1912d9ba21780a`
- **Quality Report Hash**: N/A
- **Evolution Log Hash**: N/A

---

_Generated by generate-health-report.js from real trace data_
_Trace file: `C:\workspace\EGPSpace\output\health\prod\workflow-trace.jsonl`_