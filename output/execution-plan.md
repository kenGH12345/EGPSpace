# EGPSpace Batch-2 Execution Plan

> 架构：`output/architecture.md`  
> 需求：`output/requirement.md`  
> 会话：`wf-20260424111746.`  
> 范围：跨学科基础设施抽象 + 第二批4个物理实验模板

---

## 任务列表

### Phase 1: Infrastructure (Vertical Slice Validation)

| ID | Title | Description | Files | Dependencies | Acceptance Criteria |
|----|-------|-------------|-------|-------------|-------------------|
| T-1 | Create experiment-core.js | Extract cross-subject shared layer from physics-core.js: postMessage protocol, ready state machine, bindParam system, render loop management | `[NEW] public/templates/_shared/experiment-core.js` | — | 1. EurekaHost API 100% backward compatible with physics-core.js; 2. bindParam() auto-generates DOM sliders and manages events; 3. Declares protocol version v1.0 in ready message; 4. Single file <5KB gzip |
| T-2 | Create physics-utils.js | Physics-specific utilities: constants (g, π), formula library (mechanics/kinematics/waves/electromagnetism), Canvas rendering helpers | `[NEW] public/templates/_shared/physics-utils.js` | — | 1. Contains ≥12 physics formula functions; 2. All formulas have basic hand-written asserts; 3. Rendering helpers (drawArrow, drawAxis, drawEnergyBar) functional; 4. Single file <3KB gzip |
| T-7 | Motion prototype validation | Build a minimal viable motion template using T-1 and T-2 to validate cross-layer communication, parameter system, and render loop end-to-end | `[NEW] public/templates/physics/motion-prototype.html` | T-1, T-2 | 1. Host receives ready event after iframe full load; 2. Slider drag correctly updates template and reports result_update; 3. Pause/resume commands work; 4. Performance ≥30fps (Chrome DevTools) |

### Phase 2: Template Development (Parallel)

| ID | Title | Description | Files | Dependencies | Acceptance Criteria |
|----|-------|-------------|-------|-------------|-------------------|
| T-3 | Kinematics template | Complete kinematics experiment: velocity & acceleration visualization, v-t graph and s-t graph, adjustable initial velocity/acceleration/time | `[NEW] public/templates/physics/motion.html` | T-1, T-2 | 1. Two Canvas coordinate systems (v-t and s-t) correctly rendered; 2. Parameter ranges: velocity 0-50m/s, acceleration -10~10m/s², time 0-20s; 3. Real-time display of displacement, final velocity, average velocity; 4. Single file <30KB gzip |
| T-4 | Mechanical energy conservation template | Ball rolling down incline / pendulum swing, kinetic-potential-total energy bar charts updated in real-time | `[NEW] public/templates/physics/energy.html` | T-1, T-2 | 1. SVG ball animation smooth (≥30fps); 2. Energy bar chart with 3 colors (kinetic/potential/total); 3. Total energy conservation error <1%; 4. Single file <30KB gzip |
| T-5 | Mechanical wave template | Transverse wave propagation animation, adjustable amplitude/wavelength/frequency/wave speed, supports two-wave superposition | `[NEW] public/templates/physics/waves.html` | T-1, T-2 | 1. Sine wave propagates correctly (direction selectable); 2. Parameter ranges: amplitude 1-10cm, wavelength 0.1-1m, frequency 1-10Hz; 3. Superposition mode shows interference pattern; 4. Single file <35KB gzip |
| T-6 | Electromagnetic induction template | Faraday's law: magnet passing through coil, induced current magnitude/direction related to rate of magnetic flux change | `[NEW] public/templates/physics/electromagnetism.html` | T-1, T-2 | 1. SVG magnet + coil correctly rendered; 2. Magnetic flux Φ rate of change (dΦ/dt) calculated in real-time; 3. Induced current direction obeys Lenz's law; 4. Single file <30KB gzip |

### Phase 3: Integration & Audit

| ID | Title | Description | Files | Dependencies | Acceptance Criteria |
|----|-------|-------------|-------|-------------|-------------------|
| T-8 | Registry expansion | Add metadata for 4 new templates in template-registry.ts | `[MOD] src/lib/template-registry.ts` | T-3, T-4, T-5, T-6 | 1. 4 new template metadata entries complete; 2. auditStatus initialized as 'pending'; 3. REGISTRY total = 8 (old 4 + new 4) |
| T-9 | Concept router expansion | Add batch-2 keyword mappings in concept-to-template.ts | `[MOD] src/lib/concept-to-template.ts` | T-8 | 1. ≥16 new keyword mappings (4 per template); 2. No keyword conflicts (first batch 16 words unchanged); 3. isApprovedTemplate() correctly rejects unapproved templates |
| T-10 | Kinematics audit | Write docs/audits/physics-motion.md for physics/motion template | `[NEW] docs/audits/physics-motion.md` | T-3 | 1. Passes common-sense audit (physical correctness, unit consistency, parameter range validity); 2. Passes security audit (CSP compliant, no eval/setTimeout-string, no inline event handlers); 3. Passes visual effect acceptance (BTW ≥0.90) |
| T-11 | Energy audit | Write docs/audits/physics-energy.md for physics/energy template | `[NEW] docs/audits/physics-energy.md` | T-4 | Same criteria as T-10 |
| T-12 | Wave audit | Write docs/audits/physics-waves.md for physics/waves template | `[NEW] docs/audits/physics-waves.md` | T-5 | Same criteria as T-10 |
| T-13 | Electromagnetism audit | Write docs/audits/physics-electromagnetism.md for physics/electromagnetism template | `[NEW] docs/audits/physics-electromagnetism.md` | T-6 | Same criteria as T-10 |
| T-14 | Backward compatibility verification | Verify 4 old templates still work correctly under new shared layer | `[NO file changes, verification only]` | T-1 | 1. Buoyancy template parameter sliders work; 2. Lever template torque calculations correct; 3. Refraction template angle updates in real-time; 4. Circuit template switch controls functional |

---

## Dependencies

| From | To | Type |
|------|----|------|
| T-1 | T-7 | required |
| T-2 | T-7 | required |
| T-1 | T-3 | required |
| T-1 | T-4 | required |
| T-1 | T-5 | required |
| T-1 | T-6 | required |
| T-2 | T-3 | required |
| T-2 | T-4 | required |
| T-2 | T-5 | required |
| T-2 | T-6 | required |
| T-7 | T-3 | validation |
| T-3 | T-8 | required |
| T-4 | T-8 | required |
| T-5 | T-8 | required |
| T-6 | T-8 | required |
| T-3 | T-10 | required |
| T-4 | T-11 | required |
| T-5 | T-12 | required |
| T-6 | T-13 | required |
| T-8 | T-9 | required |
| T-1 | T-14 | auxiliary |
| T-3 | T-14 | auxiliary |

---

## Phases

| # | Name | Tasks | Deliverable | Duration Estimate |
|---|------|-------|-------------|-------------------|
| 1 | Infrastructure Validation | T-1, T-2, T-7 | experiment-core.js + physics-utils.js + working prototype | 1 session |
| 2 | Template Development | T-3, T-4, T-5, T-6 | 4 new HTML templates (parallel) | 1-2 sessions |
| 3 | Integration & Audit | T-8, T-9, T-10, T-11, T-12, T-13, T-14 | Registry updated, 4 audit docs, backward compat verified | 1 session |

---

## Module Grouping

| Module | Tasks | Files |
|--------|-------|-------|
| Shared Infrastructure | T-1, T-2, T-14 | `public/templates/_shared/experiment-core.js`, `public/templates/_shared/physics-utils.js` |
| Experiment Templates | T-3, T-4, T-5, T-6, T-7 | `public/templates/physics/*.html` |
| Triple-Lock Integration | T-8, T-9 | `src/lib/template-registry.ts`, `src/lib/concept-to-template.ts` |
| Quality Assurance | T-10, T-11, T-12, T-13 | `docs/audits/physics-*.md` |
