# F 阶段 · Review

> Session: wf-20260429132738. · 基线 e12560f · TEST 全过

## 需求兑现

| 需求 | 预期 | 实际 | 偏差 |
|------|------|------|------|
| framework 物理分层 | contracts/runtime/builders/domains 4 目录 | ✅ 完全落地（旧 4 目录已删）| 0 |
| E 阶段软条款物理化 | ESLint + arch-audit 替代自然语言规则 | ✅ 四件套齐全 | 0 |
| TSC 0 保持 | 不回归 E 阶段基线 | ✅ 0 errors（并额外清 E 遗留 3 个）| -3（好于预期）|
| Jest 563+ 保持 | 不回归 | ✅ 563/563 等价 | 0 |
| 零新依赖 | package.json 不改 | ✅ | 0 |
| 预估 5h | 完整 F 阶段 | ~90min（regex 批处理提速）| **-210min（超期完成）**|

## 5 决策对比

| 决策 | 预期 | 实际 |
|------|------|------|
| D-1 Proposal B' 目录级分层 | 15 文件分 9/5/1 | ✅ 严格按归属表 |
| D-2 type/impl dominance 判定 | 客观可操作 | ✅ 所有文件 co-located 保留 |
| D-3 不引 @framework paths alias | 单 barrel 稳定 | ✅ 下游 19 文件零改 |
| D-4 ESLint error + 零依赖 audit | 硬守护 | ✅ eslint 0 error · arch-audit 0 依赖 |
| D-5 AssemblyBundle 归 contracts/layout | AC-D1 兼容 | ✅ AC-D1 测试通过（精神保留） |

**0 决策偏差**

## 6 Failure Modes 审计

| FM | 预期风险 | 实际发生 | 处理 |
|----|---------|---------|------|
| FM-1 W3 GATE 失败 | 中概率 | ✅ W3 GATE 首次即过 tsc=0 | 无需回滚 |
| FM-2 测试 import 漏更 | 高概率 | ⚠️ 小规模 3 处（AC-D1/AC-A/AC-D）| 就地修 |
| FM-3 ESLint 误伤 framework | 中概率 | ✅ files glob 精确排除 | 无误伤 |
| FM-4 Windows bash 失败 | 中概率 | ⚠️ PowerShell 无 bash → 用 Git bash 路径 | 跑通 |
| FM-5 domains 相对路径漏网 | 高概率 | ✅ regex 批处理 + tsc canary 全覆盖 | 无泄漏 |
| FM-6 Scope creep | 中概率 | ✅ 全程位移 | 守住 |

**6/6 FM 覆盖 · 2 小波动（FM-2/FM-4）就地消化**

## 硬约束兑现四件套

| # | 件套 | 状态 |
|---|------|------|
| 1 | 物理目录分层（contracts/runtime/builders/domains）| ✅ |
| 2 | ESLint no-restricted-imports（error 级）| ✅ |
| 3 | scripts/arch-audit.sh（零依赖 · 4 check）| ✅ |
| 4 | architecture-constraints.md 更新 + framework-boundary.md skill | ✅ |

**R-F7 假兑现风险消除 · 未来 /wf Agent 有机器守护**

## 零回归审计

```bash
$ git diff --stat HEAD -- src/lib/framework/domains/chemistry public/templates package.json src/lib/editor | grep -v "\.workflow\|output"
```

- **templates/** 零改 ✅（C-2）
- **package.json** 零改 ✅（C-3）
- **editor/ React** 0 处 ✅（C-4 延续）
- **chemistry/circuit domain 业务代码** 零改（只改 import 路径）✅
- **测试总数** 563 = 563（无新增无删除）✅

## 意外红利 · 4 条

1. **~90min vs 预估 5h**（-82% 耗时 · regex 批处理是王道）
2. **顺手修 E 阶段遗留 3 tsc errors**（E 阶段 commit 前 tsc 未跑 · AC-E11 防护必要性进一步印证）
3. **下游 19 文件 0 改动**（barrel 设计的复利）
4. **arch-audit 明示例外机制**（graph.ts → union-find）成为未来边界例外的范本模式 · 不是隐藏违规而是透明留痕

## 遗留债务（明示）

| # | 债务 | Sev | 建议轮次 |
|---|------|----:|---------|
| 1 | `contracts/graph.ts` → `runtime/union-find` 明示例外 | Low | 未来如有 G 阶段重构 · 可拆 DomainGraph class 到 runtime |
| 2 | `arch-audit.sh` 未完整循环检测（当前仅方向性检查）| Low | 需要时加 madge 或手写 DFS |
| 3 | `AC-A contracts/ 豁免`（ComponentDomain union 的合法列举）| Low | 持续观察，未来 domain 增加时审视 |

## 决策复盘

| 层次 | 问题 | 答案 |
|------|------|------|
| **Prevention** | 如何避免下次犯同样错？| E 阶段遗留 3 errors 是"commit 前未跑 full tsc"的重演 · **AC-E11 / scripts/check.sh 必须作为 commit 前强制动作**（未来应加 git pre-commit hook）|
| **Capability** | 可复用模式 | **Wave 递进 + regex 批处理 + tsc canary 三件套**是大规模物理重构的通用模式 · 未来遇到类似迁移（如 G/H 阶段）可直接套用 |
| **Efficiency** | 最省时选择 | **"目录级分层 + 文件级 co-location"** 战略决策（ANALYSE 修正）避免了文件级拆分的 3x 工作量 · 真实代码审计比想象更可靠 |

## 结论

**F 阶段需求 100% 兑现 · 0 决策偏差 · 6 FM 全覆盖 · 零回归 · 3 小债务明示 · 4 红利超预期**

REVIEW PASS · 进入 DEPLOY。
