# F 阶段 · Framework 物理边界守护 Skill

> **本 skill 在 ANALYSE/ARCHITECT 阶段自动加载**
> **Purpose**: 让未来 /wf Agent 理解并遵守 F 阶段建立的物理分层契约

## 🏛️ Framework 物理分层

```
src/lib/framework/
├── index.ts       ← 🔴 唯一对外入口（barrel）· 对 editor/engines/components 稳定
├── contracts/     ← 🔒 硬边界 · type-dominant 文件 · 修改需 [contracts-change] commit + ADR
│   ├── component.ts  (IExperimentComponent, AbstractComponent, Domain/Kind/Anchor/Stamp/DTO)
│   ├── graph.ts      (DomainGraph, EquipotentialNodeMap)
│   ├── port.ts       (PortRef, Connection, portKey, portEquals)
│   ├── solver.ts     (IDomainSolver, SolveResult)
│   ├── rule.ts       (ReactionRule)
│   ├── events.ts     (ReactionEvent, ReactionEvents)
│   ├── assembly.ts   (AssemblySpec, ComponentDecl, isAssemblySpec, emptySpec)
│   ├── layout.ts     (LayoutSpec, LayoutEntry, AssemblyBundle, layoutLookup)
│   └── errors.ts     (AssemblyError, AssemblyBuildError, makeError)
├── runtime/       ← 🟡 impl-dominant · 允许 bug 修复 / 性能优化
│   ├── union-find.ts  (UnionFind class)
│   ├── registry.ts    (componentRegistry)
│   ├── engine.ts      (InteractionEngine)
│   ├── validator.ts   (validateSpec)
│   └── assembler.ts   (Assembler)
├── builders/      ← 🟢 增量区 · 允许新增 builder 工具
│   └── fluent.ts      (FluentAssembly)
└── domains/       ← 🟢 自由演化
    ├── chemistry/
    └── circuit/
```

## 🔴 依赖方向（强制 · arch-audit.sh）

| 允许 | 禁止 |
|------|------|
| `runtime → contracts` | `contracts → runtime/builders/domains`（例外：graph.ts → union-find）|
| `builders → contracts + runtime` | `runtime → builders/domains` |
| `domains → contracts + runtime + builders` | `builders → domains` |
| 外部 → `@/lib/framework` barrel 唯一 | 外部 → `@/lib/framework/{contracts,runtime,builders}/*` |

## ✅ 安全操作（零审批）

- **新增 domain**：在 `domains/<new-domain>/` 下创建，只 import `contracts + runtime + builders`
- **新增 component kind**：在 `domains/<domain>/components.ts` 扩展 union + 对应 class
- **新增 reaction rule**：在 `domains/<domain>/reactions/<rule>.ts`
- **runtime 性能优化**：改 `runtime/*.ts` 内部实现，不改签名
- **新增 builder 工具**：在 `builders/<new-builder>.ts`
- **修改 domains 业务**：自由

## ⚠️ 需要警觉（commit msg 标记 + ADR 引用）

- **改 `contracts/*.ts` 字段或类签名**：commit msg 必须含 `[contracts-change]`
- **改 barrel `framework/index.ts` 删除 export**：可能 break 下游，需 ADR

## ❌ 禁止（CI 阻塞）

- 在 `editor/engines/components` 内 `import from '@/lib/framework/contracts/...'`（ESLint error）
- `contracts/*.ts` 内 import `runtime|builders|domains`（arch-audit fail，例外白名单除外）
- 新增 npm 依赖做简单事（历史硬约束 C-3）

## 🔧 守护工具

| 工具 | 作用 | 调用 |
|------|------|------|
| `scripts/arch-audit.sh` | 4 项依赖方向 + 外部 bypass 检查 | `bash scripts/arch-audit.sh` |
| ESLint `no-restricted-imports` | 外部代码 barrel-only 守护 | `npx eslint src/lib/editor src/lib/engines src/components` |
| `scripts/check.sh` | lint + tsc + jest 三件套（E 阶段 AC-E11）| `bash scripts/check.sh` |

## 🔄 如何为新 domain 接入（模板）

```typescript
// domains/<new-domain>/components.ts
import { AbstractComponent } from '../../contracts/component';
// ... domain-specific Props/Kind union ...

// domains/<new-domain>/graph.ts
import { DomainGraph } from '../../contracts/graph';
export class NewDomainGraph extends DomainGraph { /* ... */ }

// domains/<new-domain>/solver.ts
import type { IDomainSolver } from '../../contracts/solver';
export class NewDomainSolver implements IDomainSolver { /* ... */ }

// domains/<new-domain>/assembly/builder.ts
import { FluentAssembly } from '../../../builders/fluent';
// ... fluent subclass ...

// domains/<new-domain>/reactions/<rule>.ts
import type { ReactionRule } from '../../../contracts/rule';
export const myRule: ReactionRule<...> = { /* ... */ };

// domains/<new-domain>/index.ts  ← domain barrel
export * from './components';
export * from './graph';
// ... (domain-level aggregation)
```

## 📖 相关文档

- `docs/architecture-constraints.md` — 硬约束 + 使用记录表
- `docs/editor-framework.md` — Editor × Framework 集成
- `scripts/arch-audit.sh` — 审计脚本源
- `eslint.config.mjs` — F 阶段 no-restricted-imports 规则

## 📜 历史

- **F 阶段**（2026-04-29）· 首次物理分层重构 · 把 E 阶段软条款兑现为目录名 + 机器守护
- **E 阶段**（2026-04-29）· 首次受控松动 framework（自然语言软条款 · 现归档）
