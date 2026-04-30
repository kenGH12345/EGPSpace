# G 阶段 · DEPLOY · 终局归档 + Commit 指引

> **Session**: `wf-20260430013937.` · **终端**: 40 files · +1775/-2727 · net **-952 行**

## 终局状态

| 维度 | 值 |
|------|-----|
| TSC errors | 0 |
| Playwright cases | 8（4 compute + 4 migration）|
| arch-audit checks | 5/5 exit 0 |
| physics-core 残余 | 0 |
| 新底座模板数 | 24/24 |
| 防复发层数 | 4（物理 + 机器 + 流程 + Agent skill）|

## 用户 Commit 指引（4 批分 track）

用户在本地执行（推荐顺序）：

### Batch 1 · Track-B · `feat(e2e)`: Playwright 基础 + compute smoke

```bash
git add package.json pnpm-lock.yaml playwright.config.ts tests/
git commit -m "feat(e2e): 引入 Playwright + 4 compute iframe smoke + 4 migration smoke" \
  -m "G 阶段 Track-B · 添加 iframe 层 e2e 视觉回归基础设施。覆盖 80ce8f8 修复的 4 个 compute RPC 实验（防复发）+ 4 个 migration 采样（R-G5 守护迁移）。" \
  -m "新增:" \
  -m "- @playwright/test ^1.59.1 · Chromium 111.5 MB" \
  -m "- playwright.config.ts · baseURL 5000 + webServer 自启动（timeout 120s）" \
  -m "- tests/e2e/iframe-smoke/iframe-helpers.ts · 5 helper + 1 高级 smoke check" \
  -m "- compute.spec.ts · 4 case（circuit/buoyancy/acid-base/metal-acid）" \
  -m "- migration.spec.ts · 4 case（friction/pressure/refraction/combustion-conditions）· R-G5 唯一守护点 · 严拦 ReferenceError" \
  -m "- package.json · test:e2e + test:e2e:ui 两 script" \
  -m "验证: npx playwright test --list ✅ Total 8 tests · TSC 0"
```

### Batch 2 · Track-A · `refactor(templates)`: physics-core → experiment-core 底座统一

```bash
git add public/templates/_shared/experiment-core.js public/templates/chemistry/ public/templates/physics/
git rm public/templates/_shared/physics-core.js  # 若还没删则需要这行 · 如已 rm 可省
git commit -m "refactor(templates): 统一 iframe 底座 physics-core→experiment-core" \
  -m "G 阶段 Track-A · 11 模板从老底座迁到新底座 · 删除 physics-core.js · 合并 EurekaCanvas/EurekaHints 到 experiment-core。消除 F 阶段尾声暴露的'底座分叉'结构性缺口（修 bug 在一侧不覆盖另一侧）。" \
  -m "变更:" \
  -m "- experiment-core.js +100 行：逐字复制 EurekaCanvas (setupHiDPI/clear/drawArrow) + EurekaHints (show)" \
  -m "- 11 模板 script src 替换 · 每文件 2-3 行 diff:" \
  -m "  chemistry: combustion-conditions/electrolysis/iron-rusting/reaction-rate" \
  -m "  physics:   density/friction/lever/phase-change/pressure/refraction/work-power" \
  -m "- physics-core.js 删除（-242 行）" \
  -m "- test-phase2.js T-3 断言反转为防复发守护" \
  -m "向后兼容证明: 7 EurekaHost 方法两版同签 · EurekaFormat 两版语义一致 · 11 模板的 EurekaCanvas/Hints 调用透明迁移" \
  -m "验证: rg physics-core public/templates = 0 · 24 模板全用 experiment-core · TSC 0"
```

### Batch 3 · Track-A 守护 · `feat(arch-guard)`: arch-audit +check-5

```bash
git add scripts/arch-audit.sh
git commit -m "feat(arch-guard): arch-audit check-5 · iframe 底座单一守护" \
  -m "G 阶段 Track-A 机器守护层 · 防止 Batch 2 的底座统一被未来改动无意破坏。" \
  -m "新增 check:" \
  -m "- iframe foundation: public/templates/ 下任何 HTML 引用 physics-core.js → fail" \
  -m "- 现在扫 24 模板全部 clean · exit 0" \
  -m "负向测试证明有效: 故意加一行 physics-core 引用 → exit 1 · 恢复后立即 exit 0"
```

### Batch 4 · Track-C 防复发 · `docs/feat(workflow)`: 路线图 + C-5 + skill + 注册

```bash
git add docs/roadmap-g.md docs/architecture-constraints.md .workflow/skills/iframe-rpc-safety.md workflow.config.js
git commit -m "docs(workflow): G 阶段路线图 + C-5 iframe 底座单一 + iframe-rpc-safety skill" \
  -m "G 阶段 Track-C · 把本轮的结构性修复写入长期记忆 · 未来 /wf Agent 自动读到。" \
  -m "新增:" \
  -m "- docs/roadmap-g.md · 三轨完整记录 + 未来 G+1 候选（CI 集成 · pixel diff · mobile · pre-commit hook）" \
  -m "- .workflow/skills/iframe-rpc-safety.md · 4 Rules + Anti-Patterns + Gotchas + SOP + Checklist · 未来 /wf ANALYSE 自动 load" \
  -m "- workflow.config.js · projectSkills 数组注册 framework-boundary + iframe-rpc-safety + project-standards" \
  -m "修改:" \
  -m "- docs/architecture-constraints.md · 新增 C-5 节（iframe 底座单一，G 阶段兑现）+ 记录表追加 #8 · ANALYSE 规则更新为必读 C-1~C-5"
```

### Batch 5 (optional) · `chore(workflow)`: 归档 G 阶段 output/

```bash
git add .workflow/ output/
git commit -m "chore(workflow): 归档 G 阶段 7 阶段产出与 health trace" \
  -m "output/*.md（analysis/architecture/execution-plan/code.diff/test-report/review-output/deploy-output）· context-digests · health-report · runtime events · self-reports"
```

### Push

```bash
git push origin main
```

## 验证用户本地做的事（可选）

完成 commit + push 后，用户可在本地做这些运行时验证：

```bash
# 1 · dev server 起来
bash ./scripts/dev.sh   # :5000

# 2 · 在另一个终端运行 e2e（~2-3min · 8 case · 含截图）
npm run test:e2e
# 期望: 8 passed · __screenshots__/ 里生成 8 PNG

# 3 · 打开浏览器肉眼抽检 Class A 4 实验和 Class B 迁移 4 采样
# http://localhost:5000/experiments/physics/circuit       · 电路闭环 + 指标数值
# http://localhost:5000/experiments/physics/buoyancy      · 浮力实验
# http://localhost:5000/experiments/chemistry/acid-base-titration · 滴定
# http://localhost:5000/experiments/physics/friction      · 摩擦（迁移后）
# http://localhost:5000/experiments/physics/pressure      · 压强（迁移后）
# http://localhost:5000/experiments/physics/refraction    · 折射（迁移后）
# http://localhost:5000/experiments/chemistry/combustion-conditions · 燃烧
# 观察: 无 timeout 警告 · 无 ReferenceError · 画面正常渲染
```

## Rollback 指引（若需要）

```bash
# 回到 F 阶段末尾
git reset --hard 6fe982a   # ⚠️ 只在本地未 push 时安全
```

或按 Wave 回滚（本轮是单次 commit · 若已分 4 批 · 可 revert 单批）。

## Coze 环境同步

本地 push 后，Coze 在线预览需要手动 pull：

```bash
# Coze IDE Terminal
cd /workspace/projects
git pull origin main
bash ./scripts/dev.sh    # 重启 dev server
```

或在 Coze 面板重启预览 Pod 让它自动 clone 最新代码。
