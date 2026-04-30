# iframe-rpc-safety · iframe 模板层安全契约

> **用途**: 未来 /wf Agent 在涉及 `public/templates/` 或 `public/templates/_shared/experiment-core.js` 的任务时，必须在 ANALYSE 阶段 load 本 skill。
> **出处**: G 阶段路线图 · 防复发 Track-C
> **最后更新**: 2026-04-30

---

## Rules（必守 · 违反将触发 arch-audit red）

### Rule 1 · 单一底座（C-5）

- `public/templates/` 下所有 iframe HTML **只允许引用** `_shared/experiment-core.js`
- **禁止**重新创建 `physics-core.js` 或任何第二个 IIFE-style host 通信文件
- 新共享能力（如 `EurekaAudio`、`EurekaChart`）**必须** merge 进 `experiment-core.js` · 不得立独立 `_shared/*-core.js`

### Rule 2 · Compute RPC 顶层 listener 不可挪位

- `experiment-core.js` 中的 `compute_result` / `compute_error` message listener **必须**在 IIFE 顶层自启动
- **禁止**把它放进 `EurekaHost.onHostCommand(callback)` 内部
- 背景：F 阶段曾因此 bug 让 4 个 iframe 实验全 timeout（修复 commit `80ce8f8`）· 在顶层挂 listener 是"加载即就绪"的唯一方式

### Rule 3 · Port 名 → 几何映射同构

- 任何新增电路/物理元件的 port 名必须在 TS 侧（`src/lib/framework/domains/circuit/assembly/circuit-spec.ts` 的 `CIRCUIT_PORTS`）和 iframe 侧（`public/templates/physics/circuit.html` 的 `PORT_SIDE`）同步更新
- 两者必须**同构**：port 名集一致 · 左右端语义一致
- 背景：F+1 阶段 `6fe982a` 的"连通性+系统性"重构建立了这一对应

### Rule 4 · 新增 iframe 实验的最小清单

```html
<!-- 必须加载 -->
<script src="/templates/_shared/experiment-core.js"></script>
<script src="/templates/_shared/ui-core.js"></script>  <!-- UI 样式脚本 -->

<!-- 若涉及绘图 -->
<script src="/templates/_shared/component-mirror.js"></script>

<!-- 最小 JS 入口 -->
<script>
  EurekaHost.setTemplateId('<subject>/<experiment-id>');
  // ... 你的业务逻辑 ...
  EurekaHost.emitReady('<subject>/<experiment-id>');
</script>
```

---

## Anti-Patterns（常见错误 · 需警惕）

### ❌ 不要把 compute listener 放在 onHostCommand 里

```js
// ❌ WRONG — F+1 阶段踩过的坑（80ce8f8 修复前）
EurekaHost.onHostCommand = function(cb) {
  window.addEventListener('message', (e) => {
    if (e.data.type === 'compute_result') {
      // resolve _pendingRequests — 但只有模板调了 onHostCommand 时才挂
    }
  });
};

// ✅ RIGHT — 顶层自启动（80ce8f8 修复后）
(function() {
  window.addEventListener('message', (e) => {
    if (e.data.type === 'compute_result') { /* resolve */ }
  });
  // ... 其他 EurekaHost 定义 ...
})();
```

### ❌ 不要硬编码电路连线坐标

```js
// ❌ WRONG — afd1a92 前的做法
function drawConnectionLines() {
  ctx.moveTo(50, 40); ctx.lineTo(590, 40);  // 写死
}

// ✅ RIGHT — 6fe982a 后的做法：语义驱动
function drawConnectionLines(components, connections) {
  for (const conn of connections) {
    const a = portPos(compIndex[conn.from.componentId], conn.from.portName);
    const b = portPos(compIndex[conn.to.componentId],   conn.to.portName);
    ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
  }
}
```

### ❌ 不要为"向后兼容"保留 physics-core.js shim

- G 阶段决策 D-G1 明确选 **B1 方案**（完全删除，非保留 shim）
- shim 违背单一底座精神 · arch-audit check-5 会拒绝 shim 重新出现
- 若未来真的需要老 API，加到 `experiment-core.js` 的 `window.*` 暴露区

---

## Gotchas（容易踩坑的细节）

1. **Windows PowerShell 下 pnpm 不在 PATH**：用 `npx -y pnpm@9` 代替（G 阶段 W1 验证过）
2. **Playwright webServer 启动慢**：Next.js dev server 冷启 ~30-60s · `timeout: 120_000` 是安全下限
3. **iframe console.error 捕获陷阱**：Playwright 的 `page.on('console')` **不会自动包含 iframe** 的 console · 必须用 `page.on('pageerror')` + 遍历 `page.frames()`
4. **Canvas 非空断言的 threshold**：50 个非透明像素是 smoke 级的 · 严格断言需要用 V3 pixel diff
5. **pnpm preinstall 阻止 npm**：项目通过 `npx only-allow pnpm` 硬拒 npm install · 必须用 pnpm

---

## SOP（新增 iframe 实验的标准流程）

1. 在 `public/templates/<subject>/<experiment-id>.html` 创建新 HTML
2. `<script>` 引用 `/templates/_shared/experiment-core.js`（唯一底座）
3. 调 `EurekaHost.setTemplateId()` + `emitReady()`
4. 若需 compute RPC：用 `window.requestCompute(engineId, params, timeout)` · 无需注册 listener
5. 若需 param 绑定 slider：用 `window.bindParam(sliderEl, key, opts)`
6. **在 `src/lib/template-registry.ts` 注册**（三锁审核 REGISTRY + auditStatus='approved' + whitelist）
7. **加 smoke test**：`tests/e2e/iframe-smoke/compute.spec.ts` 或 `migration.spec.ts` 里追加一行
8. `bash ./scripts/dev.sh` + `npm run test:e2e` 验证
9. `bash scripts/arch-audit.sh` 确保仍 exit 0

---

## Checklist（PR 审核人用）

当 /wf Agent 修改 iframe 相关代码时，reviewer 应验证：

- [ ] `public/templates/` 下无 `physics-core.js` 引用（`rg physics-core public/templates` 空）
- [ ] `experiment-core.js` 的 compute listener 仍在 IIFE 顶层
- [ ] 若新增 port · `circuit-spec.ts` 的 `CIRCUIT_PORTS` 和 `circuit.html` 的 `PORT_SIDE` 同步
- [ ] `arch-audit.sh` check-5 仍 exit 0
- [ ] 若新增实验 · 有对应 smoke test 补到 compute/migration spec

---

## Related

- 约束原文：`docs/architecture-constraints.md` C-5 节
- 机器守护：`scripts/arch-audit.sh` check-5
- 关联 bug 修复：`80ce8f8`（RPC listener 顶层挂）· `6fe982a`（语义化连线）· G 阶段 W3-W6（底座统一）
- 路线图：`docs/roadmap-g.md`
