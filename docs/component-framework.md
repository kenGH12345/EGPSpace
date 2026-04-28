# Experiment Component Framework

> Cross-domain framework for building atomised, composable, configurable, reusable,
> port-connected, interacting experiment components.
>
> First domain implemented: **Circuit** (`src/lib/framework/domains/circuit/`).
> Designed for extension to **optics**, **mechanics**, **chemistry**, **biology**.

## 🧩 Sibling documents

- **[Assembly Framework](./assembly-framework.md)** — 跨学科装配层（Spec / Assembler / FluentAssembly），含 5 学科扩展示例
- `output/architecture.md` — 当前重构轮次的架构决策
- `output/execution-plan.md` — 任务执行计划

---

## Atomisation requirements (the 5 + 1 pillars)

| # | Requirement | How the framework enforces it |
|---|-------------|-------------------------------|
| 1 | **原子化** — Every component is an independent class/instance | `AbstractComponent<Props>` base class, one file per kind |
| 2 | **可组装** — Components assemble with an explicit connection syntax | `DomainGraph.connect(portA, portB)`; domain-specific `Builder` DSLs |
| 3 | **可配置** — Each component's parameters can be set independently | `component.props` is mutable; the next solver call picks up changes |
| 4 | **可复用** — Same component class can be instantiated many times across experiments | `componentRegistry` + pure classes; zero shared mutable state |
| 5 | **可关联** — Components link through named ports (port→port) | `PortRef = {componentId, portName}` + Union-Find equipotential nodes |
| 6 | **可互相作用** — Current/force/reaction flows through the whole network | `IDomainSolver.solve()` processes the full graph |
| 7 | **可反应演化** 🆕 — Interacting components can **spawn / remove / mutate** others | `ReactionRule` + `InteractionEngine` (fixed-point loop) |

---

## Architecture layers

```
┌─────────────────────────────────────────────────────────────┐
│                Framework (domain-agnostic)                   │
│  base.ts     — IExperimentComponent<Props>, AbstractComponent│
│  port.ts     — PortRef, Connection                           │
│  graph.ts    — DomainGraph (add/connect/buildEquipotentialNodes) │
│  union-find.ts — shared utility                              │
│  registry.ts — componentRegistry (cross-domain factory)      │
│  solvers/base.ts — IDomainSolver, SolveResult                │
│  interactions/{events,rule,engine}.ts — reactions            │
└─────────────────────────────────────────────────────────────┘
                               │
      ┌──────────────┬─────────┼──────────┬──────────────┐
      ▼              ▼         ▼          ▼              ▼
┌──────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐ ┌──────────┐
│ Circuit  │ │ Optics   │ │Mechanics│ │Chemistry │ │ Biology  │
│ (T-9…T-13│ │ (future) │ │(future) │ │(future)  │ │(future)  │
│ implemented)│         │ │         │ │          │ │          │
└──────────┘ └──────────┘ └─────────┘ └──────────┘ └──────────┘
```

Each domain provides:
1. **Components** (classes extending `AbstractComponent`)
2. **Graph** (subclass of `DomainGraph` with domain-specific helpers)
3. **Solver** (class implementing `IDomainSolver`)
4. **Reactions** (optional `ReactionRule` list)

---

## Minimum usage (circuit example)

```typescript
import { portRef, InteractionEngine } from '@/lib/framework';
import {
  Battery, Wire, Switch, Resistor, Bulb,
  CircuitGraph, CircuitSolver, CIRCUIT_REACTIONS,
} from '@/lib/framework/domains/circuit';

const g = new CircuitGraph();
g.add(new Battery('bat', 6))
 .add(new Switch('sw', true))
 .add(new Resistor('r1', 10))
 .add(new Bulb('b1', 5, 3));

g.connect(portRef('bat', 'positive'), portRef('sw', 'in'));
g.connect(portRef('sw', 'out'), portRef('r1', 'a'));
g.connect(portRef('r1', 'b'), portRef('b1', 'a'));
g.connect(portRef('b1', 'b'), portRef('bat', 'negative'));

const solver = new CircuitSolver();
const eng = new InteractionEngine(solver).registerAll(CIRCUIT_REACTIONS);
const { finalSolution, events } = eng.tick(g);

console.log(finalSolution.perComponent['b1'].glow);     // 0..1.5
console.log(events.map(e => e.reason));                 // ['过载烧毁...' | ...]
```

---

## Adding a new domain — the 4-file recipe

### Example 1 · Optics domain

**Step 1 — components** (`src/lib/framework/domains/optics/components.ts`):
```typescript
import { AbstractComponent, type ComponentStamp } from '@/lib/framework';

type OpticsStampEntry =
  | { kind: 'emitRay'; port: string; wavelength: number; intensity: number }
  | { kind: 'refract'; fromPort: string; toPort: string; n: number }
  | { kind: 'reflect'; fromPort: string; toPort: string; curvature: number };

export class LightSource extends AbstractComponent<
  { wavelength: number; intensity: number },
  OpticsStampEntry
> {
  readonly domain = 'optics' as const;
  readonly kind = 'light_source';
  readonly ports = ['out'] as const;
  toStamp(): ComponentStamp<OpticsStampEntry> {
    return {
      componentId: this.id,
      entries: [{ kind: 'emitRay', port: 'out',
        wavelength: this.props.wavelength, intensity: this.props.intensity }],
    };
  }
}

export class Lens extends AbstractComponent<
  { focalLength: number; diameter: number },
  OpticsStampEntry
> {
  readonly domain = 'optics' as const;
  readonly kind = 'lens';
  readonly ports = ['in', 'out'] as const;
  toStamp() { /* refract entry */ }
}

export class Screen extends AbstractComponent<{}, OpticsStampEntry> {
  readonly domain = 'optics' as const;
  readonly kind = 'screen';
  readonly ports = ['in'] as const;
  toStamp() { return { componentId: this.id, entries: [] }; }
}
```

**Step 2 — graph** extends `DomainGraph<ILightComponent>`.

**Step 3 — solver** implements `IDomainSolver`. For optics this is a **ray tracer** (not MNA):
```typescript
export class OpticsSolver implements IDomainSolver<OpticsGraph, OpticsSolveResult> {
  readonly domain = 'optics' as const;
  preCheck(g) { /* check there's at least one light source */ }
  solve(g) {
    // Trace each ray through lenses using Snell's law until it hits a Screen.
    // perComponent[screen.id] = { intensityMap, hitPoints }
  }
}
```

**Step 4 — reactions** (e.g. prism → spectrum):
```typescript
export const prismDispersionRule: ReactionRule<OpticsGraph, OpticsSolveResult> = {
  id: 'optics/prism-dispersion',
  domain: 'optics',
  description: 'A white light ray entering a prism is replaced by 7 monochromatic rays.',
  evaluate(graph, solution) {
    const events: ReactionEvent[] = [];
    for (const ray of graph.components().filter(c => c.kind === 'white_ray_through_prism')) {
      events.push(ReactionEvents.remove('optics/prism-dispersion', ray.id, '色散'));
      for (const colour of ['red','orange','yellow','green','blue','indigo','violet']) {
        events.push(ReactionEvents.spawn('optics/prism-dispersion',
          new MonoRay(`${ray.id}_${colour}`, colour), `${colour} ray`));
      }
    }
    return events;
  },
};
```

### Example 2 · Mechanics domain

```typescript
type MechStampEntry =
  | { kind: 'spring';  fromPort: string; toPort: string; k: number; restLength: number }
  | { kind: 'mass';    port: string; value: number }
  | { kind: 'pulley';  ports: string[]; frictionless: boolean };

export class Spring extends AbstractComponent<{ k: number; restLength: number }, MechStampEntry> { ... }
export class Mass   extends AbstractComponent<{ m: number; position: {x:number,y:number} }, MechStampEntry> { ... }
export class Pulley extends AbstractComponent<{ frictionless: boolean }, MechStampEntry> { ... }

export class MechanicsSolver implements IDomainSolver<MechGraph, MechSolveResult> {
  // Solves for equilibrium: Σ F = 0 on each node, or dynamics via Verlet integration.
}

// Reaction example: overstretched spring breaks
export const springBreakRule: ReactionRule = {
  id: 'mechanics/spring-break',
  evaluate(g, s) {
    for (const spring of g.components().filter(c => c.kind === 'spring')) {
      const extension = s.perComponent[spring.id].extension;
      if (extension > spring.props.elasticLimit) {
        return [ReactionEvents.mutate(..., spring.id,
          { k: 0, broken: true }, '弹性形变超限')];
      }
    }
    return [];
  },
};
```

### Example 3 · Chemistry domain

```typescript
type ChemStampEntry =
  | { kind: 'reagent'; port: string; formula: string; moles: number }
  | { kind: 'container'; ports: string[]; volume: number }
  | { kind: 'condition'; port: string; T: number; P: number };

export class Reagent extends AbstractComponent<{ formula: string; moles: number }, ChemStampEntry> { ... }
export class Flask extends AbstractComponent<{ volume: number }, ChemStampEntry> { ... }
export class Burette extends AbstractComponent<{ contains: string; dripRate: number }, ChemStampEntry> { ... }

// Reaction: acid + base → salt + water
export const acidBaseRule: ReactionRule<ChemistryGraph, ChemSolveResult> = {
  id: 'chemistry/acid-base-neutralization',
  domain: 'chemistry',
  evaluate(graph, solution) {
    const acids = graph.components().filter(c => c.kind === 'reagent' && isAcid(c));
    const bases = graph.components().filter(c => c.kind === 'reagent' && isBase(c));
    const events: ReactionEvent[] = [];
    for (const a of acids) {
      for (const b of bases) {
        if (sameContainer(graph, a, b)) {
          // HCl + NaOH → NaCl + H2O
          events.push(ReactionEvents.remove('chemistry/acid-base-neutralization', a.id, '中和'));
          events.push(ReactionEvents.remove('chemistry/acid-base-neutralization', b.id, '中和'));
          events.push(ReactionEvents.spawn('chemistry/acid-base-neutralization',
            new Reagent(`${a.id}_salt`, 'NaCl', a.props.moles), '生成盐'));
          events.push(ReactionEvents.spawn('chemistry/acid-base-neutralization',
            new Reagent(`${a.id}_water`, 'H2O', a.props.moles), '生成水'));
        }
      }
    }
    return events;
  },
};
```

### Example 4 · Biology domain

```typescript
type BioStampEntry =
  | { kind: 'cell'; port: string; species: string; organelles: string[] }
  | { kind: 'solution'; port: string; concentration: number };

export class Cell extends AbstractComponent<
  { species: string; turgor: number; alive: boolean },
  BioStampEntry
> { ... }
export class Solution extends AbstractComponent<{ concentration: number }, BioStampEntry> { ... }

// Reaction: cell + hypertonic solution → plasmolyzed cell
export const plasmolysisRule: ReactionRule = {
  id: 'biology/plasmolysis',
  evaluate(g, s) {
    const events = [];
    for (const cell of g.components().filter(c => c.kind === 'cell')) {
      const osmoticPressure = s.perComponent[cell.id].osmoticPressure;
      if (osmoticPressure > CRITICAL_THRESHOLD) {
        events.push(ReactionEvents.mutate('biology/plasmolysis', cell.id,
          { turgor: 0, plasmolyzed: true }, '质壁分离'));
        events.push(ReactionEvents.spawn('biology/plasmolysis',
          new PlasmolysisMarker(`${cell.id}_mark`), '显示质壁分离'));
      }
    }
    return events;
  },
};
```

---

## Design invariants (critical — do not break)

1. `src/lib/framework/` MUST NOT import from any `src/lib/framework/domains/*` file.
2. Names in `framework/` (exported types, class names) MUST NOT contain domain-specific
   words like `battery`, `voltage`, `resistance`, `lens`, `spring`, etc.
3. Every domain implementation MUST register its component factories into
   `componentRegistry` at module load (in its `index.ts`).
4. `ReactionRule.evaluate()` MUST be deterministic for a given (graph, solution) pair,
   else the InteractionEngine's fixed-point loop won't terminate.
5. `InteractionEngine` has `MAX_ITER` (default 8) to prevent oscillation. Reactions
   that cannot stabilise within 8 iterations will emit a warning.

---

## Current implementation status

| Domain | Status | Files |
|--------|--------|-------|
| **circuit** | ✅ Implemented | `src/lib/framework/domains/circuit/{components,circuit-graph,solver,stamp}.ts` + `reactions/` |
| optics | 📝 Documented (this file) | Not implemented |
| mechanics | 📝 Documented (this file) | Not implemented |
| chemistry | 📝 Documented (this file) | Not implemented |
| biology | 📝 Documented (this file) | Not implemented |

---

## Test coverage

- `src/lib/framework/__tests__/framework.test.ts` — 22 tests covering:
  - Union-Find basics (2)
  - Component atomisation (AC-1, AC-4) (2)
  - Graph port connections (AC-2, AC-5) (2)
  - MNA solver on 5 canonical topologies + bulb glow (6)
  - InteractionEngine + reaction (AC-7) (3)
  - Full atomisation acceptance (AC-1 through AC-7) (7)

Run: `npx jest src/lib/framework/__tests__/framework.test.ts`
