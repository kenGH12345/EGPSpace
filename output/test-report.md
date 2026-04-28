# Test Report · Session wf-20260428120154.

**执行**: `npm test` (Jest) + `npx tsc --noEmit`

## 总览
- **Test Suites**: 18 passed, 18 total
- **Tests**: **403 passed, 403 total** ✅
- **TSC**: 0 errors ✅
- **Time**: ~1.7s
- **零回归**: 上轮的 393 基线测试全部保持绿

## 新增覆盖（本轮 +10 tests）

| 测试文件 | 测试数 | 覆盖对象 |
|----------|-------|----------|
| `src/lib/framework/__tests__/assembly.test.ts` | 34 | **Wave 1.5 Gate**：五件套 + 5 mock domain 跨域通用性 |
| `src/lib/framework/domains/circuit/__tests__/circuit-assembly.test.ts` | 11 | Circuit 绑定 + DSL ≡ literal + 参考 DTO 快照 |
| `src/lib/engines/__tests__/circuit-engine-v2.test.ts` | **10** | Engine dual-path + 4 边界 + 反应集成 + 失败降级 |

（前两个文件在上一 workflow 已 accounted；本轮仅 +10）

## AC 验收（强制条款）逐条证据

### AC-A 通用化 ✅
- 测试：`AC-A · framework/assembly is domain-agnostic · no domain-specific keyword appears in framework/assembly/*.ts`
- 机制：扫描 `spec.ts, errors.ts, validator.ts, assembler.ts, fluent.ts, index.ts` 每一行（跳过 `*` / `//` 注释行），检查禁词列表
- 禁词：`battery`, `bulb`, `resistor`, `circuit\b`, `lens`, `lightSource`, `optics`, `flask`, `reagent`, `spring`, `pendulum`, `cell\b`, `osmosis`
- 结果：0 匹配 ✅

### AC-B 结构化 ✅
五件套各有独立 describe 测试块：
- `Assembly Framework · spec.ts (isAssemblySpec, emptySpec)` — 2 tests
- `Assembly Framework · errors.ts` — 1 test
- `Assembly Framework · validator.ts` — 6 tests
- `Assembly Framework · assembler.ts` — 3 tests
- `Assembly Framework · fluent.ts` — 4 tests

### AC-C 可扩展 ✅
- 测试：`test.each(ALL_MOCK_DOMAINS)` × 2 paths = 10 组
- 5 mock domain：`mock-optics`, `mock-chemistry`, `mock-mechanics`, `mock-biology`, `circuit`
- 每个走 literal + DSL 两条路径
- 全部 10 组 GREEN ✅

### AC-D 可维护 ✅
- 测试 1：`每个 framework/assembly 文件 ≤ 250 行` — PASS（max=fluent.ts ~155）
- 测试 2：`添加第 6 个 mock domain 要求 zero edits 到 framework/assembly/*` — PASS

### AC-E 可配置 ✅
- 测试：`test.each(ALL_MOCK_DOMAINS)('literal and DSL produce equivalent DTO')`
- 5 个 domain 各自执行一次"literal spec → graph.toDTO() === DSL build → graph.toDTO()"
- 全绿 ✅

## 最高风险验证（PLAN 中 R-A/R-B/R-C）

### R-A · Wave 1.5 Gate 是否通过
- 结果：**通过**。5 mock domain 34/34 绿。装配层抽象质量合格。

### R-B · TS 泛型推断是否爆炸
- 结果：**未爆炸**。`FluentAssembly<D, C>` + `Assembler<D, C>` 的双泛型在所有 5 mock 子类中正常推断，无需 `as any`。

### R-C · Engine dual-path 误判
- 结果：**4 种边界全部正确分派**。
  - `{voltage,r1,r2}`（无 graph）→ v1.1 ✅
  - `{voltage, graph: 'string'}`（graph 非对象）→ v1.1 ✅
  - `{voltage, graph: {}}`（graph 空对象）→ v1.1 ✅
  - `{voltage, graph: {components: []}}`（components 空数组）→ v1.1 ✅
  - `{graph: {components: [...]}}`（正常 v2）→ v2 ✅

## Engine v2.0 功能验证

| 场景 | 测试 | 结果 |
|------|------|------|
| 串联电路 6V + 10Ω + 6Ω bulb | perComp.r1.current = 0.5625A (9V/16Ω) | ✅ |
| 单电阻电路 6V + 10Ω | perComp.r1.current = 0.6A | ✅ |
| 过载反应触发（24V → 2W bulb） | `burntCount ≥ 1` + 事件含 `overload` | ✅ |
| 动态 overrides 补丁 | `{overrides: {b1: {voltage: 12}}}` → 电流翻倍 | ✅ |
| 未知 kind 处理 | `errorCode: 'assembly_build_failed'` + state='error' | ✅ |
| 引擎实例可重用 | 多次调用结果一致 | ✅ |

## 零回归验证

- 上轮 393 测试全部保持通过
- `circuit-engine-v2` 新增后，既有 `atomization-refactor.test.ts`、`framework.test.ts` 等未受影响
- v2-atomic circuit.html 的 v1.1 调用路径（`{voltage, r1, r2, topology}`）经 dispatch 守卫仍走 `_computeLegacy` 且输出字段不变

## 测试命令

```bash
npx tsc --noEmit            # 类型检查 → 0 errors
npx jest --no-colors        # 全量测试 → 403/403 PASS
```

## 结论

- ✅ 全部验收项（AC-A ~ AC-E + 上轮 AC-1 ~ AC-7）有测试证据
- ✅ 403/403 测试全绿
- ✅ TSC 零错误
- ✅ 零回归（旧路径 `{voltage, r1, r2}` 不变）

**TEST 阶段 PASS · 可进入 REVIEW**
