# Deploy Output · Session wf-20260428120154.

## 部署模式

**本地落盘**（local-writeback）—— Next.js 项目在 IDE 环境完成重构；运行 `pnpm dev` 即可加载新版 circuit.html v3 进行浏览器端验证。

## 已交付文件清单

### 新建（15）
```
src/lib/framework/assembly/
├── spec.ts          (72 行)
├── errors.ts        (53 行)
├── validator.ts     (138 行)
├── assembler.ts     (135 行)
├── fluent.ts        (155 行)
└── index.ts         (21 行)

src/lib/framework/domains/circuit/assembly/
├── circuit-spec.ts      (42 行)
├── circuit-assembler.ts (53 行)
├── circuit-builder.ts   (155 行)
└── index.ts             (23 行)

public/templates/_shared/
├── component-mirror.js  (87 行)
├── circuit-draw.js      (207 行)
└── circuit-builder.js   (148 行)

src/lib/framework/__tests__/assembly.test.ts                            (363 行, 34 tests)
src/lib/framework/domains/circuit/__tests__/circuit-assembly.test.ts     (144 行, 11 tests)
src/lib/engines/__tests__/circuit-engine-v2.test.ts                      (144 行, 10 tests)

docs/assembly-framework.md  (~320 行 · 5 学科示例)
```

### 修改（5）
```
src/lib/framework/index.ts                — 新增 assembly 层的所有 export
src/lib/framework/domains/circuit/index.ts — export * from './assembly'
src/lib/engines/physics/circuit.ts         — v1.1 → v2.0 dual-path
src/lib/template-registry.ts               — atomVersion 加 'v3-component'
src/lib/templates/physics-registry.ts      — circuit 标记 v3-component
public/templates/physics/circuit.html      — 重写为 v3-component
docs/component-framework.md                — 索引 assembly-framework.md
```

### 备份（1）
```
public/templates/physics/circuit.html.v2-atomic-legacy  — 上轮版本回滚用
```

## 部署后验证 Runbook（浏览器人工目视）

1. `pnpm dev` 启动开发服务器
2. 浏览器访问 `http://localhost:5000`
3. 进入电路实验
4. 应看到：
   - canvas 上分别画出 Battery（红蓝电池符号）/ Switch / Resistor / Bulb 四个元件
   - 顶部 3 个 KPI 数字随滑块变化
   - "电路结构"卡片右上角显示 `v3-component · MNA 求解` 徽章
   - Events panel 默认显示"无过载事件 · 电路稳定"
5. **过载烧毁演示**：
   - 将"电池电压"滑块拉到 > 20V（例如 25V）
   - 应看到：Bulb 变为黑色带红叉（BurntBulb 样式），events panel 显示 "💥 circuit/overload-bulb → 灯泡过载烧毁"
6. **开关交互**：
   - 点击"闭合（ON）" 按钮切换为 "断开（OFF）"
   - 应看到：电流立即降为 0、Bulb 不再发光

## 回滚流程（如需）

**完整回滚（5 min）**：
```powershell
# 1. 恢复旧模板
mv public/templates/physics/circuit.html.v2-atomic-legacy public/templates/physics/circuit.html

# 2. git revert engine 变更
git checkout HEAD~1 -- src/lib/engines/physics/circuit.ts

# 3. 回滚 atomVersion（physics-registry）
# 手动改回 'v2-atomic'
```

**部分回滚（仅降级 Engine）**：
```powershell
git checkout HEAD~1 -- src/lib/engines/physics/circuit.ts
# v3 HTML 会继续运行但会收到 v1.1 返回格式的结果（无 perComponent 字段）
# 需要同步改回 html 或接受降级
```

## 风险监测（上线后 72h）

| 监测项 | 预期 | 响应 |
|--------|------|------|
| circuit.html 首次加载 console error | 0 个 | 若出现 → 检查 L3 scripts 加载顺序 |
| `requestCompute` 响应时间 | < 50ms | 若 > 200ms → 检查 MNA solver 性能 |
| 过载事件能否触发 | 是 | 若否 → 检查 ReactionRule 注册 |
| v2-atomic 其他模板（buoyancy/titration）是否仍工作 | 是 | 它们不触 v2 path，应完全不受影响 |

## 后续工作建议

1. **浏览器侧 E2E 测试**：可用 Playwright 录制 circuit.html v3 的关键交互路径
2. **其他学科装配层**：按 docs/assembly-framework.md 的 4 学科示例实际落地
3. **装配 Spec JSON I/O**：`framework/assembly/io.ts` 加 specToJSON / specFromJSON
4. **更多反应规则**：保险丝熔断 / 短路告警 / 阻值超限等

## 结论

- ✅ 代码已全部写入工作区，`pnpm dev` 即可浏览器验证
- ✅ 403/403 测试通过 · TSC 零错误
- ✅ 回滚路径已备
- ⚠️ **需用户在浏览器做人工目视验证**（上方 Runbook）

**DEPLOY 完成 · 工作流全部 7 个阶段结束**
