# E 阶段 · TSC 技术债清理 — 分析

> Session: `wf-20260429054300.`
> Requirement: P1 清理 53 个 pre-existing TSC errors（D 阶段 review 标注"主要在 chemistry/reaction.ts 和 framework/"）

## 思考摘要

用户给的 D 阶段 review 印象"主要在 chemistry/reaction.ts 和 framework/"是**粗略归纳**。实际 `npx tsc --noEmit` 基线结果揭示更精细的真相：
- 错误总数 53 个（其中 49 与 chemistry props 类型打通相关，4 个孤立）
- **根因高度集中**：5 个 chemistry `Props` interface 不兼容 framework 核心契约 `IExperimentComponent<Record<string, unknown>, ...>`
- **2 个孤立 bug 是真漏洞**，不是类型系统哲学问题：engines/index.ts 缺 import、circuit/index.ts 缺 re-export
- **3 个孤立错误可一次性消解**：AssemblyBundle.spec 内联字面量类型与 AssemblySpec 别名不等价

本轮工作本质是**修复 framework 与 chemistry 的类型契约断裂**，这迫使我们**正视 framework 零改硬约束的松动**。

## 根因 / Root Cause

### 问题 1：Chemistry Props 不兼容 framework 核心契约（49/53 errors）

**现象**：
```ts
// framework/components/AbstractComponent.ts 要求:
interface IExperimentComponent<P extends Record<string, unknown>, S> { props: P; ... }

// chemistry/components.ts 声明:
interface FlaskProps { volumeML: number; shape: FlaskShape; label?: string; meta?: Record<string, unknown> }
// 闭合对象类型，无 index signature
```

**TS 5.x 行为**：闭合对象类型 `FlaskProps` **不**自动 assignable 到 `Record<string, unknown>`（因缺 index signature）。这导致任何用 `ChemistryComponent` 作为 `IExperimentComponent<Record<string, unknown>, ...>` 的泛型实参的地方都报错：
- `engines/chemistry/reaction.ts`: `InteractionEngine<ChemistryGraph, ...>` 约束不满足（5 errors）
- `framework/domains/chemistry/**`: solver / assembler / builder / reactions 全链触发（约 35 errors）
- `chemistry/__tests__/`: 测试侧自然也触发（5 errors）

**为何一直没爆炸**：`ts-jest --isolated-modules` 只对每个文件做局部类型检查，不做跨模块约束验证。Jest 535/535 绿骗了我们四个阶段的眼睛。

### 问题 2：Chemistry Reaction Rules 访问 union 成员字段（10/53 errors）

**现象**：`acid-base-neutralization.ts` 的 reaction rule 函数签名接受 `ChemistryComponent`，该类型是 `Flask | Reagent | Bubble | Solid | Thermometer` union。代码直接访问 `.props.formula`、`.props.concentration`、`.props.moles`：
```ts
// acid-base-neutralization.ts L36
if (c.props.formula === 'HCl') { ... }  // ❌ 'formula' 不存在于 FlaskProps
```

**根因**：只有 `ReagentProps` 和 `SolidProps` 有 `formula`；只有 `ReagentProps` 有 `concentration` 和 `moles`。访问前必须用 `c.kind === 'reagent'` 收窄类型。这是真正的 **discriminated union 漏窄**。

这也解释了为什么这些 reaction rules **运行时其实能工作**——因为实际只会有 `reagent` 传进这些分支（上游过滤），但 TS 没有证据这么认为。

### 问题 3：AssemblyBundle.spec 内联类型与 AssemblySpec<D> 不等价（4/53 errors）

**现象**：`framework/assembly/layout.ts` L115:
```ts
export interface AssemblyBundle<D> {
  spec: { domain: D; components: Array<...>; connections: unknown[]; metadata?: ... };  // ← 内联字面量
  layout?: LayoutSpec<D>;
}
```

`framework/assembly/spec.ts` 已有 `AssemblySpec<D>` 别名定义相同结构，但 AssemblyBundle 没复用。结果 `CircuitBuilder.toSpec()` 返回 `AssemblySpec<'circuit'>` 赋给 `AssemblyBundle.spec` 报 TS2322（4 处）。

这是**纯结构 duplication**的后果，修复即消除 duplication。

### 问题 4：engines/index.ts 真 bug — 缺 import（1 error）

**现象**：L45 `export { default as chemistryReactionEngine } from './chemistry/reaction';`  只创建了 re-export，不创建当前文件局部绑定。L82 `registry.register(chemistryReactionEngine)` 需要局部绑定但**缺少 `import ... from './chemistry/reaction'`**（对比 L64~66 其他引擎都有）。

**实际影响**：这是**真的运行时 bug** —— `chemistryReactionEngine` 永远不会被注册到 registry。但因为 chemistry 实验的代码路径用 iframe HTML 模板而非 engines/，运行时也没暴露问题。

### 问题 5：circuit/index.ts 缺 2 个 re-export（2 errors）

**现象**：`circuit/__tests__/circuit-assembly.test.ts` 用 `AssemblyBuildError` + `validateSpec`（分别在 `framework/assembly/errors.ts` L43 和 `framework/assembly/validator.ts` L29），但 `framework/domains/circuit/index.ts` 没 re-export 这俩。

**实际影响**：测试编译不过（但 jest 不做严类检查所以现象不明显）。

### 问题 6：layout-spec.test.ts 1 个无用 @ts-expect-error（1 error）

**现象**：L145 `// @ts-expect-error` 指向的代码实际上已**不会**引发类型错（可能是 anchor 字段宽容度已调整），所以 `@ts-expect-error` 本身变成 TS2578 错误。删除即可。

## 受影响位置

### 必改文件清单（按信号集中度）

| # | 文件 | 问题 | Errors |
|---|------|------|--------|
| 1 | `src/lib/framework/domains/chemistry/components.ts` | 5 个 Props 接口缺 index signature | **解 35+ errors 根**（链式消解） |
| 2 | `src/lib/framework/assembly/layout.ts` | `AssemblyBundle.spec` 没用 `AssemblySpec<D>` 别名 | 解 4 errors |
| 3 | `src/lib/framework/domains/chemistry/reactions/acid-base-neutralization.ts` | 缺 discriminated union narrowing | 解 12 errors（2345/2322/2339） |
| 4 | `src/lib/framework/domains/chemistry/reactions/metal-acid.ts` | 同上（少）| 解 3 errors |
| 5 | `src/lib/framework/domains/chemistry/reactions/iron-rusting.ts` | 同上（少） | 解 2 errors |
| 6 | `src/lib/framework/domains/chemistry/reaction-utils.ts` | 断言冲突（TS2352） | 解 4 errors |
| 7 | `src/lib/framework/domains/chemistry/__tests__/chemistry-{reactions,components}.test.ts` | 派生问题，大概率跟着 1+3 消解 | 解 6 errors |
| 8 | `src/lib/engines/index.ts` L82 | 缺 `import chemistryReactionEngine from './chemistry/reaction'` | 解 1 error（且修运行时 bug）|
| 9 | `src/lib/framework/domains/circuit/index.ts` | 缺 `AssemblyBuildError` + `validateSpec` re-export | 解 2 errors |
| 10 | `src/lib/framework/__tests__/layout-spec.test.ts` L145 | 删除无用 `@ts-expect-error` | 解 1 error（+ 2 被 #2 带出） |

### 关联但可能不用改

- `framework/domains/chemistry/index.ts`、`solver.ts`、`assembly/chemistry-assembler.ts`、`assembly/chemistry-builder.ts`、`chemistry-graph.ts`：各 1 个 TS2344 —— 预期在 #1 修后全部消解（约束链源头被解开）。
- `framework/assembly/fluent.ts` L137：1 个 TS2322 —— 预期在 #2 修后消解。
- `framework/domains/chemistry/reactions/index.ts`：1 个 TS2344 —— 同上。

## 修改范围

| 文件 | 位置 | 修改 | 类型 |
|------|------|------|------|
| `framework/domains/chemistry/components.ts` | `FlaskProps/ReagentProps/BubbleProps/SolidProps/ThermometerProps` 接口各加一行 | `[key: string]: unknown` | P0 根因 |
| `framework/assembly/layout.ts` | `AssemblyBundle.spec` 字段 | 改为 `spec: AssemblySpec<D>` | P0 根因 |
| `framework/domains/chemistry/reactions/acid-base-neutralization.ts` | 每个 `.props.formula/concentration/moles` 访问前加 `if (c.kind === 'reagent')` | discriminated narrowing | P0 |
| `framework/domains/chemistry/reactions/metal-acid.ts` | 同上 | discriminated narrowing | P0 |
| `framework/domains/chemistry/reactions/iron-rusting.ts` | 同上 | discriminated narrowing | P1 |
| `framework/domains/chemistry/reaction-utils.ts` | TS2352 断言表达式调整（视具体 case 修）| ad-hoc | P1 |
| `framework/domains/chemistry/__tests__/*.ts` | 预期自动消解；如残留 2-3 处在测试 helper 里补 type assertion | ad-hoc | P2 |
| `engines/index.ts` L75 附近 | 新增 `import chemistryReactionEngine from './chemistry/reaction';` | 真 bug 修复 | P0 |
| `framework/domains/circuit/index.ts` | 新增 `export { AssemblyBuildError } from '../../assembly/errors';` `export { validateSpec } from '../../assembly/validator';` | 缺失导出 | P1 |
| `framework/__tests__/layout-spec.test.ts` L145 | 删除 `// @ts-expect-error` 一行 | 死指令清除 | P2 |

**预估变更量**：10 文件 · 主要是加 5 行 index signature + 1 行类型别名引用 + 10-15 处窄化 + 1 行 import + 2 行 re-export + 删 1 行。总计新增 ~25 行，删除 ~3 行，净 +22 行。

## 🛑 硬约束冲突（CRITICAL — 用户必须知晓）

**四轮（B/C/D 阶段）承诺的硬约束**：
- **framework 核心零改** (`src/lib/framework/**`)

**本轮的现实**：**必须改 framework 文件**才能根治 TSC 错误。无回避路径。

### 冲突性质

| 选项 | 路径 | 后果 |
|------|------|------|
| **A**：坚持不改 framework | 只改 src/lib/editor 和 src/lib/engines | 可能只消掉 3-5 个错误，50+ 个错误仍存在 — 本轮失败 |
| **B**：本轮松动硬约束（建议）| 5 个 Props 加 index signature + AssemblyBundle.spec 改别名 + 3 个 reactions 收窄 + 修真 bug | 消 50+ 错误，但**硬约束从"四轮零改"变为"五轮有 1 次受控改"** |
| **C**：只改非 framework 部分，framework 部分用 `// @ts-ignore` 掩盖 | 全部 @ts-ignore | **反模式** — 掩盖而非根治，后续更难维护 |

### 建议 — 选择 B，附加补偿规则

本质上，"framework 零改"是一个**经验法则**，目的是防止**实验框架核心的语义变化**。本轮的变更：
1. **Props 加 index signature**：**纯扩展** — 不改变现有字段语义，只让 Props 能被当作 Record 用。零语义变化，零 runtime 影响。
2. **AssemblyBundle.spec 改用 AssemblySpec<D> 别名**：**消除 duplication** — 两者结构本就相同，这是"让类型系统说出本就真实的事"。零语义变化。
3. **修真 bug (engines/index.ts)**：**修 bug** 不是改架构。

这三类变更**不违反硬约束的精神**（防止语义变化），只违反字面。

**补偿规则**（加到硬约束列表）：
- ✅ 允许：Props 加 index signature、类型别名复用、bug 修复
- ❌ 禁止：新增 component kind、新增 solver、新增 engine、新增 reaction rule、修改现有字段类型

这条规则明确后，未来每轮 /wf 都有清晰边界。

## 风险评估

### P0

| R | 风险 | 缓解 |
|---|------|------|
| R-A | **硬约束松动导致"滑坡"**：一次松动后未来随便改 framework | 补偿规则明文写入 architecture-constraints.md（E 阶段末），未来每轮 /wf 开头读取 |
| R-B | **给 5 个 Props 加 index signature 会掩盖打字错误**：`c.props.flask_vloume`（错拼）编译也不报 | 保持具名字段 + index signature 并存；**访问错拼字段变 unknown** 而不是字符串 —— 后续使用时仍会在 assignment 时失败；可接受 |
| R-C | **discriminated narrowing 写错**：`c.kind === 'reagent'` 里访问 `c.props.unknownField` 会失败；或反过来对 Flask 访问 formula | Jest 已覆盖这些 reactions 的正向路径；修时保证只加 narrowing 不改逻辑；本轮新加 2-3 个 TS 类型测试验证 narrow 后正确 |

### P1

| R | 风险 | 缓解 |
|---|------|------|
| R-D | **修 AssemblyBundle.spec 类型可能破坏 isAssemblyBundle 运行时验证** | `isAssemblyBundle` 纯 runtime 检查 shape，与 TS 类型别名无关；修后跑 jest 整套即可 |
| R-E | **engines/index.ts 加 import 后 registry 真的会多 register** — 这是 behavioural change | 影响范围：`engines.getByType('chemistry_reaction')` 之前返回 undefined，之后有值。搜索该 engine 用法确认无 "检查 undefined then fallback" 的代码 |
| R-F | **TS2352 断言冲突修 reaction-utils 时可能要改逻辑** | 每个 TS2352 单独看，保守处理：首选改 `as unknown as T` 两阶段断言，其次才改逻辑 |

### P2

| R | 风险 | 缓解 |
|---|------|------|
| R-G | circuit/index.ts 新增 re-export 可能与其他文件重名冲突 | grep 检查 `AssemblyBuildError`/`validateSpec` 在 circuit/ 内是否已被定义（应该没） |

## 硬约束（延续 + 本轮补偿）

### 延续（B/C/D 阶段承诺，本轮继续兑现）

- **老模板零改** · `public/templates/` 零 byte 变动
- **零新依赖** · package.json 不动
- **零 React 污染** · `src/lib/editor/**` 保持无 react import

### 本轮受控松动（需用户批准）

- **framework 核心允许"扩展性修改"**：
  - ✅ Props 接口加 index signature
  - ✅ 类型别名复用（消除 duplication）
  - ✅ 纯 bug 修复（import 缺漏、re-export 缺漏）
  - ❌ 仍禁：新增 component kind、solver、engine、reaction rule
  - ❌ 仍禁：修改现有字段类型、重命名 interface、删除 export

## 承诺验收标准

| AC | 描述 | 验证 |
|----|------|------|
| AC-E1 | TSC 零错：`npx tsc --noEmit` 输出为空 | 命令执行 |
| AC-E2 | Jest 555 基线保持（不回归，可超过）| `npx jest` |
| AC-E3 | framework 变更仅限补偿规则允许的三类（扩展 / 别名 / bug 修复）| `git diff` 人工 review |
| AC-E4 | chemistry engine 真 bug 修复：`registry.getByType('chemistry_reaction')` 返回非 undefined | 新单元测试 |
| AC-E5 | 老模板零改 | `git diff public/templates/` 空 |
| AC-E6 | 零新依赖 | `git diff package.json` 空 |
| AC-E7 | editor 零 React 污染保持 | `Select-String 'from .react.' src/lib/editor` 匹配 0 |
| AC-E8 | architecture-constraints.md 明文记录本轮松动 | 文件 diff 可见 |
| AC-E9 | 新测试覆盖 discriminated union narrowing（至少 3 个，防 narrow 写反）| `npx jest` 输出 |
| AC-E10 | 回归测试：chemistry reactions 的运行时行为（acid-base / metal-acid）不变 | Jest chemistry suite 全绿 |

## 下游消费者 / Downstream Consumers

本轮是**纯类型清理**，不引入新 API、不改变现有契约的语义。下游消费者**零迁移成本**。

| 消费者 | 本轮产出消费方式 | 需要做什么变更 |
|-------|----------------|--------------|
| Chemistry reactions (acid-base/metal-acid/iron-rusting) | Props 加 index signature + union narrow 后，原有逻辑更明确 | **零变更**（编译时即正确） |
| engines/index.ts 导入侧 | `chemistryReactionEngine` 现在真正被 register | **零变更**（原来它就"应该"被 register）|
| `isAssemblyBundle` 运行时验证 | AssemblyBundle.spec 使用 AssemblySpec 别名 | **零变更**（runtime shape 不变）|
| 测试套件（535 基线 + 20 D 新 = 555）| 类型收紧后全部应继续通过 | **零变更**（AC-E2 保证）|
| 未来新 chemistry component kind | 只要 Props 声明时加 `[key: string]: unknown` 就符合契约 | **+1 行**（新规范）|
| 未来新 chemistry reaction | 直接用 `c.kind === 'reagent'` narrow | **无新约束**（TS 强制）|
| 未来跨轮 /wf | 新 architecture-constraints.md 规则需遵守 | **读文件**（1 次） |

## 与上一轮 /wf 的衔接

- ✅ 复用 D 阶段已发现的 53 个 pre-existing errors 基线（review-output.md 记录）
- ✅ 本轮不改 D 阶段新增代码（bounds/snap/hover/drawer 完全不动）
- ✅ 不影响 C 阶段 history/autoLayout 功能（纯类型修复）
- ⚠️ **松动"framework 零改"** — 明文记录，补偿规则约束未来

## 总结

**本轮交付**：TSC 技术债清零（53 → 0）· 10 文件修改 · ~25 行净增 · ~2-3h 预估 · 同时修复 1 个运行时 bug（chemistry engine 未注册）。

**关键架构决策**（ARCHITECT 阶段必议）：
1. 是否接受 framework 零改硬约束的**受控松动**（Option B）
2. 补偿规则（三类允许 + 若干明文禁止）是否合理
3. Props 加 index signature vs union narrowing 的分工是否正确

**不做**：
- 不改 chemistry 实验的 runtime 行为
- 不新增 component/solver/engine/reaction
- 不重构 framework 架构（本轮只做最小必要变更）
- 不追求"AC-E1 + 重构提升"的贪心目标

**延续**：老模板零改、零新依赖、editor 零 React 四轮承诺不变。
