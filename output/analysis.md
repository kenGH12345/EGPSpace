# F 阶段 · framework 物理分层重构 · ANALYSE

> Session: wf-20260429132738. · 基线: e12560f (TSC 0 + Jest 563) · 工作区 clean

---

## 根因 / Root Cause

### 1. E 阶段留下的软债（Why F 必须做）

E 阶段受控松动 `framework 零改` 硬约束——允许「Props 加 index signature / 类型别名复用 / 纯 bug 修复」三类变更。代价是**硬约束从字面规则降级为自然语言例外条款**（`docs/architecture-constraints.md` 3 句规则）。

软约束在**单人/小团队项目**里必然腐烂（FM-1 破窗）：
- 今天松一次 "Props 加 index sig 是纯扩展" → 正当
- 明天松一次 "改 interface 字段类型是 bug 修复" → 边界糊化
- 一年后 "framework 零改" 四字变讽刺

**软约束的根本缺陷**：**靠人类阅读文档守护**，不是靠**物理结构**守护。

### 2. 本项目的具体混居病灶（证据驱动）

实际代码审计（本次真实度量，非推测）：

**framework/index.ts 流出 symbol ~50 个，每个文件都是「type + impl 混居」**：

| 文件 | 纯 type (contracts) | 运行时实现 (runtime) | 性质 |
|------|---------------------|---------------------|------|
| `components/base.ts` | 7 types (Domain/Kind/Anchor/Stamp/DTO/IExperimentComponent/SolvedValues) | 1 class (AbstractComponent) | **混居** |
| `components/graph.ts` | 3 types (EquipotentialNodeMap/GraphValidation/DomainGraphDTO) | 1 class (DomainGraph) | **混居** |
| `components/port.ts` | 2 types (PortRef/Connection) | 3 fn (portRef/portKey/portEquals) | **混居** |
| `components/registry.ts` | 1 type (ComponentFactory) | 1 const (componentRegistry) | **混居** |
| `components/union-find.ts` | — | 1 class (UnionFind) | pure runtime |
| `solvers/base.ts` | 4 types (IDomainSolver/SolveResult/PreCheckResult/SolveState) | 1 class (SolverError) | **混居** |
| `interactions/engine.ts` | 1 type (InteractionTickReport) | 1 class (InteractionEngine) | **混居** |
| `interactions/rule.ts` | 1 type (ReactionRule) | — | pure type |
| `interactions/events.ts` | 2 types (ReactionEvent/Kind) | 1 const (ReactionEvents) | **混居** |
| `assembly/spec.ts` | 5 types (AssemblySpec/ComponentDecl/SpecPortRef/ConnectionDecl/AssemblyMetadata) | 2 fn (isAssemblySpec/emptySpec) | **混居** |
| `assembly/layout.ts` | 4 types (LayoutEntry/LayoutSpec/LayoutMetadata/AssemblyBundle) | 4 fn (isLayoutSpec/emptyLayout/layoutLookup/isAssemblyBundle) | **混居** |
| `assembly/errors.ts` | 4 types | 2 (AssemblyBuildError class + makeError fn) | **混居** |
| `assembly/validator.ts` | 1 type (PortsLookup) | 1 fn (validateSpec) | **混居** |
| `assembly/assembler.ts` | 2 types (ComponentBuilder/AssembleOptions) | 1 class (Assembler) | **混居** |
| `assembly/fluent.ts` | 1 type (FluentAddOptions) | 1 class (FluentAssembly) | **混居** |

**观察**：**0 个文件是 100% pure type，0 个文件是 100% pure runtime**。每个核心文件都按「co-location 原则」把 interface + 对应 guards/helpers 放一起，这是 TypeScript 社区的**主流惯例**（e.g. React 自己的 types.ts 也是混居）。

### 3. 这个发现如何改变 F 阶段策略

E 阶段讨论的 **Proposal B（contracts + runtime + domains 三分）** 假设了「文件级 type/impl 分离」的前提——但本项目**现状是文件级 co-location**。强拆意味着：
- 15 个核心文件 → 拆成 ~30 个文件（每个都分 `-types.ts` + `-impl.ts`）
- 破坏「就近维护」的好处（改 interface 的同时改 guard 不用切文件）
- 引入大量 barrel re-export，反而增加维护成本

**调整后的策略**：目录级分层（contracts/ vs runtime/ vs domains/），**文件内部保持 co-location**。具体 ARCHITECT 阶段做方案决策——这里 ANALYSE 只识别问题。

### 4. 下游依赖的真实形状

| 下游来源 | 文件数 | 特征 |
|---------|-------|-----|
| `src/lib/editor/` | 9 | 全部用 `@/lib/framework` barrel ✅ |
| `src/lib/engines/` | 4 | 2 个用 barrel · 2 个直接伸进 `@/lib/framework/domains/*` ⚠️ |
| `src/components/` | 2 | barrel |
| `src/lib/framework/` 内部 | 4 | cross-import（domains 之间 + assembly 之间）|

**关键数据**：仅 **2 处 bypass barrel**（`engines/chemistry/reaction.ts` 和 `engines/physics/circuit.ts`）——这是 P-strict 要清理的对象。

### 5. 循环引用健康度

审计结果：
- `domains/** → framework 核心`: **24 次**（合法）
- `framework 核心 → domains/**`: **0 次** ✅（无逆向依赖）

**结论**：当前架构**不存在**循环依赖。F 阶段只需**维持**这个健康状态，不需要**修复**现状。

### 6. 测试文件的路径脆弱性

审计 `framework/**/__tests__/`:
- 9 个测试文件
- 12 次用相对路径 `from '../..'`（受物理结构变化影响）
- 2 次用 `@/lib/framework` barrel（不受影响）

**86% 的测试 import 是脆性的**——F 阶段重构必然触发测试 import 路径大修。这是**最高确定性的工作量项**。

---

## 受影响位置

### 7.1 一定会改的文件（F 阶段核心）

| 区域 | 文件 | 性质 |
|------|------|------|
| `framework/components/` | 5 个（base/graph/port/registry/union-find）| 分层移位 |
| `framework/solvers/` | 1 个（base）| 分层移位 |
| `framework/interactions/` | 3 个（engine/rule/events）| 分层移位 |
| `framework/assembly/` | 7 个（spec/layout/errors/validator/assembler/fluent/index）| 分层移位 |
| `framework/index.ts` | 1 个（barrel 总入口）| 重写 re-export |
| `framework/__tests__/` | 3 个（assembly/framework/layout-spec）| import 路径跟随 |
| `framework/domains/chemistry/__tests__/` | 5 个 | import 路径跟随 |
| `framework/domains/circuit/__tests__/` | 1 个 | import 路径跟随 |
| `framework/domains/chemistry/*.ts` | 5 个（components/solver/chemistry-graph/reaction-utils/type-guards）| import 路径跟随 |
| `framework/domains/chemistry/reactions/*.ts` | ~5 个 reactions | import 路径跟随 |
| `framework/domains/chemistry/assembly/*.ts` | ~3 个 | import 路径跟随 |
| `framework/domains/circuit/*.ts` | ~8 个 | import 路径跟随 |

### 7.2 下游可能触及

| 区域 | 策略 |
|------|------|
| `src/lib/engines/` 2 个 bypass 文件 | **必改**（P-strict 要求清理 bypass）|
| `src/lib/engines/` 其他 2 个 barrel 文件 | 保持（barrel 路径不变）|
| `src/lib/editor/` 9 个文件 | 保持（全用 barrel）|
| `src/components/` 2 个 | 保持 |
| `tsconfig.json` | **必改**（新增 paths 别名）|
| `jest.config.js` | **可能改**（测试 path resolution）|
| `eslint.config.mjs` | **必改**（加 no-restricted-imports 规则）|

### 7.3 配套新建

| 区域 | 用途 |
|------|------|
| `scripts/arch-audit.sh` | madge 循环依赖 + 路径违规审计 |
| `docs/architecture-constraints.md` | 废除/归档 E 阶段软条款 |
| `.eslintrc` 规则 | `no-restricted-imports` 守卫 contracts/ 边界 |

---

## 修改范围

### 8.1 核心重组

| # | 位置 | 动作 | 说明 |
|---|------|------|------|
| 1 | `framework/components/` | 改名/分层 → `framework/contracts/` + `framework/runtime/` | 最终形态由 ARCHITECT 决策 |
| 2 | `framework/solvers/` | 同上 | |
| 3 | `framework/interactions/` | 同上 | |
| 4 | `framework/assembly/` | 同上 · 注意 `spec.ts` / `layout.ts` / `fluent.ts` / `assembler.ts` 的归属决策 | |
| 5 | `framework/index.ts` | 重写为 `export * from './contracts'; export * from './runtime'` | 保持下游 import 路径兼容 |
| 6 | `tsconfig.json` | 新增 paths 别名 | `@framework`, `@framework/contracts`, `@framework/runtime`（待 ARCHITECT 决策是否全用）|
| 7 | `eslint.config.mjs` | 加 no-restricted-imports 规则 | 禁外部 import `framework/contracts/<内部>` 或 `framework/runtime/<内部>` |
| 8 | `scripts/arch-audit.sh` | 新建 | madge 循环检测 + 路径违规自动扫描 |

### 8.2 测试路径同步（R-F5 应对）

| # | 文件 | 动作 |
|---|------|------|
| 9 | `framework/__tests__/framework.test.ts` | import 路径更新 |
| 10 | `framework/__tests__/assembly.test.ts` | import 路径更新 |
| 11 | `framework/__tests__/layout-spec.test.ts` | import 路径更新 |
| 12 | `framework/domains/chemistry/__tests__/*.test.ts` (5) | import 路径更新（首选改为 `@framework` barrel 彻底去相对路径）|
| 13 | `framework/domains/circuit/__tests__/*.test.ts` (1) | 同上 |

### 8.3 下游 bypass 清理（R-F2 P-strict）

| # | 文件 | 动作 |
|---|------|------|
| 14 | `src/lib/engines/chemistry/reaction.ts` | `@/lib/framework/domains/chemistry` → `@framework/domains/chemistry`（或保留 path alias）|
| 15 | `src/lib/engines/physics/circuit.ts` | 同上 |

### 8.4 文档与约束

| # | 文件 | 动作 |
|---|------|------|
| 16 | `docs/architecture-constraints.md` | 归档 E 阶段受控松动条款；新增 F 阶段物理边界说明 |
| 17 | `.workflow/skills/framework-boundary.md` | 新建（替代 tsc-workflow-gate 的架构守护部分）|
| 18 | `docs/editor-framework.md` | 更新分层说明 + `core/` 位置描述 |

### 8.5 规模估计

- 修改文件数：**~35 个**（15 核心分层 + 9 测试 + 5 domains import + 2 下游 bypass + 4 配置/文档）
- 新建文件数：**~5 个**（contracts/index.ts + runtime/index.ts + arch-audit.sh + framework-boundary.md + 可能 eslint 规则文件）
- 删除文件数：**0**（所有原文件都移位或保留，不删内容）
- 净代码增量：~-50 行（主要是 index.ts barrel 精简；接口内容基本不变）
- 预估时间：**6-8h**（与之前估计一致）

---

## 风险评估

### R-F1（P0）· 迁移级联爆炸

**场景**：文件级 type/impl co-location 已是惯例——强拆会把 15 个文件变 30 个，维护成本翻倍。

**量化**：E 阶段受控松动的 7 个文件里 **5 个是 co-located 文件**（spec.ts/layout.ts 等）。拆一次 spec.ts 比加一个 index signature 复杂 3x。

**缓解**：ARCHITECT 阶段决策「**目录级分层，文件级保持 co-location**」——`contracts/` 存放**type-dominant** 文件（type 占 >70%，允许携带若干 guard 函数），`runtime/` 存放 **impl-dominant** 文件（class 占 >70%）。这和 E 阶段 Props 加 index sig 的"保守扩展"思路一致。

---

### R-F2（P1）· 下游 import 路径改动

**场景**：P-strict（全量迁移）vs P-soft（仅内部分层）的决策。

**量化**：
- 19 个下游文件，其中 **17 个用 barrel**（不受内部分层影响）
- **只有 2 个 bypass 文件**真的需要改 path

**缓解**：
- 选 **P-strict**，但 P-strict 的成本**远低于 E 阶段讨论时的想象**（只需改 2 个文件 + 加 ESLint 规则）
- 为了降低下游耦合：默认所有外部代码**必须**从 `@/lib/framework` barrel 导入，ESLint 规则禁止伸进 `@/lib/framework/contracts|runtime|domains|builders` 的内部路径

---

### R-F3（P2）· AssemblyBundle 归属判定

**场景**：E 阶段争议过的——AssemblyBundle 是核心数据还是组织层？

**量化**：AssemblyBundle 是 **纯 interface**（见 layout.ts L119-123），只引用 AssemblySpec + LayoutSpec 两个 type。

**缓解**：归 `contracts/layout.ts`（和 LayoutSpec 同文件）。E 阶段加的 `import type { AssemblySpec }` 在分层后变成 `contracts/layout.ts → contracts/spec.ts` 的**同目录 import**——AC-D1 测试的 `stripComments(...)` 检查仍然通过（LayoutSpec/LayoutEntry 定义块内仍然不引用 AssemblySpec）。

**无新问题**。

---

### R-F4（P1）· 循环引用隐患

**场景**：`domains/chemistry/assembly/` 的 chemistry-specific builder 同时引用 `@framework/contracts/assembly`（看 AssemblySpec）和 `@framework/builders/fluent`（扩展 fluent）——合法吗？

**量化**：当前基线 **0 循环依赖**（framework 核心 → domains 逆向 0 次）。

**缓解**：
- 设计原则：`domains/ → contracts/ + runtime/ + builders/`（单向依赖，合法）
- `builders/ → contracts/ + runtime/`（单向，合法）
- `runtime/ → contracts/`（单向，合法）
- **红线**：`contracts/ → runtime/` 或 `runtime/ → domains/` 或 `builders/ → domains/` 任一出现即 CI 失败
- Wave 末尾 `scripts/arch-audit.sh` 跑 madge `--circular` 报告

---

### R-F5（P0）· 测试路径大面积失效

**场景**：9 个 framework 测试文件中 **12 次相对路径 `from '../..'`** 会在物理分层后全部失效。

**量化**：12/14 = 86% 的测试 import 需改。这是**最确定性的工作量**。

**缓解**：
- **主策略**：把所有测试 import 统一改为 `@/lib/framework` barrel 或 `@framework` 别名（彻底去相对路径）——**副作用是提升测试的重构适应性**
- 次要策略：对于 `__tests__/` 和被测代码同目录的情况（如 `chemistry/__tests__/type-guards.test.ts` 测 `chemistry/type-guards.ts`），保留 `'../type-guards'` 单层相对路径（稳定且表达清晰）
- 每 Wave 末尾 `npx jest` 验证绿色，红色立即回滚

---

### R-F6（P1 · 新增）· 对抗诱惑（Scope Creep 风险）

**场景**：F 阶段重构过程中必然出现"顺手优化"的诱惑。

**需警惕的诱惑**：
- ❌ 顺手重命名 class（`AbstractComponent` → `ComponentBase`）
- ❌ 顺手改 interface 字段（`ComponentSolvedValues.aggregates` 类型）
- ❌ 引入新抽象（branded types / phantom types）
- ❌ 对 chemistry/circuit 做业务重构
- ❌ 引入 ESM strict mode 等无关改动

**缓解**：ARCHITECT 阶段在 AC 中明文写：「F 阶段只做**位移**（mv），不做**内容变更**（modify）。除非为解决 import 路径必需，否则任何文件内部字符不变」。用 `git diff --stat` 审计每 Wave 新增行数，**不应有大规模新增**——如果某 Wave diff >100 行，触发停下来检查 scope。

---

### R-F7（P2 · 新增）· 对 E 阶段受控松动的"假兑现"

**场景**：E 阶段答应"F 阶段做物理分层把硬约束兑现"——但如果 F 阶段只做了**目录重命名**而没有**强制外部边界**（ESLint 规则 + arch-audit 脚本），就是**假兑现**——未来 Agent 仍然能 bypass。

**缓解**：F 阶段交付物必须包含：
1. ESLint `no-restricted-imports` 规则（禁外部伸进 framework 内部路径）
2. `scripts/arch-audit.sh`（madge 循环检测 + grep 违规扫描）
3. `.workflow/skills/framework-boundary.md`（未来 Agent 必读）
4. 归档 E 阶段受控松动条款（软约束过期声明）

**四件套缺一不可**——目录重命名只是壳，边界守卫才是灵魂。

---

## 验收门槛（AC）

| # | AC | 验证 |
|---|----|------|
| **AC-F1** | 物理分层落地：`framework/contracts/` + `framework/runtime/` + `framework/builders/` + `framework/domains/` 四个目录存在并各归其位 | `ls src/lib/framework/` 显示 4 目录 |
| **AC-F2** | 所有原有 export 通过 `framework/index.ts` barrel 保持可访问（下游 barrel import 全部可用）| `npx tsc --noEmit = 0 errors` |
| **AC-F3** | TSC 0 errors 保持（E 阶段基线不回归）| tsc 命令 |
| **AC-F4** | Jest 563+ 保持全绿 | `npx jest` |
| **AC-F5** | 依赖方向健康：`runtime → contracts`、`domains → {contracts, runtime, builders}`、`builders → {contracts, runtime}`；禁止反向 | `scripts/arch-audit.sh` madge 报告 |
| **AC-F6** | 0 循环依赖（维持现状）| `madge --circular` 报告空 |
| **AC-F7** | ESLint 规则落地：外部禁止 import `framework/contracts/*`, `framework/runtime/*`, `framework/builders/*` 内部路径；必须通过 barrel | `npx eslint src/lib/editor src/lib/engines src/components` 退出码 0 |
| **AC-F8** | 下游 2 个 bypass 文件清理完成（engines/chemistry/reaction.ts + engines/physics/circuit.ts 改用 barrel）| `grep -r "@/lib/framework/domains" src/lib/engines` = 0 |
| **AC-F9** | 测试 import 路径全部 barrel 化或同级相对路径（无跨层 `../../..`）| grep `from '../../../'` in `framework/**/*.test.ts` = 0 |
| **AC-F10** | E 阶段受控松动条款归档；新增 F 阶段物理边界说明 | `docs/architecture-constraints.md` 更新记录 |
| **AC-F11** | `scripts/arch-audit.sh` 退出码 0（CI 可直接接入）| 执行成功 |
| **AC-F12** | `.workflow/skills/framework-boundary.md` 新建并注册 | 文件存在 + skill 注册 |
| **AC-F13** | 本轮 diff 控制在"位移为主"：任何单文件内容变更不超过 5 行（除 index.ts/barrel）| `git diff --numstat` 逐文件审计 |

13 条 AC（比 E 阶段 11 条多 2 条 · 覆盖 7 大风险的兑现检查）。

---

## 明确不做（Out-of-Scope）

- ❌ 不做 type/impl **文件级**拆分（保留 co-location，只做**目录级**分层）
- ❌ 不重命名 class / interface（AbstractComponent/DomainGraph/AssemblySpec 等一律保名）
- ❌ 不改 interface 字段类型或添加/删除字段
- ❌ 不改 AC-D1 现有语义（LayoutSpec/LayoutEntry 仍不引用 AssemblySpec）
- ❌ 不改 chemistry/circuit domain 业务逻辑
- ❌ 不引入新 framework 抽象（无 branded types、无 phantom types、无 module pattern 变更）
- ❌ 不迁移 `public/templates/` 或老实验（零改）
- ❌ 不改 package.json 或引入新依赖（madge 可以不通过包引入，用 node 内置 CommonJS 分析）
- ❌ 不改 editor 的 React 集成（0 React in editor 保持）
- ❌ 不改工作流本身（.codebuddy/**、workflow/** 零改）

---

## 下游消费者 / Downstream Consumers

F 阶段重构的产出物会影响以下**下游消费者**，每个都有明确的"必须改动"或"保持不变"契约：

| 下游消费者 | 当前 import 模式 | F 阶段后变化 | 必须改动？ |
|-----------|----------------|------------|-----------|
| `src/lib/editor/**`（9 文件）| `from '@/lib/framework'` barrel | barrel 内容（re-export 来源）变更，但路径不变 | ❌ 无需改 |
| `src/lib/engines/chemistry/reaction.ts` | `from '@/lib/framework/domains/chemistry'`（bypass）| bypass 必须清理 | ✅ 改为 barrel |
| `src/lib/engines/physics/circuit.ts` | `from '@/lib/framework/domains/circuit'`（bypass）| 同上 | ✅ 改为 barrel |
| `src/lib/engines/physics/buoyancy.ts` / `chemistry/titration.ts` | barrel | 保持 | ❌ 无需改 |
| `src/components/**`（2 文件）| barrel | 保持 | ❌ 无需改 |
| `framework/__tests__/**`（9 测试文件）| 86% 相对路径 | 改为 barrel 或同级相对 | ✅ 必改（R-F5）|
| `framework/domains/chemistry/**`（~15 文件）| 相对路径 `../../` | 继续用相对（内部依赖）| ⚠️ 路径跟随分层调整 |
| `framework/domains/circuit/**`（~10 文件）| 同上 | 同上 | ⚠️ 路径跟随 |
| `public/templates/**` | 不 import framework | 零影响 | ❌ 零改（硬约束）|
| `tsconfig.json` | 已有 `@/*` alias | 可选新增 `@framework/*` alias | ⚠️ 看 ARCHITECT 决策 |
| `eslint.config.mjs` | 无 framework 相关规则 | 必须加 `no-restricted-imports` | ✅ 必改 |
| `jest.config.js` | 已支持 `@/` alias | 若加 `@framework/*` 需同步 `moduleNameMapper` | ⚠️ 视 ARCHITECT 决策 |
| **未来新 domain**（如 `domains/physics-full/`）| 不存在 | 物理目录模板 + import 边界规则 | ✅ F 阶段建立规范 |
| **未来 /wf Agent** | 读 `architecture-constraints.md` | 读**新版**硬约束 + ESLint 报错即知边界 | ✅ 元契约更新 |

### 契约要点

1. **barrel 稳定性契约**：`@/lib/framework` 所有 E 阶段可 import 的 symbol，F 阶段后必须全部可 import（等价性契约）
2. **内部路径不稳定契约**：F 阶段后 `@/lib/framework/components/base` 之类的内部路径**不再**是稳定 API——外部代码禁用（ESLint 规则守护）
3. **测试路径迁移契约**：所有 framework 测试文件**必须**在本 Wave 完成 import 路径更新，不遗留到后续轮次
4. **零业务逻辑改动契约**：F 阶段**只做位移**，不改 interface 字段、不重命名、不引入新抽象（AC-F13 审计）
5. **硬约束替换契约**：E 阶段"受控松动"的 3 条自然语言例外 → F 阶段后由 ESLint + arch-audit 替代；旧条款归档为**历史记录**而非**现行规则**

### 消费者受影响度总评

- **强制改动**：3 组（2 bypass 文件 + 9 测试文件 + eslint 配置）≈ **12 文件**
- **路径跟随**：~25 个 framework 内部文件（`from '../'` 的相对路径需对齐新物理结构）
- **零改**：17 个下游（editor/engines barrel 派/components/templates）
- **新增规范**：2 份（arch-audit.sh + framework-boundary.md）

---

## 下一步：ARCHITECT 决策清单

给 ARCHITECT 阶段留的 5 个待决策点：

1. **分层方案**：Proposal A（core+domains 二分）vs Proposal B'（contracts+runtime+builders+domains 四分，文件内 co-location）
2. **tsconfig paths 命名**：`@framework/contracts` 还是 `@framework` 单别名
3. **ESLint 规则强度**：软警告还是硬错误
4. **arch-audit.sh 实现方式**：madge CLI（新依赖）vs 纯 node `fs` + `@babel/parser` vs 纯正则扫描
5. **AssemblyBundle 的跨层归属**：和 LayoutSpec 同层 contracts/ 还是独立出 organizational/

---

> **总结**：F 阶段本质是**把 E 阶段的自然语言约束兑现成物理结构 + 自动守卫**。
> - 真实代码审计揭示 "文件级 type/impl 拆分" 不现实 → **目录级分层，文件级 co-location** 是正确策略
> - 下游 import 改动规模比想象小（19 文件中仅 2 文件 bypass）→ P-strict 可行
> - 86% 测试 import 会被动，但 barrel 化是一劳永逸的解法
> - 0 循环依赖基线健康，F 阶段任务是**守护** 不是**修复**
> - 7 个风险已量化 3 P0 + 2 P1 + 2 P2，每个有具体缓解动作
