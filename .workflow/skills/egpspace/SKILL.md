---
name: EGPSpace (Eureka)
project: EGPSpace
version: 2.0.0
generated_at: 2026-04-25T23:00:00.000Z
generator: manual (Andrej Karpathy — Code-First Edition)
triggers:
  keywords: ['eureka', 'egpspace', 'experiment', 'science', 'education', 'coze', 'physics', 'chemistry', 'biology']
  roles: ['developer', 'architect', 'analyst', 'tester']
---
# EGPSpace (Eureka) Skill — Code-First Edition

> **Focus**: This skill prioritizes **source-code-level patterns** — interfaces, signatures, class structures, file conventions, and coding templates. Use it when writing new engines, schemas, API routes, or canvas elements.

---

## 0. Architecture at a Glance

| Layer | Entry | Tech |
|-------|-------|------|
| Web Framework | `src/app/layout.tsx` | Next.js 16 + React 19 + TypeScript 5 |
| UI System | `src/components/ui/` | shadcn/ui (Radix + Tailwind v4) |
| Experiment Engine | `src/lib/engines/` | Registry + Interface + Lazy Load |
| Schema (SSOT) | `src/lib/experiment-schema.ts` | Unified `ExperimentSchema` |
| AI Generation | `src/app/api/generate/route.ts` | Coze SDK + Triple-Lock sanitization |
| Workflow Engine | `src/workflow/engine.ts` | Standalone class-based event emitter |
| Renderer | `src/lib/declarative-renderer.ts` | Schema → Canvas draw calls |

---

## 1. Engine Implementation Pattern

### 1.1 Interface Contract (`IExperimentEngine`)

Every experiment engine MUST implement this exact interface. No exceptions.

```typescript
// src/lib/engines/interface.ts
export interface IExperimentEngine {
  metadata: EngineMetadata;
  validate(params: Record<string, number>): ValidationResult;
  compute(params: Record<string, number>): ComputationResult;
}

export interface EngineMetadata {
  id: string;                     // kebab-case: 'physics/buoyancy'
  subject: string;                // 'physics' | 'chemistry' | 'biology' | ...
  displayName: string;            // Human-readable Chinese name
  description: string;            // One-sentence explanation
  version: string;                // Semantic version: '1.0.0'
  capabilities: readonly string[];// ['compute', 'validate'] as const
  supportedElementTypes: readonly string[];
}

export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

export interface ComputationResult {
  values: Record<string, number | string>;
  state: string;                  // Human-readable state label
  explanation: string;            // Natural language result description
  trace?: Record<string, { formula: string; inputs: Record<string, number>; result: number }>;
}
```

### 1.2 Engine Implementation Template

Copy this template for every new engine. Replace `Xxx` with experiment name (PascalCase).

```typescript
/**
 * Subject: Xxx Experiment Engine
 *
 * Implements IExperimentEngine for <concept>.
 * <One-line description of physics/chemistry principle>.
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
} from '../interface';

export class XxxEngine implements IExperimentEngine {
  metadata = {
    id: 'subject/xxx',            // MUST match registry key
    subject: 'physics',           // Domain
    displayName: '实验中文名',
    description: '一句话描述实验原理',
    version: '1.0.0',
    capabilities: ['compute', 'validate'] as const,
    supportedElementTypes: ['rect', 'text', 'line'] as const,
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: ValidationResult['errors'] = [];

    const p1 = params.param1 ?? params.alias1 ?? defaultValue1;

    if (p1 <= 0) errors.push({ field: 'param1', message: '必须大于0', severity: 'error' });
    if (p1 > threshold) errors.push({ field: 'param1', message: '异常值警告', severity: 'warning' });

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const p1 = params.param1 ?? params.alias1 ?? defaultValue1;
    const p2 = params.param2 ?? defaultValue2;

    // Core physics/chemistry/math computation
    const result = p1 * p2;

    return {
      values: { result, derived: result / 2 },
      state: result > threshold ? '状态A' : '状态B',
      explanation: `当参数为 ${p1} 时，结果为 ${result.toFixed(2)}。`,
      trace: {
        result: { formula: 'p1 × p2', inputs: { p1, p2 }, result },
      },
    };
  }
}

export default new XxxEngine();
```

### 1.3 Registry Registration Pattern

Engines are lazily loaded via a registry map. Add your engine to BOTH files.

```typescript
// src/lib/engines/registry.ts
const ENGINE_REGISTRY: Record<string, () => Promise<IExperimentEngine>> = {
  'physics/buoyancy':  () => import('./physics/buoyancy').then(m => m.default),
  'chemistry/titration': () => import('./chemistry/titration').then(m => m.default),
  'subject/xxx':       () => import('./subject/xxx').then(m => m.default), // ← ADD
};
```

```typescript
// src/lib/engines/index.ts
export { BuoyancyEngine } from './physics/buoyancy';
export { TitrationEngine } from './chemistry/titration';
export { XxxEngine } from './subject/xxx'; // ← ADD (optional, for named imports)
```

### 1.4 Alias Handling Convention

Engines MUST support param aliases via `??` fallback chain. This allows LLM-generated schemas to use different naming conventions.

| Pattern | Meaning | Example |
|---------|---------|---------|
| `params.rho_object ?? params.objectDensity ?? 800` | Primary alias → secondary alias → default | Density param |
| `params.g ?? 9.8` | Param → hard default | Gravity constant |
| `params.indicator ?? 0` | Enum index → default | Indicator selection |

---

## 2. Schema-First Type System

### 2.1 Core Schema Structure

```typescript
// src/lib/experiment-schema.ts
interface ExperimentSchema {
  meta: ExperimentMeta;
  params: ParamDefinition[];
  formulas: FormulaDefinition[];
  canvas?: CanvasElement[];       // Optional: system auto-fills from physicsType
  physics?: PhysicsConfig;        // Optional: system auto-fills
  interactions?: InteractionConfig[]; // Optional: system auto-fills
  teaching: TeachingDesign;
  scenes?: ExperimentScene[];
}
```

### 2.2 Discriminated Union + `as const` Patterns

All literal unions use `as const` arrays in engine metadata. This enables strict type narrowing.

```typescript
// Engine metadata
supportedElementTypes: ['rect', 'text', 'line'] as const,
capabilities: ['compute', 'validate'] as const,

// Domain enums
type SubjectDomain = 'physics' | 'chemistry' | 'biology' | 'geography' | 'math';
type PhysicsEngineType = 'buoyancy' | 'lever' | 'refraction' | 'circuit' | 'acid_base' | ...;
```

### 2.3 Parameter Definition Pattern

Every `ParamDefinition` MUST include these fields:

```typescript
interface ParamDefinition {
  name: string;           // camelCase English, used in formulas
  label: string;          // Chinese display name
  unit: string;           // Unit symbol (e.g. 'kg/m³', 'N', '°C')
  defaultValue: number;   // Must be within [min, max]
  min: number;
  max: number;
  step: number;           // Slider step increment
  category: 'input' | 'computed' | 'reference';
  description: string;    // Tooltip / helper text
}
```

**Rule**: At least ONE `category: 'input'` parameter is required per schema.

### 2.4 Formula Definition Pattern

```typescript
interface FormulaDefinition {
  name: string;           // Display name
  expression: string;     // Human-readable formula (e.g. 'F = ρ × g × V')
  description: string;    // Explanation
  variables: string[];    // Input variable names (must match param names)
  resultVariable: string; // Output variable name (appears in computed params)
}
```

---

## 3. API Route Coding Pattern

### 3.1 POST Handler Structure

All API routes in `src/app/api/` follow this exact structure:

```typescript
// src/app/api/<endpoint>/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Input validation
    if (!body.requiredField || typeof body.requiredField !== 'string') {
      return NextResponse.json(
        { error: '请输入有效的...' },
        { status: 400 }
      );
    }

    // Business logic
    const result = await processRequest(body);

    return NextResponse.json({
      success: true,
      data: result,
      // Optional: metadata
    });
  } catch (error) {
    console.error('Endpoint Error:', error);
    return NextResponse.json(
      { error: '操作失败，请重试' },
      { status: 500 }
    );
  }
}
```

### 3.2 Triple-Lock Security Pattern

The `/api/generate` route uses a three-layer defensive pattern. Any new LLM-consuming route SHOULD adopt it.

| Lock | Layer | Code Location | Purpose |
|------|-------|---------------|---------|
| Lock 1 | Prompt Ban | `buildSystemPrompt()` in route.ts | System prompt explicitly forbids canvas/interactions/code |
| Lock 2 | Output Sanitization | `sanitizeLLMOutput()` in route.ts | Runtime deletion of forbidden fields from LLM response |
| Lock 3 | Template Whitelist | `template-registry.ts` + client-side validation | Only pre-approved templates render visuals |

```typescript
// Lock 2 implementation — strip any fields LLM may have emitted
function sanitizeLLMOutput(raw: Record<string, unknown>): void {
  const FORBIDDEN = ['canvas', 'canvasConfig', 'interactions', 'graphics',
    'shapes', 'elements', 'code', 'html', 'css', 'javascript', 'script', 'ui'];

  for (const key of FORBIDDEN) {
    if (key in raw) delete raw[key];
  }

  // Legacy format: nested under experiment.*
  if (raw.experiment && typeof raw.experiment === 'object') {
    const exp = raw.experiment as Record<string, unknown>;
    for (const key of FORBIDDEN) {
      if (key in exp) delete exp[key];
    }
    // Deep clean: experiment.rules.code / experiment.rules.draw
    if (exp.rules && typeof exp.rules === 'object') {
      const rules = exp.rules as Record<string, unknown>;
      if ('code' in rules) delete rules.code;
      if ('draw' in rules) delete rules.draw;
    }
  }
}
```

### 3.3 JSON Extraction from LLM Response

Use progressively looser patterns. Never assume the LLM returns clean JSON.

```typescript
const jsonPatterns = [
  /```json\s*([\s\S]*?)\s*```/,   // Fenced code block with json label
  /```\s*([\s\S]*?)\s*```/,       // Fenced code block without label
  /(\{[\s\S]*\})/,                 // Raw JSON object (last resort)
];

let rawJson: Record<string, unknown> | null = null;

for (const pattern of jsonPatterns) {
  const match = content.match(pattern);
  if (match) {
    try {
      rawJson = JSON.parse(match[1].trim());
      break;
    } catch {
      // Try cleaning markdown artifacts
      const cleaned = match[1].replace(/```json|```/g, '').trim();
      rawJson = JSON.parse(cleaned);
      break;
    }
  }
}
```

### 3.4 Transform → Enrich → Validate Pipeline

```typescript
// 1. Transform LLM output to ExperimentSchema partial
const partial = transformToSchema(rawJson, subject);

// 2. Enrich with defaults and auto-generated teaching content
const schema = enrichSchema(partial);

// 3. Structural validation
const validation = validateSchema(schema);
if (!validation.valid) console.log('Warnings:', validation.errors);

// 4. Domain-knowledge validation
const knowledgeValidation = validateWithKnowledge(schema, concept);
schema = knowledgeValidation.schema;
```

---

## 4. Canvas Element Declaration Pattern

### 4.1 ElementType Union

```typescript
type ElementType =
  | 'rect' | 'circle' | 'line' | 'text'
  | 'spring' | 'wave' | 'beaker' | 'molecule'
  | 'lightRay' | 'forceArrow' | 'protractor'
  | 'battery' | 'resistor' | 'led' | 'switch'
  | 'ruler' | 'grid' | 'axis' | 'graph' | 'custom';
```

### 4.2 Adding a New Element Type

Adding a new canvas element requires changes in **three files**:

| Step | File | Action |
|------|------|--------|
| 1 | `src/lib/experiment-schema.ts` | Add to `ElementType` union + define interface extending `BaseDrawElement` |
| 2 | `src/lib/declarative-renderer.ts` | Add draw handler in switch statement |
| 3 | `src/lib/optimized-renderer.ts` | Add batch pipeline support (if performance-sensitive) |

---

## 5. Workflow Engine Pattern

### 5.1 Class Structure

```typescript
// src/workflow/engine.ts
export class WorkflowEngine {
  private executions: Map<string, WorkflowExecution> = new Map();
  private eventListeners: Map<string, Function[]> = new Map();
  private isRunning: boolean = false;

  constructor(private storage?: StorageAdapter) {}

  async createExecution(def: WorkflowDefinition, vars?: Record<string, unknown>): Promise<WorkflowExecution> { ... }
  async startExecution(id: string): Promise<void> { ... }
  async pauseExecution(id: string): Promise<void> { ... }
  async resumeExecution(id: string): Promise<void> { ... }
  async cancelExecution(id: string): Promise<void> { ... }
  getExecution(id: string): WorkflowExecution | null { ... }
  on(event: string, listener: Function): void { ... }
  getStatus(): { isRunning: boolean; executionCount: number } { ... }
}
```

### 5.2 Event-Driven Callback Pattern

Use `on()` + `emitEvent()` for decoupled execution state notifications:

```typescript
const engine = new WorkflowEngine();

engine.on(WORKFLOW_EVENTS.EXECUTION_STARTED, (execution) => {
  console.log('Started:', execution.id);
});

engine.on(WORKFLOW_EVENTS.STEP_FAILED, (execution, stepId, error) => {
  console.error('Step failed:', stepId, error);
});
```

**Rule**: Event listeners must catch their own errors to avoid crashing the engine.

---

## 6. File Organization & Naming Conventions

### 6.1 Directory Structure

```
src/
├── app/
│   ├── layout.tsx                     # Root layout (metadata, globals)
│   ├── page.tsx                       # Home page
│   ├── experiments/
│   │   ├── page.tsx                   # List/redirect
│   │   ├── [id]/page.tsx              # Dynamic experiment player
│   │   └── {preset-name}/page.tsx     # Static preset experiments
│   └── api/
│       ├── generate/route.ts          # LLM generation (POST)
│       └── llm/route.ts               # Direct LLM chat (POST)
├── components/
│   ├── experiment-canvas.tsx          # Main renderer (kebab-case for multi-word)
│   ├── DynamicExperiment.tsx          # Runtime wrapper (PascalCase)
│   └── ui/                            # shadcn/ui components (PascalCase)
├── lib/
│   ├── engines/
│   │   ├── interface.ts               # IExperimentEngine contract
│   │   ├── registry.ts                # Lazy-load map
│   │   ├── index.ts                   # Named re-exports
│   │   ├── physics/
│   │   │   └── buoyancy.ts            # PascalClass + default singleton
│   │   └── chemistry/
│   │       └── titration.ts
│   ├── experiment-schema.ts           # Unified Schema (SSOT)
│   ├── experiment-types.ts            # Legacy types (deprecated)
│   ├── declarative-renderer.ts        # Canvas draw-call generator
│   └── workflow/                      # Standalone workflow engine
├── hooks/
│   └── useMediaPipeHands.ts           # useHookName pattern
└── __tests__/                         # Co-located tests (Jest)
    └── lib/
        └── schema-validator.test.ts
```

### 6.2 Naming Rules

| Target | Convention | Example |
|--------|-----------|---------|
| React components | PascalCase | `ExperimentCanvas`, `DynamicExperiment` |
| File names (components) | PascalCase | `ExperimentCanvas.tsx` |
| File names (utils/hooks) | camelCase / kebab-case | `useMediaPipeHands.ts`, `declarative-renderer.ts` |
| Engine classes | PascalCase + `Engine` suffix | `BuoyancyEngine`, `TitrationEngine` |
| Engine file names | kebab-case | `buoyancy.ts`, `titration.ts` |
| Engine metadata.id | `subject/experiment-name` | `physics/buoyancy`, `chemistry/titration` |
| TypeScript interfaces | PascalCase, no `I` prefix | `ExperimentSchema`, `EngineMetadata` |
| Type aliases | PascalCase | `SubjectDomain`, `PhysicsEngineType` |
| Constants | SCREAMING_SNAKE_CASE | `INDICATORS`, `STAGE_GUIDELINES` |
| Functions | camelCase | `validateSchema`, `enrichSchema` |
| Private methods | camelCase with `private` modifier | `executeStepLogic`, `generateExecutionId` |

### 6.3 Import/Export Patterns

```typescript
// Engine: default export = singleton instance
export class BuoyancyEngine implements IExperimentEngine { ... }
export default new BuoyancyEngine();

// Named exports for utilities
export { validateSchema, enrichSchema } from './schema-utils';
export type { ExperimentSchema, ParamDefinition } from './experiment-schema';

// Lib NEVER imports from app/ (enforced by lint but also convention)
// import { something } from '@/app/page';   // ❌ FORBIDDEN
// import { something } from '../app/page';  // ❌ FORBIDDEN
```

---

## 7. Code Signature Quick Reference

### 7.1 New Engine (Copy-Paste Template)

```typescript
import type { IExperimentEngine, ComputationResult, ValidationResult } from '../interface';

export class {Name}Engine implements IExperimentEngine {
  metadata = {
    id: '{subject}/{name}',
    subject: '{subject}',
    displayName: '{ChineseName}',
    description: '{OneSentence}',
    version: '1.0.0',
    capabilities: ['compute', 'validate'] as const,
    supportedElementTypes: ['rect', 'text'] as const,
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: ValidationResult['errors'] = [];
    // TODO: validation logic
    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    // TODO: computation logic
    return { values: {}, state: '', explanation: '' };
  }
}

export default new {Name}Engine();
```

### 7.2 New API Route (Copy-Paste Template)

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // TODO: validate body
    // TODO: process
    return NextResponse.json({ success: true, data: {} });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: '操作失败' }, { status: 500 });
  }
}
```

### 7.3 New Canvas Element Type (Checklist)

- [ ] Add to `ElementType` union in `experiment-schema.ts`
- [ ] Define interface: `interface NewElement extends BaseDrawElement { ... }`
- [ ] Add draw handler in `declarative-renderer.ts`
- [ ] Add to `optimized-renderer.ts` if >20 elements expected
- [ ] Add test in `schema-validator.test.ts`

---

## 8. Anti-Patterns (Code-Level)

| Anti-Pattern | Bad Code | Correct Code |
|-------------|----------|--------------|
| Hardcoded experiment in component | `switch(type) { case 'buoyancy': ... }` in `.tsx` | Define in `ExperimentSchema`, render via `declarative-renderer.ts` |
| Missing param aliases | `const rho = params.rho_object;` | `const rho = params.rho_object ?? params.objectDensity ?? 800;` |
| Inline Canvas API | `ctx.fillRect(...)` in React component | Route through `declarative-renderer.ts` draw handler |
| `any` for schema nodes | `const el: any = schema.canvas[0];` | Use `unknown` + type guard or narrow via `ElementType` |
| Direct state mutation | `execution.status = 'running';` without update | Call `updateExecution(execution)` to trigger persistence + events |
| Inline prompts in route | `const prompt = 'Generate...';` in `route.ts` | Put in `experiment-generation-prompts.ts` |

---

## 9. Testing Conventions

| Scope | File Pattern | Approach |
|-------|-------------|----------|
| Unit tests | `lib/__tests__/*.test.ts` | Jest + ts-jest, co-located by domain |
| Schema validation | `lib/__tests__/schema-validator.test.ts` | Edge cases: empty params, invalid formulas, null teaching |
| Physics engine | `lib/__tests__/physics-engine.test.ts` | Deterministic asserts: given input → exact output |
| Renderer | `lib/__tests__/declarative-renderer.test.ts` | Canvas draw-call snapshot compare |
| Workflow | `workflow/__tests__/engine.test.ts` | Lifecycle: create → start → pause → resume → cancel |

**Run**: `pnpm test` or `pnpm test:watch`

---

## 10. Dependency Notes

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 16.1.1 | Framework (App Router) |
| `react` | 19.2.3 | UI library |
| `typescript` | 5.9.3 | Type system |
| `tailwindcss` | 4 | Styling (CSS-first config, no `tailwind.config.js`) |
| `coze-coding-dev-sdk` | ^0.7.20 | LLM client |
| `zod` | ^4.3.5 | Schema validation (optional, used in some validators) |
| `jest` | ^30.3.0 | Testing |
| `ts-jest` | ^29.4.9 | TypeScript test transform |

**Package Manager**: `pnpm` (enforced via `only-allow` in `preinstall`)

---

## 11. Known Code-Level Gotchas

| Issue | Location | Mitigation |
|-------|----------|------------|
| Coze SDK path hardcoded | `api/generate/route.ts` `SKILL_DIR` | Use env var `SKILL_DIR` in production; mock in dev |
| No SSR on experiment pages | All `[id]/page.tsx` | Must use `'use client'`; Canvas does not support SSR |
| React 19 compatibility | `package.json` | Test new deps before adding; some libs not yet compatible |
| Workflow engine no persistence | `src/workflow/storage.ts` | Use `FileSystemStorage` or wire to external DB |
| Tailwind v4 CSS-first | `globals.css` | Customizations go in CSS variables, NOT `tailwind.config.js` |
