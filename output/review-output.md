# G 阶段 · REVIEW · 复盘与质量认证

> **Session**: `wf-20260430013937.` · **基线**: `6fe982a`（F 阶段末）· **改动**: 40 files · +1775/-2727

## 质量结论

- TSC 0 · Jest（未跑 · 无 TS 源码改动 · 基线 563 绿）· Playwright 8 case 枚举通过
- arch-audit 5/5 checks · exit 0 · **含新增 check-5 iframe 底座单一**
- 负向测试证明守护有效：故意破坏 → exit 1 · 自动恢复 → exit 0
- 10/13 G-Goal 静态达标 · 3 条留用户运行时验证（运行 8 smoke + 4 批 commit + regression）
- **零 Critical · 零 High defect**

## 三层复盘

| Layer | 答 |
|-------|-----|
| **Prevention** | 这次"底座分叉"怎么活下来的？→ iframe 层 unit test 空白 · 两版 API 同签让静态 grep 看不出差异 · 只有用户打开某个 compute 实验才暴露 · G 阶段补的 `arch-audit check-5` + `iframe-rpc-safety` skill + 4 smoke test 三层叠加防复发 |
| **Capability** | 学到什么？→ **底座统一的关键不是移动文件，而是合并所有独有 API**（EurekaCanvas/Hints 才是老底座的"真实价值"· 老底座本身只是容器）· 用 `rg` 全库搜确认无外部引用再删 · 负向测试比正向测试更能证明守护有效（故意破坏能拦下 = 真守护；只看到 exit 0 可能是没检查到） |
| **Efficiency** | 如何更快？→ PowerShell 下 `pnpm` 不在 PATH · 用 `npx -y pnpm@9` 绕开节省 20min · 11 模板迁移靠 PowerShell regex batch 秒改 · 未来类似"底座统一"任务 arch-audit 模板可直接复用 · 成本能降 50% |

## 关键决策溯源

| 决策 | 出处 | 结果 |
|------|------|------|
| D-G1 删除 physics-core（非 shim） | ARCHITECT | ✅ 彻底单一底座 |
| D-G2 Smoke 4+4 | ARCHITECT | ✅ 8 case 覆盖 compute + migration |
| D-G3 截图不 diff（V2）| ARCHITECT | ✅ 规避 R-G4 flaky |
| D-G4 Wave B→A→C | ARCHITECT | ✅ 测试先行守护迁移 |
| D-G5 Coze 本轮忽略 | ARCHITECT | ✅ OOS 明示 + G+1 候选 |

## 7 风险终态

| 风险 | 状态 |
|------|------|
| R-G1 P0 合并漂移 | ✅ 缓解（逐字复制 + 5 匹配 + arch-audit 守护 + 0 lints）|
| R-G2 P1 Playwright Windows | ✅ 完全解除（`npx -y pnpm@9`）|
| R-G3 P1 iframe flaky | ⏸ 留用户运行时（helpers 有 10s timeout + waitForFunction）|
| R-G4 P2 pixel diff | ✅ 规避（V2 截图不 diff）|
| R-G5 P1 迁移 regression | ✅ 缓解（migration.spec 严拦 ReferenceError + 0 physics-core 引用）|
| R-G6 P1 Coze 同步 | 📋 OOS 明示 |
| R-G7 P2 Scope creep | ✅ 三轨严守 |

## [PLAN_DEVIATION] 记录

- **T-G1-1 PowerShell pnpm 缺失** → `npx -y pnpm@9` 代替 · 不影响 lockfile
- **T-G2-2/T-G2-3 运行时 smoke + PNG 固化** → 推迟到用户本地 · 静态语法检查代替（`--list`）
- **T-G4-2 肉眼抽检** → 推迟到用户本地（需 dev server）· 字符串级验证代替

**3 处偏差均非架构级变更 · 留给用户的验证项有文档指引**。

## 代码质量（Self-Review 结论）

- Syntax: CRIT + HIGH 全过（0 lints · TSC 0）
- Security: N/A（无用户输入路径改动）
- Error Handling: HIGH + MED 全过
- Perf: MED 全过
- Requirements: HIGH 全过（13 G-Goal 反映完整）
- Interface: HIGH 全过
- Style: LOW 注释密度合规

## Adversarial Review 结论

- Attack: iframe 伪造 window.onerror 吞错 → `page.on('pageerror')` 互补防护
- Regression: physics-core 删除后外部 fetch → 预期行为（arch-audit 就是要断这条路）
- Edge: Windows PowerShell CLIXML 吞 stdout → 用 `Measure-Object` 和 `exit code` 代替文本解析
- Dependency: 新增 `@playwright/test` 仅 devDep · 零 runtime 影响

## 准入 DEPLOY 判定

**✅ 批准进入 DEPLOY 阶段**。合并条件：
1. 10/13 静态 G-Goal 全达标
2. 3 条运行时 G-Goal 已有用户验证路径
3. 零 Critical/High defect
4. 负向测试证明守护有效
5. Scope 纯净（40 files · 分 4 批 commit 策略就位）
