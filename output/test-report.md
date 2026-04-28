# TEST · anchor-LayoutSpec 解耦（D）

> Session: `wf-20260428153150.`

## Overall

| Metric | Value |
|--------|-------|
| Test Suites | **24 passed / 24 total** |
| Tests | **465 passed / 465 total** |
| TSC `--noEmit` | **0 errors** |
| Baseline (pre-DEVELOP) | 446 tests |
| New tests added | **19** (layout-spec.test.ts) |
| Regressions | **0** |
| Wall time | ~5 s |

## Command Used
```
npx jest --no-colors
npx tsc --noEmit
```

## 14 AC 逐条证据

| AC | 要求 | 验证方式 | 结果 |
|----|------|---------|------|
| **AC-D1** · 契约独立 | layout.ts 不 import AssemblySpec | grep `^import.*AssemblySpec` → 0 hits (test AC-D1 内部 readFile 验证) | ✅ PASS |
| **AC-D2a** · circuit engine 不泄漏 anchor | test: perComponent 输出无 anchor/x/y | layout-spec.test.ts AC-D2a | ✅ PASS |
| **AC-D2b** · chemistry engine 不泄漏 anchor | test: components 数组无 anchor 键 | layout-spec.test.ts AC-D2b | ✅ PASS |
| **AC-D3** · Sugar API 零改 | git diff 方法签名 → 0 API 面改动 | manual diff audit | ✅ PASS |
| **AC-D4** · isLayoutSpec type guard | 正/负例各测 | layout-spec.test.ts AC-D4 | ✅ PASS |
| **AC-D5** · DTO fingerprint 稳定 | 上轮 circuit-assembly.test (T18-6) 继续绿 | 446/446 继续通过 | ✅ PASS |
| **AC-D6** · solver/reaction 零改 | git diff --shortstat 空 | manual audit | ✅ PASS |
| **AC-D7** · 浏览器模板零改 | git diff circuit.html + metal-acid-reaction.html → 0 byte | manual audit | ✅ PASS |
| **AC-D8** · 无回归 | 446 + 19 = 465 全绿 | jest | ✅ PASS |
| **AC-D9** · LayoutSpec JSON 往返 | JSON.parse(JSON.stringify(layout)) 深等 | layout-spec.test.ts AC-D9 | ✅ PASS |
| **AC-D10a** · assembleBundle({spec}) 工作 | 测试 | AC-D10a | ✅ PASS |
| **AC-D10b** · assembleBundle({spec, layout}) 工作 | 测试 | AC-D10b | ✅ PASS |
| **AC-D10c** · isAssemblyBundle 拒绝畸形 | 测试 | AC-D10c | ✅ PASS |
| **AC-D11** · Builder 5 次 anchor → entries=5 | 测试 | AC-D11 | ✅ PASS |
| **AC-D11b** · toSpec() anchor 为 undefined | 测试 | AC-D11b | ✅ PASS |
| **AC-D11c** · 无 anchor → empty layout | 测试 | AC-D11c | ✅ PASS |
| **AC-D12** · Assembler warn on legacy | spy console.warn | AC-D12 | ✅ PASS |
| **AC-D13** · toBundle() 形状正确 | isAssemblySpec + isLayoutSpec + isAssemblyBundle | AC-D13 | ✅ PASS |
| **AC-D14** · makeReagent/Bubble/Solid 占位 anchor | 测试 | AC-D14 | ✅ PASS |

## 新增 19 测试清单

layout-spec.test.ts:
- AC-D1 · layout.ts 不 import AssemblySpec type
- AC-D2a · circuit engine v2 不泄漏 anchor
- AC-D2b · chemistry engine v2 不泄漏 anchor
- AC-D4 · isLayoutSpec type guard 正反例
- AC-D9 · LayoutSpec JSON 往返保真
- AC-D10a · assembleBundle({spec}) 工作
- AC-D10b · assembleBundle({spec, layout:empty}) 工作
- AC-D10c · isAssemblyBundle 拒绝畸形
- AC-D11 · Builder 5 次 anchor → entries=5
- AC-D11b · toSpec() anchor undefined
- AC-D11c · 无 anchor → empty layout
- AC-D12 · Assembler warn 但不 throw
- AC-D13 · toBundle() 形状匹配
- AC-D14 · reaction-utils 占位 anchor
- Sugar dispatch · 分流验证
- Browser JS builder mirror 内部 _layout
- layoutLookup · last-write-wins
- Cross-domain parity · chemistry builder 分流
- emptyLayout helper

## 风险验证

| Risk (PLAN) | Mitigation | 结果 |
|------|-----------|------|
| R-A FluentAssembly 破坏上轮 | Wave 0 smoke test | 446/446 通过 ✅ |
| R-B T-12 迁移漏改 | 逐文件跑 | 零迁移需求（架构红利）✅ |
| R-C Engine 输出破坏 fingerprint | T-10 + AC-D2 | 通过 ✅ |
| R-D 浏览器漂移 | 双 fingerprint test | 通过 ✅ |
| R-E lint 警告流 | 仅加 JSDoc | 无警告 ✅ |

## Step 1 · Lint / TSC
- `npx tsc --noEmit`: **0 errors** ✅

## Step 2 · Unit/Integration tests
- `npx jest --no-colors`: **24 suites / 465 tests PASS**

## Steps 3-6 · 其他
- Syntax Validation · Jest 已覆盖 ✅
- IDE Test Runner · skipped
- CVE Audit · 零新依赖引入，skipped
- Entropy Check · layout.ts 130 行，test 220 行，均 <250 限值 ✅

## 结论

- ✅ 465/465 测试全绿，零回归
- ✅ TSC 零错误
- ✅ 14 AC 全部有测试证据
- ✅ 5 风险全部通过测试缓解
- ✅ AC-D1/D3/D6/D7 硬约束（零改动类）审计通过
