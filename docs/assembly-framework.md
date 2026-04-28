# Assembly Framework — 跨学科装配层设计

> 装配层（`src/lib/framework/assembly/`）是与 `components/` / `solvers/` / `interactions/` 平级的**框架一等公民**。它负责**"把一堆元件拼成一个实验"**这一跨学科通用操作。
>
> 本文档是**活的合约**：任何对此层的修改都应回到本文档重读 5 个学科示例，确认通用性未被破坏。

## 为什么装配必须框架化

| 场景 | 结果 |
|------|------|
| ❌ 只写 `CircuitBuilder`（不抽象） | 下次做光学时必须复制粘贴一份 `OpticsBuilder`，长期形成多个副本 |
| ❌ 只抽象"电路专用"DSL | 化学反应场景根本不是"连接两个端口"——抽象对错位 |
| ✅ 抽象为 `Assembler<D>` + `FluentAssembly<D>`（本方案） | 任何 domain 实现 `Spec` + `ComponentBuilder` 即可复用 100% 装配逻辑 |

## 5 件套

```
framework/assembly/
├── spec.ts        — AssemblySpec<D> 纯数据类型 + 类型守卫
├── errors.ts      — AssemblyError / AssemblyBuildError（结构化错误）
├── validator.ts   — validateSpec()：结构/唯一性/端口引用 三层校验
├── assembler.ts   — Assembler<D>：Spec → DomainGraph（依赖注入 ComponentBuilder）
└── fluent.ts      — FluentAssembly<D>：链式 DSL 抽象基类
```

## 基本使用流程（以 circuit 域为例）

### 路径 A · 对象字面量（适合 JSON / 数据库驱动）

```typescript
import { circuitAssembler } from '@/lib/framework/domains/circuit';
import type { CircuitSpec } from '@/lib/framework/domains/circuit';

const spec: CircuitSpec = {
  domain: 'circuit',
  components: [
    { id: 'B1', kind: 'battery', props: { voltage: 6 } },
    { id: 'R1', kind: 'resistor', props: { resistance: 10 } },
    { id: 'L1', kind: 'bulb',     props: { ratedPower: 2 } },
  ],
  connections: [
    { from: { componentId: 'B1', portName: 'positive' }, to: { componentId: 'R1', portName: 'a' } },
    { from: { componentId: 'R1', portName: 'b' },        to: { componentId: 'L1', portName: 'a' } },
    { from: { componentId: 'L1', portName: 'b' },        to: { componentId: 'B1', portName: 'negative' } },
  ],
};

const graph = circuitAssembler.assembleCircuit(spec);   // → CircuitGraph
```

### 路径 B · 链式 DSL（适合手写 / 脚本）

```typescript
import { CircuitBuilder, circuitAssembler } from '@/lib/framework/domains/circuit';

const graph = new CircuitBuilder()
  .battery({ voltage: 6, id: 'B1' })
  .resistor({ resistance: 10, id: 'R1' })
  .bulb({ ratedPower: 2, id: 'L1' })
  .loop()                              // auto-connect end→start in a series ring
  .build(circuitAssembler);           // → CircuitGraph
```

**两种路径产出的 `graph.toDTO()` 完全相同**（由 `circuit-assembly.test.ts` 的 AC-E 测试强制保证）。

---

## 5 学科扩展示例

这 5 个学科是**设计意图**——展示装配层如何跨域复用。本次交付中**只有 circuit 是真实实现**，其余是可编译的示例代码，证明"扩展到新学科不改 framework 一行"。

### 示例 1 · Circuit（电路 · 已实现）

```typescript
export const CIRCUIT_PORTS = {
  battery: ['positive', 'negative'],
  resistor: ['a', 'b'],
  bulb: ['a', 'b'],
  // ...
} as const;

export class CircuitAssembler extends Assembler<'circuit', CircuitComponent> {
  constructor() {
    super('circuit',
      (decl) => componentRegistry.create({ ...decl, domain: 'circuit' }) as CircuitComponent,
      () => new CircuitGraph(),
    );
  }
}

export class CircuitBuilder extends FluentAssembly<'circuit', CircuitComponent> {
  battery(opts: { voltage: number; id?: string }) {
    return this.add('battery', { voltage: opts.voltage }, { id: opts.id });
  }
  // ... resistor, bulb, switch_, wire, ammeter, voltmeter
}
```

### 示例 2 · Optics（光学 · 示例代码）

```typescript
// src/lib/framework/domains/optics/assembly/optics-spec.ts
export const OPTICS_PORTS = {
  lightSource: ['out'],
  lens:        ['in', 'out'],
  mirror:      ['in', 'out'],
  screen:      ['in'],
  prism:       ['in', 'out1', 'out2', 'out3'],  // spectrum split
} as const;

// src/lib/framework/domains/optics/assembly/optics-builder.ts
export class OpticsBuilder extends FluentAssembly<'optics', OpticsComponent> {
  source(opts: { wavelength: number; intensity: number; id?: string }) {
    return this.add('lightSource', { wavelength: opts.wavelength, intensity: opts.intensity }, { id: opts.id });
  }
  lens(opts: { focal: number; diameter: number; id?: string }) {
    return this.add('lens', { focal: opts.focal, diameter: opts.diameter }, { id: opts.id });
  }
  screen(opts: { width: number; id?: string }) {
    return this.add('screen', { width: opts.width }, { id: opts.id });
  }
}

// Usage:
const system = new OpticsBuilder()
  .source({ wavelength: 550, intensity: 1, id: 'S' })
  .lens({ focal: 100, diameter: 20, id: 'L1' })
  .screen({ width: 50, id: 'Scr' })
  .connect('S', 'out', 'L1', 'in')
  .connect('L1', 'out', 'Scr', 'in')
  .build(opticsAssembler);  // 需要 OpticsAssembler 的 domain-specific binding
```

### 示例 3 · Chemistry（化学 · 示例代码）

```typescript
export const CHEMISTRY_PORTS = {
  flask:        ['inlet', 'outlet'],
  burette:      ['drip'],
  reagent:      ['port'],
  thermometer:  ['probe'],
  indicator:    ['sample'],
} as const;

export class ChemistryBuilder extends FluentAssembly<'chemistry', ChemistryComponent> {
  flask(opts: { volume: number; solution: string; id?: string }) {
    return this.add('flask', { volume: opts.volume, solution: opts.solution }, { id: opts.id });
  }
  burette(opts: { volume: number; reagent: string; id?: string }) {
    return this.add('burette', { volume: opts.volume, reagent: opts.reagent }, { id: opts.id });
  }
  indicator(opts: { type: string; id?: string }) {
    return this.add('indicator', { type: opts.type }, { id: opts.id });
  }
}

// Titration experiment:
const titration = new ChemistryBuilder()
  .flask({ volume: 25, solution: 'HCl 0.1M', id: 'F1' })
  .burette({ volume: 50, reagent: 'NaOH 0.1M', id: 'B1' })
  .indicator({ type: 'phenolphthalein', id: 'I1' })
  .connect('B1', 'drip', 'F1', 'inlet')
  .connect('I1', 'sample', 'F1', 'inlet')
  .build(chemistryAssembler);
```

### 示例 4 · Mechanics（力学 · 示例代码）

```typescript
export const MECHANICS_PORTS = {
  mass:   ['top', 'bottom'],
  spring: ['upper', 'lower'],
  rod:    ['end_a', 'end_b'],
  anchor: ['hook'],
  pulley: ['axis', 'rope_in', 'rope_out'],
} as const;

export class MechanicsBuilder extends FluentAssembly<'mechanics', MechanicsComponent> {
  anchor(opts: { id?: string }) {
    return this.add('anchor', {}, { id: opts.id });
  }
  spring(opts: { stiffness: number; naturalLength: number; id?: string }) {
    return this.add('spring', { stiffness: opts.stiffness, naturalLength: opts.naturalLength }, { id: opts.id });
  }
  mass(opts: { value: number; id?: string }) {
    return this.add('mass', { value: opts.value }, { id: opts.id });
  }
}

// Spring-mass oscillator:
const oscillator = new MechanicsBuilder()
  .anchor({ id: 'A' })
  .spring({ stiffness: 100, naturalLength: 0.3, id: 'K' })
  .mass({ value: 1, id: 'M' })
  .connect('A', 'hook', 'K', 'upper')
  .connect('K', 'lower', 'M', 'top')
  .build(mechanicsAssembler);
```

### 示例 5 · Biology（生物 · 示例代码）

```typescript
export const BIOLOGY_PORTS = {
  cell:     ['membrane'],
  solution: ['contact'],
  nucleus:  ['envelope'],
  organelle: ['boundary'],
} as const;

export class BiologyBuilder extends FluentAssembly<'biology', BiologyComponent> {
  cell(opts: { type: string; volume: number; id?: string }) {
    return this.add('cell', { type: opts.type, volume: opts.volume }, { id: opts.id });
  }
  solution(opts: { concentration: number; solute: string; id?: string }) {
    return this.add('solution', { concentration: opts.concentration, solute: opts.solute }, { id: opts.id });
  }
}

// Osmosis experiment:
const osmosis = new BiologyBuilder()
  .cell({ type: 'plant', volume: 100, id: 'C' })
  .solution({ concentration: 0.5, solute: 'NaCl', id: 'S' })
  .connect('C', 'membrane', 'S', 'contact')
  .build(biologyAssembler);
```

---

## 通用性保证（AC-A ~ AC-E）

### AC-A 通用化 — `framework/assembly/*` 零学科词

```bash
# 自动化保证：
grep -rE "battery|bulb|lens|flask|spring|cell" src/lib/framework/assembly/
# 结果应为空
```

测试：`src/lib/framework/__tests__/assembly.test.ts::AC-A`

### AC-B 结构化 — 五件套各自独立可测

```
describe('spec.ts (isAssemblySpec, emptySpec)')        ← 2 tests
describe('errors.ts (AssemblyBuildError, makeError)')   ← 1 test
describe('validator.ts (三层校验)')                      ← 6 tests
describe('assembler.ts (Spec → DomainGraph)')           ← 3 tests
describe('fluent.ts (chainable DSL)')                   ← 4 tests
```

### AC-C 可扩展 — 5 mock domain 均通过管线

测试 `test.each(ALL_MOCK_DOMAINS)` 对 optics/chemistry/mechanics/biology/circuit 五个 mock 分别验证 literal + DSL 两条路径。

### AC-D 可维护 — 单文件 ≤ 250 行，新增学科零侵入

测试 `test('adding a 6th mock domain requires zero edits to framework/assembly/*')` 证明。

### AC-E 可配置 — literal ≡ DSL 全域等价

测试 `test.each(ALL_MOCK_DOMAINS)('literal and DSL produce equivalent DTO')` 对每个 mock 独立断言。

---

## 如何扩展新学科（实操手册）

1. 在 `src/lib/framework/components/base.ts` 的 `ComponentDomain` 联合中添加（如尚未）学科标签
2. 在 `src/lib/framework/domains/<new>/components.ts` 定义元件类（继承 `AbstractComponent`）
3. 在 `domains/<new>/index.ts` 用 `componentRegistry.register(...)` 注册工厂
4. 新建 `domains/<new>/assembly/`：
   - `<new>-spec.ts` — 定义 `KIND_PORTS` 表 + `CircuitSpec` 类型别名
   - `<new>-assembler.ts` — 定义 `<New>Assembler extends Assembler<...>`
   - `<new>-builder.ts` — 定义 `<New>Builder extends FluentAssembly<...>`（加 sugar 方法）
   - `index.ts` — barrel
5. 在 `framework.test.ts` 风格的测试中新增 describe 块
6. **结束** — `framework/assembly/*` 一行不改

---

## 常见问答

**Q1: 为什么 `FluentAssembly.chain()` 的默认端口是 'out' / 'in'？**
A: 这是**最弱约束默认值**。如果 domain 的元件都用 `in/out` 端口（光学最典型），则直接可用；不满足时 domain 子类（如 `CircuitBuilder.loop()`）可以提供更合适的 convenience。

**Q2: `AssemblySpec` 为什么是纯数据？**
A: 三大好处——(1) 可被 JSON.stringify 序列化走 postMessage；(2) 测试断言用 `toEqual` 一行搞定；(3) 可持久化到数据库/JSON 文件。一旦带方法就失去这些能力。

**Q3: `Assembler` 和 `FluentAssembly` 能不能合并？**
A: 不行，职责正交：Assembler 专注 Spec→Graph（转换），FluentAssembly 专注人类友好的 DSL 输入（表达）。两者独立允许 Spec 还来自其他源（如 JSON 导入、LLM 生成）。

**Q4: 如何让 Spec 支持 JSON 文件持久化？**
A: 当前 out-of-scope。未来可在 `framework/assembly/io.ts` 增加 `specFromJSON(jsonString)` / `specToJSON(spec)` 两个纯函数，不涉及装配核心。

---

## 相关文档

- `docs/component-framework.md` — 元件/图/求解器/反应引擎的整体框架说明
- `output/architecture.md` — 本次重构的决策依据
- `output/execution-plan.md` — 21 任务的执行计划
- `output/test-report.md` — 测试执行报告
