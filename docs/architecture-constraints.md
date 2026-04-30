# Architecture Constraints

> **本项目跨 /wf 轮次必须遵守的硬约束 + 物理边界 + 受控松动条款**
> **Last updated**: F 阶段 · 2026-04-29

## 目的

本文件是 EGPSpace 项目的**单点架构约束真相源**。所有未来 /wf 工作流必须：
- 读本文件作为 ANALYSE 阶段 context 的一部分
- 在 ARCHITECT 阶段评估新变更是否违反约束
- 任何松动请求必须在此文件留痕（使用记录表）

---

## 🔒 核心硬约束（四轮承诺 + F 阶段物理兑现）

### C-1 · Framework 物理分层边界（F 阶段兑现）

**F 阶段前**：`src/lib/framework/**` 零改动（软约束，由人类守护）。

**F 阶段后（新契约）**：framework 内部物理分层为 4 目录，**机器守护**：

```
src/lib/framework/
├── contracts/    ← 🔒 type-dominant · 修改需 [contracts-change] commit + ADR
├── runtime/      ← 🟡 impl-dominant · 允许 bug 修复和性能优化
├── builders/     ← 🟢 增量区 · 允许新增 builder 工具
└── domains/      ← 🟢 自由演化 · chemistry/circuit 等
```

**依赖方向红线**（`scripts/arch-audit.sh` 强制）：
- `runtime` → `contracts`（合法）
- `builders` → `contracts + runtime`（合法）
- `domains` → `contracts + runtime + builders`（合法）
- `contracts → runtime/builders/domains`（❌ 禁 · 例外见下）
- `runtime → builders/domains`（❌ 禁）
- `builders → domains`（❌ 禁）
- **外部代码（editor/engines/components）只能从 `@/lib/framework` barrel 导入**，ESLint `no-restricted-imports` 硬规则

**F 阶段明示例外**（记录在 `scripts/arch-audit.sh` allowlist）：
- `contracts/graph.ts → runtime/union-find`：`DomainGraph` 是混合文件（3 type + 1 reference impl class），其实现部分使用 `UnionFind` 是合理的。未来重构可把 class 分离到 runtime/。

**E 阶段受控松动条款归档**：E 阶段的"允许 3 类 / 禁 3 类"自然语言规则已由 F 阶段物理边界 + ESLint + arch-audit 替代。旧条款保留为**历史记录**，不再是现行规则。

### C-2 · 老模板零改

**约束**：`public/templates/**` 下**任何 HTML/CSS/JS 文件零改动**（包括 `_shared/*` 共享资源）。

**执行检查**：`git diff --shortstat public/templates` 应为空。

**未来例外**：只有在**模板本身有 bug** 且通过专门的 /wf 讨论时才可松动。

### C-3 · 零新依赖

**约束**：`package.json` 的 `dependencies` 和 `devDependencies` 均**零新增**。

**执行检查**：`git diff package.json` 应为空。

**未来例外**：新依赖必须在专门的 /wf 里独立议决，理由必须包含"为什么不能用已有包实现"。

### C-4 · Editor 零 React 污染

**约束**：`src/lib/editor/**` 下**零 `import ... from 'react'`**。editor 业务逻辑必须保持纯 TypeScript，便于测试和 UI 层分离。

**执行检查**：`grep -r "from 'react'" src/lib/editor/` 应输出 0 行。

---

### C-5 · iframe 模板底座单一（G 阶段兑现）

**约束**：`public/templates/` 下所有 iframe 实验 HTML **只能加载 `_shared/experiment-core.js`**，**禁止引入任何第二个 host 通信底座**（包括已退役的 `physics-core.js`）。

**背景**：F 阶段尾声发现 `physics-core.js`（11 模板）和 `experiment-core.js`（13 模板）两套底座并存 → 某次 compute RPC bug 修在 `experiment-core` 一侧，另一侧继续带 bug → 4 个 iframe 实验同时 timeout。G 阶段统一底座 + 加机器守护，防止此类分叉复发。

**物理边界**：
- ✅ 唯一底座：`public/templates/_shared/experiment-core.js`
- ❌ 已删除：`public/templates/_shared/physics-core.js`（勿重新创建）
- 🔒 若需新增共享能力（如 `EurekaAudio`、`EurekaChart`），**必须** merge 进 `experiment-core.js` · 不得立第二个 IIFE 文件

**机器守护**：
```
scripts/arch-audit.sh check-5:
  扫描 public/templates/ 下所有 HTML · 任何 physics-core.js 引用 → fail
```

**必读文档**：`.workflow/skills/iframe-rpc-safety.md` · 未来 /wf Agent 在 ANALYSE 阶段必 load。

---

## 受控松动条款（E 阶段历史记录 · F 阶段后已归档）

> ⚠️ **F 阶段后本小节不再是现行规则**——E 阶段的"允许 3 类 / 禁 3 类"自然语言软条款已由 F 阶段的**物理分层 + ESLint + arch-audit**机器守护替代。本小节保留仅为历史追溯。新约束见上方 C-1 · Framework 物理分层边界。

### ✅ 允许的 framework 修改

1. **扩展现有类型（不删除、不修改现有字段）**
   - 例：给 interface 加 optional 字段、加 index signature (`[key: string]: unknown`)
   - 例：加新的 type alias（如 type guards 文件）
   - 精神：**纯 additive 变更**，下游消费者零迁移成本

2. **类型别名复用（消除 duplication）**
   - 例：把内联字面量类型 `{ domain: D; components: Array<{ ... }> }` 改为引用 `AssemblySpec<D>`
   - 精神：**结构等价的重构**，不改变 shape 只消除 DRY 违反

3. **纯 bug 修复（恢复应有行为）**
   - 例：补缺失的 `import`、补缺失的 `re-export`、删除无用的 `@ts-expect-error`
   - 精神：**不改设计，只修漏洞**

### ❌ 仍被禁止

1. **新增 component kind / solver / engine / reaction rule**
   - 例：在 chemistry/ 下加新反应（如 `sulfation.ts`）— 必须走独立 /wf 议决
   - 精神：防止 framework 能力随便膨胀

2. **修改现有字段类型、重命名 interface、删除 export**
   - 例：把 `ReagentProps.formula: string` 改为 `formula: string | null`
   - 精神：**breaking change**，必须走 migration 专项

3. **重构 framework 物理分层**
   - 例：把 `framework/domains/chemistry/` 拆分或合并
   - 精神：物理结构变化影响所有消费者，必须走 F 阶段或后续专项

### 松动使用记录表

| # | 日期 | /wf 阶段 | 修改内容 | 类型（1/2/3）| 审批人 |
|---|------|---------|---------|-------------|--------|
| 1 | 2026-04-29 | **E 阶段** | 5 Chemistry Props + ChemistryPerComponent 加 `[key: string]: unknown` | 1 扩展 | 用户批准 B-plus |
| 2 | 2026-04-29 | **E 阶段** | `AssemblyBundle.spec` 内联字面量 → `AssemblySpec<D>` 别名 | 2 别名复用 | 用户批准 B-plus |
| 3 | 2026-04-29 | **E 阶段** | `engines/index.ts` 补缺失的 `import chemistryReactionEngine` | 3 bug 修复 | 用户批准 B-plus |
| 4 | 2026-04-29 | **E 阶段** | `framework/domains/circuit/index.ts` 补 `AssemblyBuildError` + `validateSpec` re-export | 3 bug 修复 | 用户批准 B-plus |
| 5 | 2026-04-29 | **E 阶段** | 新建 `framework/domains/chemistry/type-guards.ts`（discriminated union helper）| 1 扩展 | 用户批准 B-plus |
| 6 | 2026-04-29 | **E 阶段** | 更新 `layout-spec.test.ts` 的 AC-D1 测试（精神不变，字面放宽）| 2 别名复用关联 | 用户批准 B-plus |
| 7 | 2026-04-29 | **F 阶段** | 一次性 framework 物理分层重构：15 核心文件从 `components/solvers/interactions/assembly/` 迁移到 `contracts/runtime/builders/`；删除 4 旧目录；barrel 兼容保持；新增 ESLint + arch-audit 守护；E 阶段软条款由物理边界替代 | 一次性物理兑现 | 用户批准 F-plus |
| 8 | 2026-04-30 | **G 阶段** | iframe 底座统一：删除 `public/templates/_shared/physics-core.js`（200 行），11 模板迁移到 `experiment-core.js`，合并 `EurekaCanvas/EurekaHints`；新增 `arch-audit check-5` 机器守护；新增 `C-5 iframe 底座单一`；新增 8 个 Playwright e2e smoke 测试；新增 `iframe-rpc-safety` skill | 一次性物理兑现 + 测试基础设施 | 用户批准 G-plus |

---

## 📋 未来 /wf 执行规则

### ANALYSE 阶段

- **必读**本文件的 C-1 ~ C-5
- 若变更涉及 framework，判断是否属于 3 类允许（若不属于 → 必须走专项讨论）
- 若变更涉及 iframe 模板或 `public/templates/_shared/`，**必读** `.workflow/skills/iframe-rpc-safety.md`
- 在 `analysis.md` 的「硬约束延续」章节明确引用本文件

### ARCHITECT 阶段

- 架构设计若需 framework 修改，在 `architecture.md` 明确说明属于 3 类允许中的哪一类
- Review Gate 时用户明确批准才可继续

### TEST 阶段

- **必跑** `bash ./scripts/check.sh`（见 `.workflow/skills/tsc-workflow-gate.md` · AC-E11）
- 跑 `git diff --shortstat` 验证 C-2/C-3/C-4 延续
- 若本轮有 framework 修改，在使用记录表追加新行

### DEPLOY / REVIEW 阶段

- Review 阶段明确列出本轮是否使用了松动条款
- 若使用，Review Gate 时重申审批链路

---

## 🔗 相关文档

- [`docs/editor-framework.md`](./editor-framework.md) — B/C/D 阶段 editor 设计
- [`docs/layout-spec.md`](./layout-spec.md) — D 阶段 LayoutSpec 解耦契约
- [`docs/assembly-framework.md`](./assembly-framework.md) — 装配层底座
- [`.workflow/skills/tsc-workflow-gate.md`](../.workflow/skills/tsc-workflow-gate.md) — AC-E11 TSC 强检

---

## 历史演进

- **B 阶段** 首次提出 "framework 零改" 硬约束（editor 插件化前提）
- **C 阶段** 延续硬约束（撤销重做 + 自动布局纯 editor 层实现）
- **D 阶段** 延续硬约束（UX 优化包 / hit-test / snap / hover）
- **D 阶段** review 发现 53 个 pre-existing TSC errors 藏在 framework（FM-4）
- **E 阶段** 用户批准 B-plus 方案 · 硬约束首次**受控松动** · 新增 3 允许 + 3 禁止条款 + 使用记录表 + AC-E11 TSC 进工作流防复发
