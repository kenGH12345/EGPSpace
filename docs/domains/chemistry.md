# Chemistry Domain · 设计文档

> 继 Circuit 域之后的第二个全框架 domain，验证跨学科通用性。
> Framework 层零修改 —— 架构通用性的硬核证据。

---

## 五元件概览

| Kind | Ports | Props 核心字段 | spawn 可能性 |
|------|-------|---------------|--------------|
| `flask` | `['contents']` | `{volumeML, shape: 'beaker'｜'tube'｜'erlenmeyer', label?}` | 无（用户装配时放） |
| `reagent` | `['in']` | `{formula, moles, concentration, phase: 'aq'｜'l'｜'s'｜'g'}` | ✅ 反应产物 |
| `bubble` | `['in']` | `{gas, rateMolPerTick, accumulatedMoles?}` | ✅ 产气反应 |
| `solid` | `['in']` | `{formula, massG, state: 'intact'｜'rusting'｜'dissolved'}` | 否（预置）· mutate-able |
| `thermometer` | `['in']` | `{tempC, range: [min,max]}` | 否 |

**端口语义差异（vs circuit）**：
- Circuit: 对等电气端口（`['+', '-']`）— 双向连接
- Chemistry: 容器-内容物（Flask `'contents'` ← Reagent `'in'`）— 有方向

这个差异**完全由 domain 自己定义**——`framework/components/base.ts` 的 `ports: readonly string[]` 是 opaque string，不假设语义。

---

## 求解器 · StoichiometrySolver

不做：平衡常数 / 动力学 / 时间步进 / 热力学。

做：
1. 扫描每个 Flask → 匹配 `REACTION_REGISTRY`
2. 识别限速试剂（`min(moles / stoichCoeff)`）
3. 填 `perComponent[id] = {moles, phase, state}`
4. 返回 `reactions: ReactionCandidate[]` 供规则消费

**复杂度**：O(F × R × contents²)，F=Flask 数，R=注册反应数。典型场景 F<5, R<10，远低于 circuit 的 O(n³) MNA。

---

## 三条反应规则

| Rule | 方程式 | 事件语义 | L1 引擎 |
|------|-------|---------|--------|
| `chemistry/acid-base-neutralization` | H₂SO₄ + 2 NaOH → Na₂SO₄ + 2 H₂O | spawn salt + water · remove limiting · mutate excess | **TitrationEngine**（pH 咨询） |
| `chemistry/metal-acid` | Zn + H₂SO₄ → ZnSO₄ + H₂↑ | spawn Reagent(ZnSO4) + **spawn Bubble(H2)** · mutate Zn.massG | 无（纯化学计量） |
| `chemistry/iron-rusting` | 4 Fe + 3 O₂ → 2 Fe₂O₃ | **mutate Fe.state**（intact→rusting→dissolved）+ spawn Solid(Fe2O3) | **IronRustingEngine**（速率） |

**三条规则各代表一种事件语义**：
- spawn（新元件产生）
- remove（完全消耗）
- mutate（属性单向推进）

---

## 装配层

与 Circuit 一致的 5 件套：

```ts
// Spec（纯数据 POJO）
interface ChemistrySpec extends AssemblySpec<'chemistry'> {}

// Assembler（domain 绑定）
class ChemistryAssembler extends Assembler<'chemistry', ChemistryComponent>

// Builder（链式 DSL）
class ChemistryBuilder extends FluentAssembly<'chemistry'> {
  flask(opts): this
  pour(flaskId, reagentOpts): this       // auto-connect to flask.contents
  drop(flaskId, solidOpts): this
  observe(flaskId, thermometerOpts): this
}
```

DSL 产物 ≡ 等价 literal spec（AC-E 延续验证）。

---

## ChemistryReactionEngine v2.0 dual-path

```ts
engine.compute(params) {
  if (isV2GraphPayload(params)) {
    // v2: graph → Assembler → StoichiometrySolver → InteractionEngine + CHEMISTRY_REACTIONS
    return { perComponent, events, components, spawnCount, removeCount, mutateCount, ... };
  }
  // v1: legacy numeric params → closed-form stoichiometry
  return { reactionExtent, acidRemaining, baseRemaining };
}
```

三重 type guard：`graph 是 object && components 是 Array && components.length > 0`

---

## 如何新增化学反应（cookbook 3 步）

```ts
// 1. 填入 REACTION_REGISTRY（纯数据，无函数）
REACTION_REGISTRY['chemistry/combustion-CH4'] = {
  id: 'chemistry/combustion-CH4',
  description: '甲烷燃烧 (CH4 + 2 O2 → CO2 + 2 H2O)',
  reactants: [{formula: 'CH4', coefficient: 1}, {formula: 'O2', coefficient: 2}],
  products:  [{formula: 'CO2', coefficient: 1, phase: 'g'}, {formula: 'H2O', coefficient: 2, phase: 'l'}],
  // legacyEngine 可选
};

// 2. 写 rule（thin adapter）
export const combustionRule: ReactionRule<ChemistryGraph, ChemistrySolveResult> = {
  id: 'chemistry/combustion-CH4',
  domain: 'chemistry',
  description: REACTION_REGISTRY['chemistry/combustion-CH4'].description,
  evaluate(graph, solution) {
    const candidates = solution.reactions.filter(rc => rc.ruleId === this.id);
    return candidates.flatMap(cand => [
      /* remove reactants, spawn products */
    ]);
  }
};

// 3. 加到 CHEMISTRY_REACTIONS
export const CHEMISTRY_REACTIONS = [..., combustionRule];
```

零 framework 修改。

---

## 与 Circuit 域对照

| 特性 | Circuit | Chemistry |
|------|---------|-----------|
| Graph 基类 | `DomainGraph<CircuitComponent>` | `DomainGraph<ChemistryComponent>` |
| 端口语义 | 对等电气节点 | 容器-内容物 |
| Solver 算法 | MNA 线性代数 (Ax=b) | 化学计量 + 限速试剂 |
| Reactions | 例外场景（过载） | 主业（反应即计算） |
| L1 引擎依赖 | 无（解 Ohm 本身） | 有（调 TitrationEngine 等 AC-F） |
| 示例实验 | circuit.html (v3) | metal-acid-reaction.html (v3) |

**共用零件**：`IExperimentComponent` / `DomainGraph` / `IDomainSolver` / `InteractionEngine` / `Assembler` / `FluentAssembly`

---

## 扩展路线

未来可做（非本轮）：
- `chemistry/electrolysis-rule` 复用现有 ElectrolysisEngine
- `chemistry/reaction-rate-rule` 复用现有 ReactionRateEngine
- `EquilibriumSolver`（第二 solver）支持 Kb/Kw 可逆反应
- 时间步进 solver（反应速率/锈蚀进度动画）
- acid-base-titration.html 升级为 v3-component（当前仍是 v2-atomic）

这些都**不需改 framework**，只新增 `domains/chemistry/*`。
