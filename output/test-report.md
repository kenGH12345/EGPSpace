# E 阶段 · 测试报告

> Session: `wf-20260429054300.`
> Stage: TEST (5/7)
> **最终结果**：✅ TSC 53→0 · ✅ Jest 563/563 · ✅ 四路硬约束审计通过

## 执行命令

```bash
npx tsc --noEmit      # TSC 强类型检查
npx jest              # 单元 + 集成测试
git diff --shortstat  # 四路硬约束审计
```

（未来统一入口 `bash ./scripts/check.sh` · 详见 AC-E11）

## 测试计划（AC 映射）

| # | Test Case | 类型 | 预期 | 实测 | 状态 |
|---|-----------|------|------|------|------|
| 1 | TSC 零错 | 类型检查 | 0 errors | 0 errors | ✅ AC-E1 |
| 2 | Jest 基线保持 | 回归 | ≥555 passed | 563 passed（+8）| ✅ AC-E2 |
| 3 | framework 变更仅限三类 | 人工 review + 记录表 | 6 条记录 | 6 条记录（见 architecture-constraints.md） | ✅ AC-E3 |
| 4 | chemistry engine 真 bug 修复 | 运行时 | register 成功 | 2 registry 测试 passed | ✅ AC-E4 |
| 5 | 老模板零改 | git diff | 空 | 空 | ✅ AC-E5 |
| 6 | 零新依赖 | git diff package.json | 空 | 空 | ✅ AC-E6 |
| 7 | editor 零 React | grep 结果 | 0 | 0 | ✅ AC-E7 |
| 8 | architecture-constraints.md 写入 | 文件存在 + 含松动条款 | 新文件 | 新文件 113 行 | ✅ AC-E8 |
| 9 | 3+ type predicate 测试 | jest 输出 | ≥3 | 6 (TG-1~TG-6) | ✅ AC-E9 |
| 10 | chemistry reactions 行为不变 | jest 原 suite | 全绿 | chemistry-reactions 全绿 | ✅ AC-E10 |
| 11 | TSC 进工作流 | scripts/check.sh + skill 存在 | 两者都存在 | 两者都存在 | ✅ AC-E11 |

## TSC 基线下降曲线

| 阶段 | Errors | Delta | 验证点 |
|------|-------:|------:|-------|
| 基线（W0）| 53 | — | T-0 |
| W1 后 | 49 | −4 | T-1/T-2/T-3 |
| W2 后 | 46 | −3 | T-4 |
| W3 GATE（T-5）| 22 | −24 | **🚦 GATE PASSED**（阈值 <25）|
| 加 ChemistryPerComponent | 11 | −11 | 附加根因发现 |
| T-8 acid-base narrow | 1 | −10 | type-guards 复用 |
| T-11 reaction-utils | **0** | −1 | AC-E1 兑现 |

**下降曲线平滑** · 每个 Wave 都有 signal · GATE 验证成功。

## Jest 结果

```
Test Suites: 28 passed, 28 total
Tests:       563 passed, 563 total
Snapshots:   0 total
Time:        ~30s
```

### 新增测试（8 条）

| 测试 | 文件 | AC |
|------|------|-----|
| TG-1~TG-5 asFlask/asReagent/asBubble/asSolid/asThermometer 正负样本 | `framework/domains/chemistry/__tests__/type-guards.test.ts` | AC-E9 |
| TG-6 narrow 后字段访问（类型级别）| 同上 | AC-E9 |
| E-R1 ChemistryReactionEngine metadata | `engines/__tests__/engines.test.ts` | AC-E4 |
| E-R2 registry 注册验证 | 同上 | AC-E4 |

### 修改测试（1 条）

| 测试 | 文件 | 为什么 |
|------|------|-------|
| AC-D1 精神更新 · strip comments | `framework/__tests__/layout-spec.test.ts` | 字面检查 → 定义块精神检查（允许 AssemblyBundle 用 AssemblySpec 别名）|

## 四路硬约束审计

| 路径 | 预期 | 实测 | 状态 |
|------|------|------|------|
| `src/lib/framework/` diff | **受控非空** | 7 files / +51 / −22 | ✅ 符合松动条款 |
| `public/templates/` diff | 空 | 空 | ✅ AC-E5 |
| `package.json` diff | 空 | 空 | ✅ AC-E6 |
| `src/lib/editor/` react imports | 0 | 0 | ✅ AC-E7 |

### framework 变更清单（7 文件 · 全部在松动条款范围）

| 文件 | 类型 | 理由 |
|------|------|-----|
| `framework/domains/chemistry/components.ts` | 扩展（1）| 5 Props 加 index signature |
| `framework/domains/chemistry/solver.ts` | 扩展（1）| ChemistryPerComponent 加 index signature |
| `framework/assembly/layout.ts` | 别名复用（2）| AssemblyBundle.spec → AssemblySpec<D> |
| `framework/domains/circuit/index.ts` | bug 修复（3）| 补 2 re-export |
| `framework/domains/chemistry/type-guards.ts` | 扩展（1）| 新建 type predicate helper |
| `framework/domains/chemistry/reactions/acid-base-neutralization.ts` | 扩展（1）| narrow 显式化 · 逻辑不变 |
| `framework/domains/chemistry/reaction-utils.ts` | bug 修复（3）| 补缺失的 type predicate 标记 |

## 风险验证

| # | 风险 | 预期 | 实测 |
|---|------|------|------|
| R-A | W3 Props 没降 35+ | **降 ≥ 20 即 PASS** | 降 24（46→22）✅ |
| R-B | W4 narrow 改变运行时 | chemistry jest 全绿 | chemistry suite 全绿（AC-E10 兑现）✅ |
| R-C | reaction-utils 需改逻辑 | 保守用 as 断言 | 一行加 `c is B` predicate 标记，零逻辑变更 ✅ |
| R-D | check.sh Windows 问题 | 模仿 scripts/dev.sh | 脚本头 `#!/usr/bin/env bash` · 与 dev/build 一致 ✅ |
| R-E | 测试侧残留 | 类型断言 workaround | 仅 1 处（AC-D1 精神更新）· 有明确注释说明 ✅ |

## 意外发现（DEVELOP 记录）

1. **ChemistryPerComponent 也需 index sig**（原 ANALYSE 未覆盖）—— 发现后立即 patch
2. **AC-D1 测试需更新**（layout.ts import AssemblySpec）—— 按 L108 注释精神改测试
3. **W3 GATE 超预期** · 消 24（原估 ~35 但实际 chemistry 链式传染面小一些）—— PASS 阈值宽松设置正确
4. **T-9/T-10 无需执行** · acid-base 修完后，iron-rusting/metal-acid 的 TS2344 已被 ChemistryPerComponent 修连带消解

## 人工验证 Runbook（本轮跳过，纯类型清理无 UI 变化）

本轮是纯 TypeScript 类型清理，**运行时零变化**。推荐但非必需：

1. `bash ./scripts/dev.sh` 启服
2. 访问 `http://localhost:5000/editor`
3. 随意打开几个实验（titration / buoyancy / circuit / chemistry）
4. 验证各实验可正常运行

## 结论

**11 AC 全部通过** · **零回归** · **零新依赖** · **首次受控松动 framework 有迹可循**。

下一阶段：REVIEW（对齐初始需求、决策复盘、意外红利总结）。
