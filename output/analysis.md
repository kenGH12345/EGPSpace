# 分析：装配框架化 + 电路实验组件化集成

**Session**: `wf-20260428120154.` · **Stage**: ANALYSE · **Date**: 2026-04-28

## 根因 / Root Cause

本次需求由两股力量合流：

### 🔴 功能断层（"发动机没装到车里"）

上一轮 `/wf` 交付了 `src/lib/framework/domains/circuit/**`（组件类、`CircuitGraph`、MNA 求解器 `CircuitSolver`、反应规则 `CIRCUIT_REACTIONS`）以及 `framework.test.ts` 的 22 条单测全部通过，但生产链路 **0 处消费**：

| 检查点 | 结果 |
|--------|------|
| `src/**/*.ts(x)`（排除 framework 自身和测试）`import ... from '@/lib/framework'` | **0** 次 |
| `src/lib/engines/physics/circuit.ts` 包含 `"framework"` | **0** 次（仍是 v1.1 闭式 `R_eq` 公式） |
| `public/templates/physics/circuit.html` 包含 `"framework"` 或 `"CircuitBuilder"` | **0** 次 |

换言之，**circuit 实验呈现给用户的行为完全与新框架无关**。用户直接感知的是"你说做完了但我在 circuit 实验里看不到一点变化"。这是交付沟通与生产集成同时失败的症状。

### 🔴 架构断层（"如果随便加个 CircuitBuilder 就叫完工，那就只是专用胶水"）

用户这次补了一条关键约束："**组装元件一样要进行框架设计**，满足通用化 / 结构化 / 可扩展 / 可维护 / 可配置"。

这意味着：

- ❌ **不能**写一个 `circuit-builder.ts` 塞到 `domains/circuit/` 下就完事——那会让 circuit 成为**第二个"电路专用岛"**，与上一轮刚刚建立的"通用框架"理念冲突
- ✅ **必须**把"装配"（assembly）作为**框架层一等公民**，在 `src/lib/framework/assembly/` 建立跨域抽象，电路只是**首个 Assembly 消费者**
- ✅ 未来加光学/化学实验时，装配层代码**无需改动一行**，只需实现 domain 对应的 Spec 和 Renderer

**深层原因**：上一轮把"元件原子化 + 求解 + 反应"三件都做成了跨域框架，却留下"装配"这唯一一个仍需域内自行实现的薄弱环节——用户捕捉到了这个不对称。

---

## 受影响位置

### 生产代码（需要改动或新建）

| 文件 | 层次 | 当前状态 | 本次动作 |
|------|------|----------|----------|
| `src/lib/framework/assembly/spec.ts` | L2 框架 | **不存在** | 🆕 新建：`AssemblySpec<D>` 类型 + 验证契约 |
| `src/lib/framework/assembly/assembler.ts` | L2 框架 | **不存在** | 🆕 新建：通用 `Assembler<D>`（Spec → DomainGraph） |
| `src/lib/framework/assembly/fluent.ts` | L2 框架 | **不存在** | 🆕 新建：通用 `FluentAssembly<D>` 链式 DSL 基类 |
| `src/lib/framework/assembly/validator.ts` | L2 框架 | **不存在** | 🆕 新建：Spec 结构/唯一性/端口引用三层校验 |
| `src/lib/framework/assembly/index.ts` | L2 框架 | **不存在** | 🆕 新建：barrel 导出 |
| `src/lib/framework/domains/circuit/assembly/circuit-spec.ts` | L3 Domain 绑定 | **不存在** | 🆕 新建：`CircuitSpec` 具体化通用 `AssemblySpec` |
| `src/lib/framework/domains/circuit/assembly/circuit-assembler.ts` | L3 Domain 绑定 | **不存在** | 🆕 新建：`CircuitAssembler extends Assembler<'circuit'>` |
| `src/lib/framework/domains/circuit/assembly/circuit-builder.ts` | L3 Domain 绑定 | **不存在** | 🆕 新建：`CircuitBuilder extends FluentAssembly<...>` |
| `src/lib/framework/domains/circuit/assembly/index.ts` | L3 Domain 绑定 | **不存在** | 🆕 新建：barrel |
| `src/lib/framework/domains/circuit/index.ts` | L3 Domain | 已存在 | 修改：re-export 装配层 |
| `src/lib/framework/index.ts` | L2 框架 barrel | 已存在 | 修改：re-export `assembly/*` |
| `src/lib/engines/physics/circuit.ts` | L1 Engine | 已存在（v1.1 单一闭式） | **修改**：升级为 v2.0 dual-path（识别 `params.graph` 走 MNA + 反应循环，否则保留 v1.1） |
| `src/lib/engines/__tests__/atomization-refactor.test.ts` | 测试 | 已存在 | **可能小修**：若有新字段 |

### 浏览器侧（L3 镜像 + 模板）

| 文件 | 当前状态 | 本次动作 |
|------|----------|----------|
| `public/templates/_shared/component-mirror.js` | **不存在** | 🆕 新建：浏览器侧 `ComponentMirror`（根据引擎回传的 `perComponent` 驱动绘图） |
| `public/templates/_shared/circuit-draw.js` | **不存在** | 🆕 新建：按元件类型分派的绘图函数（`drawBattery`/`drawWire`/`drawBulb`/`drawSwitch`/`drawResistor`...） |
| `public/templates/_shared/circuit-builder.js` | **不存在** | 🆕 新建：浏览器侧的 `CircuitBuilder` 链式装配（生成与 TS 侧相同结构的 DTO） |
| `public/templates/physics/circuit.html` | 已存在（v2-atomic） | **备份为 `.v2-atomic-legacy`** + **重写为 v3-component**（含过载烧毁 demo） |
| `public/templates/physics/circuit.html.v1-legacy` | 已存在 | 保留不动 |

### 测试（新增）

| 文件 | 新建内容 |
|------|----------|
| `src/lib/framework/__tests__/assembly.test.ts` | 装配框架通用层 12 个测试（Spec 验证/Assembler/FluentAssembly/错误模式） |
| `src/lib/framework/domains/circuit/__tests__/circuit-assembly.test.ts` | 装配层 circuit 绑定 10 个测试（含 Spec ↔ Graph 往返、端到端三电路） |
| `src/lib/engines/__tests__/circuit-engine-v2.test.ts` | 引擎 dual-path 8 个测试（v1.1 向后兼容 / v2 graph 路径 / 反应事件上报 / 求解失败降级） |

### 文档（新增）

| 文件 | 内容 |
|------|------|
| `docs/assembly-framework.md` | 装配层设计理念 + 4 学科示例（circuit 实现完整，optics/chemistry/mechanics 示例代码） |
| `docs/component-framework.md` | 修改：在"Assembly"章节插入对新文档的链接 |

**文件总数预估**：15 个新建 + 5 个修改 = **20 文件**。

---

## 修改范围

### In-Scope（本次必须交付）

| 类别 | 范围 |
|------|------|
| **Assembly 通用框架层** | `AssemblySpec<D>`、`Assembler<D>`、`FluentAssembly<D>`、`AssemblyValidator`、Error Types；完全 domain-无关（grep 验证：`src/lib/framework/assembly/` 内不含任何电路/化学/光学特有词） |
| **电路域装配绑定** | `CircuitSpec`、`CircuitAssembler`、`CircuitBuilder`（作为通用层的**首个实例**；单一依赖方向：domain → framework） |
| **引擎 dual-path 集成** | `CircuitEngine v2.0`：若 `params.graph` 存在则走 `CircuitAssembler` + `CircuitSolver` + `InteractionEngine`，否则回落到 v1.1 闭式公式；**100% 向后兼容** |
| **浏览器 L3 镜像 + DSL** | `ComponentMirror`（值→绘图分派）、`circuit-draw.js`（元件绘图原子）、`circuit-builder.js`（与 TS 侧 CircuitBuilder 结构一致的浏览器版本） |
| **circuit.html v3 模板** | 用 `new CircuitBuilder()` 声明式装配；slider 变化触发 `requestCompute` 传 graph DTO；结果按元件渲染；包含**过载电压触发烧毁**的可视 demo |
| **测试** | 装配层通用 12+ 条 / circuit 装配 10+ 条 / 引擎 dual-path 8+ 条（共 ≥ 30 条新测试），全量既有 348/348 零回归 |
| **文档** | 装配层设计文档含 4 学科示例，只有 circuit 是真实代码、其余 3 个为可读示例 |

### Out-of-Scope（明确不做，后续独立工作流）

- 将其他 domain（光学/力学/化学）的 Spec/Assembler 实际实现
- 拖拽式装配 GUI
- Spec 的 JSON 文件持久化/加载（仅支持对象字面量与链式 DSL，JSON-import 在设计中预留接口但不实现 reader）
- 交流电/电容/电感/二极管
- 装配失败的"可视化错误提示"（仅控制台 + engine 返回 `compute_error`）

### 强制验收追加（承接上轮 AC-1~AC-7 + 本次 5 条）

| AC | 要求 | 测试证据 |
|----|------|----------|
| AC-A 通用化 | `src/lib/framework/assembly/*` **不得 grep 到** 任何 `circuit/battery/resistor/bulb/...` 词 | `assembly.test.ts` 的 grep 自检 |
| AC-B 结构化 | 关注点分离：`spec`（声明）/ `validator`（校验）/ `assembler`（构建）/ `fluent`（DSL）**四文件各自单测独立通过** | `assembly.test.ts` 按 describe 分块 |
| AC-C 可扩展 | 给出"伪光学域"3 分钟扩展示例：`OpticsSpec` + `OpticsAssembler` 即可复用 `FluentAssembly` 无需改核心 | `assembly.test.ts` 的 "mock-optics domain composes without touching framework core" 测试 |
| AC-D 可维护 | 单文件 ≤ 250 行（避免超长）；核心类公共 API ≤ 10 个方法 | 测试里用 fs.readFileSync + AST count 校验 |
| AC-E 可配置 | `AssemblySpec` 支持两种等价构造路径：（1）对象字面量声明；（2）链式 DSL；两者产出的 `DomainGraph` 必须 `deep-equal` | `circuit-assembly.test.ts` 的 "DSL and literal spec produce equivalent graphs" 测试 |

---

## 风险评估

| 风险 ID | 描述 | 严重度 | 缓解 |
|---------|------|-------|------|
| **R1** | `AssemblySpec<D>` 泛型过度——为追求"通用"导致 domain 方想用但编译错误连连 | **P0** | 先用 circuit 域完整跑通，再抽象；`<D extends ComponentDomain>` 约束最小化；避开条件类型 |
| **R2** | CircuitEngine dual-path 误判 `params.graph`，把 v1.1 合法调用错导到 v2 路径 | **P0** | dual-path 仅当 `params.graph` 为**非空对象** AND `params.graph.components` 为数组时走 v2；其他一律 v1.1。新增 `circuit-engine-v2.test.ts` 覆盖 4 种边界 |
| **R3** | 浏览器侧 `circuit-builder.js` 与 TS 侧 `CircuitBuilder` 产出的 DTO 结构漂移 | **P0** | 在 `circuit-assembly.test.ts` 里有一个"参考 DTO 快照"，浏览器侧 QA checklist 要求目测字段对齐 |
| **R4** | v3 模板视觉回归（按元件绘图后，与 v2 的整体布局观感不一致） | **P1** | 保留 `.v2-atomic-legacy` 做对比；v3 默认布局采用 _shared/circuit-draw.js 的等距元件网格；在 `deploy-output.md` 列出人工目视 checklist |
| **R5** | 反应事件（过载烧毁）在 iframe 模板没有合适的视觉呈现 | **P1** | 简单策略：`events[]` 中检出 `sourceRuleId === 'circuit/overload-bulb'` → 显示红色徽章 + 对应 bulb 的 mirror 切换为 BurntBulb 绘图样式 |
| **R6** | 装配校验阶段返回的错误信息非人类可读（只有 id 和端口名） | **P2** | `AssemblyValidator` 返回结构化 `AssemblyError[]`，首版仅控制台友好，GUI 化留待未来 |
| **R7** | 文档 `docs/assembly-framework.md` 写成空洞的"通用化宣言"而无实际价值 | **P2** | 文档硬要求：含 4 个学科示例，**每个示例的 AssemblySpec 写完整**；全局搜 `grep -E "FIXME\|TBD"` 不得有结果 |
| **R8** | 时间估算失控：装配层抽象 + 电路绑定 + 浏览器镜像 + 模板同时推进容易爆 | **P1** | 分 6 波，每波完成触发 `read_lints` + 相关测试；任一波失败 STOP 并评估是否回滚 |
| **R9** | `requestCompute` 的 params 大小限制——graph DTO 体积是否仍可通过 postMessage | **P2** | 实测：小型电路 DTO（< 20 元件） < 4KB，postMessage 无压力；文档注明超过 1000 元件请改用 `chunked` 协议（预留） |
| **R10** | 与上轮工作流 T-15 "Engine v2.0 集成 InteractionEngine" 未完成的部分重叠 | **P0** | 本次明确包含此内容（circuit-engine dual-path）；不再作为"延后"，当场完成 |

---

## 决策摘要（供 ARCHITECT 消费）

- **装配必须升级为框架一等公民**。不允许写 `src/lib/framework/domains/circuit/circuit-builder.ts` 而没有对应的 `src/lib/framework/assembly/fluent.ts` 先行。
- **双入口装配**：对象字面量（`buildCircuit({components:[...], connections:[...]})`）与链式 DSL（`new CircuitBuilder().battery().bulb().loop()`）必须产出**完全相同**的 `CircuitGraph`，由 `AC-E` 测试强制保证。
- **CircuitEngine v2.0 dual-path 是本次必须完成的集成点**，不再延后。
- **5 条追加原子化要求（AC-A~AC-E）是刚性验收条件**，每条都有对应单测证据；与上轮的 AC-1~AC-7 并列。
- **明确承诺范围锁定**：不做光学/化学 Domain 的实际实现，不做 GUI，不做 JSON 文件读取。
