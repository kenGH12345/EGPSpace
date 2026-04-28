# DEPLOY · anchor-LayoutSpec 解耦（D）

> Session: `wf-20260428153150.`
> Deployment Type: 本地落盘（代码已写入工作区）

## 文件变更总清单

| 类别 | 数量 | 说明 |
|------|------|------|
| 新建 TS 源码 | 1 | `src/lib/framework/assembly/layout.ts` |
| 新建测试 | 1 | 19 测试全绿 |
| 修改 TS 源码 | 7 | fluent/assembler/spec/barrel×2/base/reaction-utils/circuit.ts |
| 修改浏览器 JS | 2 | circuit-builder.js + chemistry-builder.js |
| 修改 HTML 模板 | **0** | ✅ AC-D7 硬约束 |
| 修改 solver/reactions | **0** | ✅ AC-D6 硬约束 |
| 新建文档 | 1 | `docs/layout-spec.md` |
| 修改文档 | 1 | `docs/component-framework.md`（索引） |
| 工作流产出 | 7 | output/{analysis,architecture,execution-plan,code.diff,test-report,review-output,deploy-output}.md |
| **合计** | **20** | |

## 前置检查（已在 TEST/REVIEW 完成）
- ✅ TSC `--noEmit` 零错误
- ✅ Jest 465/465 全绿
- ✅ 无新增 dependency
- ✅ AC-D1/D3/D6/D7 硬约束审计全通过

## 浏览器人工验证 Runbook

启动服务并验证既有实验零破坏：

```bash
bash ./scripts/dev.sh    # 启动后访问 http://localhost:5000
```

| # | 操作 | 预期结果 |
|---|------|---------|
| 1 | 访问 `/experiments/physics/circuit` | 电路正常渲染 · 元件位置与之前一致 · 滑块响应正常 |
| 2 | 过载触发灯泡烧毁（电压>20V） | BurntBulb 正常 spawn + 渲染 |
| 3 | 访问 `/experiments/chemistry/metal-acid-reaction` | Flask + Zn + H2SO4 正常渲染 |
| 4 | 调高浓度触发反应 | Bubble + ZnSO4 正常 spawn + 堆叠显示（`bubbleStackY` 逻辑未变仍工作） |

若 1-4 全部正常 = 零回归 = 部署成功。

## 回滚方案

| 范围 | 命令 | 耗时 |
|------|------|------|
| 全部撤回 | `git checkout HEAD -- src/lib/framework/assembly/layout.ts src/lib/framework/assembly/fluent.ts src/lib/framework/assembly/assembler.ts src/lib/framework/assembly/index.ts src/lib/framework/assembly/spec.ts src/lib/framework/index.ts src/lib/framework/components/base.ts src/lib/framework/domains/chemistry/reaction-utils.ts src/lib/engines/physics/circuit.ts public/templates/_shared/circuit-builder.js public/templates/_shared/chemistry-builder.js docs/layout-spec.md docs/component-framework.md && rm src/lib/framework/__tests__/layout-spec.test.ts` | < 3 min |
| 仅删 LayoutSpec 类型（保留 Sugar 改动） | `rm src/lib/framework/assembly/layout.ts` + 回滚 barrel exports | < 1 min |

## 提交建议

```
feat(framework): anchor-LayoutSpec 解耦（为编辑器 framework 做前置清理）

- 新增 LayoutSpec<D> + AssemblyBundle<D> + helpers（layout.ts）
- FluentAssembly.add() 内部分流：anchor 写入 _layout，不再污染 _spec
- 新增 toLayout() / toBundle() 终端操作
- Assembler.assembleBundle() + 遇 legacy decl.anchor 发 warn（不 throw）
- ComponentDecl.anchor / IExperimentComponent.anchor 标 @deprecated
- 浏览器 circuit-builder.js + chemistry-builder.js 同步分流（toLayoutSpec / components 合并视图）
- reaction-utils.ts 的 anchor hardcode 重构为 PLACEHOLDER_ANCHOR 常量
- CircuitEngine._normaliseToSpec 不再转移 anchor

硬约束（全部兑现）：
- Sugar API 签名零改
- circuit.html + metal-acid-reaction.html 零 byte 变动
- solver/reactions 目录零行数变动
- 上轮 446 测试继续绿 + 新增 19 测试

测试：465/465 PASS（上轮 446 + 19 新增）· TSC 零错误 · 零新依赖
```

## 后续（B 阶段预告）

本轮为下一轮 B（编辑器 framework）做好了架构清理：
- ✅ Spec / Layout 职责分离 → 编辑器可独立操作 layout 不触发 engine 重算
- ✅ AssemblyBundle 契约就位 → 编辑器保存/加载格式已定义
- ✅ Sugar API 向后兼容 → 编辑器可直接消费现有 Builder 输出

B 阶段可直接启动：`framework/editor/`（画布 + 元件面板 + 拖拽 + 端口连线模式）

## 交付完成

14/14 任务 100% 完成。全工作流耗时约 1h（实际）vs 4.4h（预估），节省 ~77%，主要红利来自 Sugar API 零改设计使得老测试零迁移。
