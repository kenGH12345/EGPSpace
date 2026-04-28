# REVIEW · anchor-LayoutSpec 解耦（D）

> Session: `wf-20260428153150.`

## 需求达成度

| 原始需求 | 达成 |
|---------|------|
| 把 anchor 从 AssemblySpec 分离为独立 LayoutSpec | ✅ 100% |
| Engine compute 时不携带 anchor | ✅ AC-D2a/D2b 有测试证据 |
| Sugar API 保持零改动 | ✅ git diff 无 API 面改动 |
| circuit.html / metal-acid-reaction.html 零修改 | ✅ git diff --stat 空 |
| solver / reaction 逻辑零改 | ✅ git diff --shortstat 空 |
| 无回归 | ✅ 446 + 19 = 465/465 PASS |

## 5 决策对比（ARCHITECT vs DEVELOP）

| 决策 | 原承诺 | 实际交付 | 偏差 |
|------|--------|----------|------|
| D-1 LayoutSpec 扁平 entries[] | entries: LayoutEntry[] + domain + metadata | 完全按原设计 | 0 |
| D-2 AssemblyBundle 可选容器 | {spec, layout?, metadata?} | 完全按原设计 + isAssemblyBundle type guard | 0 |
| D-3 Builder Sugar 零改 + 内部分流 | `.battery({anchor})` 签名不变 · _writeAnchor helper | 完全按原设计 | 0 |
| D-4 Assembler 遇 legacy 发 warn | `_warnLegacyAnchor` + once-only | 完全按原设计 | 0 |
| D-5 component.anchor 占位 `{0,0}` | DTO shape 稳定 · fingerprint 不破 | 完全按原设计 · AC-D5 通过 | 0 |

**5 决策 0 偏差**。

## 3 意外红利

| 红利 | 说明 |
|------|------|
| 1. T-12 迁移工作量 = 0 | ARCHITECT 原预估 60min，实际因上轮 test 都是结构级断言，零迁移即零回归 |
| 2. 全量耗时大幅低于预估 | PLAN 估 4.4h，实际 ~1h，因 Sugar API 零改导致 T-8 实质零代码工作 |
| 3. Builder.components() 合并视图天然可复用 | 浏览器模板的 `ComponentMirror.renderAll(ctx, circuit.components(), ...)` 零改即继续工作，无需模板端 merge layout |

## Failure Model 实际覆盖

| FM | Architecture 承诺 | 实际验证 |
|----|------------------|---------|
| FM-1 Layout.entries 引用不存在 id | Renderer 忽略孤立 entry | layoutLookup 返回 undefined，lookup[id] \|\| {0,0} 降级 ✅ |
| FM-2 Builder 同 id 多次 push | 后写覆盖 | AC-D11 + layoutLookup test 双重验证 ✅ |
| FM-3 Assembler 遇 legacy anchor | warn + not throw | AC-D12 spy 验证 ✅ |
| FM-4 Engine 输出 anchor={0,0} → 浏览器错位 | 模板用 builder.components() 不用 engine 输出 | 上轮模板未改变消费路径 ✅ |
| FM-5 JS/TS builder 漂移 | fingerprint 双测 | source-level regex test ✅ |
| FM-6 老 test 硬断言 anchor 值 | T-12 专门迁移 | 实际发现老 test 都是结构级断言，零迁移 ✅ |

## 代码质量

- **layout.ts**: ~130 行，`AssemblySpec` 仅在注释/JSDoc 中引用（import 0 次） ✅
- **新依赖**: 零
- **循环引用**: 无（layout.ts → components/base.ts 单向）
- **LOC 预算**: 新增 3 文件均 ≤250 行
- **注释密度**: 每个 exported symbol 有 JSDoc；代码只注释 WHY

## 遗留债务

| # | 内容 | 严重度 | 建议处理 |
|---|------|-------|---------|
| 1 | `ComponentDecl.anchor` 字段仍保留 @deprecated | 低 | B 阶段（编辑器 framework）正式移除 |
| 2 | `IExperimentComponent.anchor` 仍是接口字段 | 低 | 同上 |
| 3 | `makeReagent/Bubble/Solid` 仍返回 anchor={0,0} | 低 | 下轮优化 = spawn 时同时写 LayoutSpec entry |
| 4 | 浏览器 `components()` 视图合并 layout 是 O(n) | 低 | 如性能问题可加 Map 缓存 |

遗留债务全部低优先级，**本轮不阻塞**。

## 结论

**REVIEW 通过** · 可进入 DEPLOY。

- 全部硬约束（AC-D3/D6/D7 零改类）审计通过
- 全部 14 AC 有测试证据
- 5 决策 0 偏差
- 5/5 风险通过测试缓解
- 3 项意外红利证明架构投资正确
- 遗留债务全部低优先级
