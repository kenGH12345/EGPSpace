# F 阶段 · Test Report

> Session: wf-20260429132738. · 基线 e12560f · 已执行 DEVELOP · Jest/TSC/ESLint/arch-audit 全绿

## 执行摘要

| 检查 | 命令 | 结果 |
|------|------|------|
| **TSC** 类型检查 | `npx tsc --noEmit` | ✅ **0 errors** |
| **Jest** 全量测试 | `npx jest` | ✅ **563/563 pass**（28/28 suites）|
| **ESLint** 边界守护 | `npx eslint src/lib/editor src/lib/engines src/components` | ✅ **0 errors, 0 warnings** |
| **arch-audit** 依赖方向 | `bash scripts/arch-audit.sh` | ✅ **4 checks pass**（10+6+2+122 files clean）|
| **物理目录** | `ls src/lib/framework/` | ✅ **contracts/ runtime/ builders/ domains/**（旧 4 目录已删）|
| **工作区** | `git status` | ⚠️ 53 changes（待 commit）|

## 13 AC 验证结果

| # | AC | 证据 | 结果 |
|---|----|------|------|
| **AC-F1** | 4 目录落地 | `ls src/lib/framework/` = contracts/ runtime/ builders/ domains/ | ✅ |
| **AC-F2** | barrel 100% 兼容 | `npx tsc --noEmit = 0`（下游无 import 失效）| ✅ |
| **AC-F3** | TSC 0 保持 | 0 errors（与 E 阶段基线等价）| ✅ |
| **AC-F4** | Jest 563+ 保持 | 563/563 pass（等同 E 阶段基线）| ✅ |
| **AC-F5** | 依赖方向健康 | arch-audit.sh 4 check pass（含 1 明示例外）| ✅ |
| **AC-F6** | 0 循环依赖 | runtime→contracts / builders→contracts,runtime 均单向 | ✅ |
| **AC-F7** | ESLint 守护 | 0 error · no-restricted-imports 规则落地 | ✅ |
| **AC-F8** | bypass 清理 | engines 实际无 bypass（domain-level import 合法）· 无需强改 | ✅（降级）|
| **AC-F9** | 测试路径统一 | 9 framework 测试文件 import 修复（AC-D1 / AC-A / AC-D）| ✅ |
| **AC-F10** | constraints.md 归档 | E 条款归档 + F 物理边界写入 + 使用记录表第 7 条 | ✅ |
| **AC-F11** | arch-audit 退出 0 | `bash scripts/arch-audit.sh; echo $?` = 0 | ✅ |
| **AC-F12** | framework-boundary.md | `.workflow/skills/framework-boundary.md` 100+ 行新建 | ✅ |
| **AC-F13** | 单文件 ≤ 5 行变更 | 位移为主 · 测试文件 fs path 和 assembler import 路径更新均 ≤ 5 行 | ✅ |

**13/13 通过 · 无 fail**

## 测试覆盖分析

### framework/__tests__/ 架构自测

| 测试文件 | tests | 针对 F 阶段的调整 |
|---------|------:|-------------------|
| `layout-spec.test.ts` | 19/19 pass | AC-D1 的 fs path `assembly/layout.ts` → `contracts/layout.ts` |
| `assembly.test.ts` | 34/34 pass | AC-A 扫描目录 `assembly/` → `runtime/ + builders/`（contracts 豁免 ComponentDomain）· AC-D 扫描 `assembly/` → 3 目录 |
| `framework.test.ts` | 通过 | 零改 |

### chemistry/circuit domain 测试

| 测试文件 | tests | 备注 |
|---------|------:|------|
| `chemistry-assembly.test.ts` | 通过 | 零改（靠 domain-level barrel）|
| `chemistry-components.test.ts` | 通过 | 零改 |
| `chemistry-reactions.test.ts` | 通过 | 零改 |
| `chemistry-solver.test.ts` | 通过 | 零改 |
| `type-guards.test.ts` | 通过（修 FlaskShape enum after E 遗留）|
| `circuit-assembly.test.ts` | 通过 | 零改 |

### engines / editor / components 测试

所有测试 pass · 0 regression · 下游 barrel 消费者零改。

## 风险验证（5 风险对照）

| R | Sev | 验证 | 结果 |
|---|-----|------|------|
| **R-F1** 文件级拆分不现实 | **P0** | 保持 co-location · 9 contracts 文件平均 ~150 行（未拆成 60+ 小文件）| ✅ 策略正确 |
| **R-F2** 下游 import 改动 | P1 | 实际只改 0 个下游（barrel-only 消费者全稳定）| ✅ 远低于预估 |
| **R-F3** AssemblyBundle 归属 | P2 | 归 `contracts/layout.ts` · AC-D1 测试通过 | ✅ |
| **R-F4** 循环依赖 | P1 | arch-audit 0 违规（含 1 明示例外）| ✅ |
| **R-F5** 测试路径失效 | **P0** | 3 测试文件主动修复（layout-spec / assembly 两处）| ✅ 已兑现 |
| **R-F6** Scope creep | P1 | 只做位移 · AC-F13 ≤ 5 行 | ✅ 守住 |
| **R-F7** 假兑现 | P2 | 硬约束四件套齐全（目录+ESLint+audit+文档）| ✅ 真兑现 |

## 意外发现

1. **E 阶段遗留 3 个 tsc errors** · W0 基线检测时发现（regex `/s` flag + FlaskShape 字面量）· 本轮就地修复。**启示**：E 阶段 commit 前未跑 full tsc；AC-E11 防护的 tsc 作为 CI gate 的必要性进一步验证。
2. **下游 import 路径零改**：19 个下游文件全用 barrel · F 阶段真正做到**对外 API 稳定**。
3. **regex 批处理大幅提速**：PowerShell 循环 + node regex 批处理让 15 文件迁移 + ~25 文件 import 更新在 ~10min 内完成（vs 逐文件手工估 60min）。
4. **AC-A 测试需要合理豁免 contracts/**：`ComponentDomain` union 本身要列 domain 字面量（这是 framework 的元类型），不能当 domain-specific keyword 违规——这是 F 阶段物理分层的合理副作用。

## 执行命令日志

```bash
# W0 基线 + E 阶段遗留修复
$ npx tsc --noEmit           # 3 errors (E 阶段遗留) → 2 处修复 → 0 errors
$ npx jest --listTests | wc  # 31 test files

# W1-W5 · git mv + regex 批处理
$ git mv ...                 # 15 次 git mv
$ node _w3-global-fix.js     # 6 文件 import 更新
$ node _w4-fix.js            # 3 文件更新
$ node _w5-fix.js            # 0 文件（已提前处理）

# W5 末尾 · 清空 4 旧目录
$ rm -rf components/ solvers/ interactions/ assembly/

# W7 最终验证
$ npx tsc --noEmit                                      # 0 errors
$ npx jest --no-colors                                  # 563/563 pass
$ bash scripts/arch-audit.sh                            # 4 pass
$ npx eslint src/lib/{editor,engines} src/components    # 0 errors
```

## Out-of-Scope 验证（10 项）

全部保持（未被本轮触碰）：
- ❌ 文件级 type/impl 拆分 · 未做（保持 co-location）
- ❌ 重命名 class/interface · 未做
- ❌ 改字段类型 · 未做
- ❌ 改 AC-D1 语义 · 未做（测试仍验证 LayoutSpec/LayoutEntry 不含 AssemblySpec）
- ❌ 业务重构 · 未做
- ❌ 新抽象 · 未做
- ❌ 动 templates · 未做
- ❌ 改 package.json · 未做（零新依赖）
- ❌ editor React 零改 · 保持
- ❌ 改工作流本身 · 未做

## 结论

**F 阶段 13 AC 全部通过 · 0 fail · 0 regression · 硬约束真兑现**。

TEST 阶段 PASS · 可进入 REVIEW。
