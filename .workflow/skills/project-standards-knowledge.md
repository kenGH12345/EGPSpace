---
name: EGPSpace Skill Knowledge
version: 1.0.0
type: project-knowledge
description: |
  Unified project knowledge skill for EGPSpace — fused from 1 source(s): skill-discovery. Covers conventions, architecture patterns, and reusable components discovered through static analysis.
domains: [egpspace, project-knowledge]
triggers:
  keywords:
    - egpspace
    - EGPSpace
    - skill-discovery
    - project-knowledge
  roles:
    - developer
    - architect
load_level: session
max_tokens: 1200
generatedAt: 2026-05-03T09:07:48.377Z
project: egpspace
sources:
  - skill-discovery
deprecated: false
---

## Conventions

<!-- LLM_SKIPPED: rule-only fallback, no LLM refinement -->

## Coding Standards
- **Progress display (MANDATORY)**: During workflow execution, you MUST show progress at every stage transition: _(from AGENTS.md)_
- ALL `/wf` messages MUST go through the full 7-stage workflow (STEP 1~7), regardless of `--input-type`. _(from AGENTS.md)_
- ✅ Still call `workflow-stage` and `stage-complete` — the log chain MUST be complete _(from AGENTS.md)_
- ❌ DO NOT fabricate tasks, components, or acceptance criteria to fill the artifact _(from AGENTS.md)_
- ❌ DO NOT generate 3 tasks and 5 ACs for a typo fix — this is hallucination, not quality _(from AGENTS.md)_
- ESLint is configured (eslint.config.mjs) _(from eslint.config.mjs)_

## Naming Conventions
_No conventions detected._

## Directory Structure
- Project has documented directory structure in AGENTS.md _(from AGENTS.md)_
- Top-level directories: analysis, assets, coverage, docs, experiment-design-skill, physics-experiment-design, public, scripts, src, tests _(from directory-scan)_

## Toolchain
- npm script "build": bash ./scripts/build.sh _(from package.json)_
- npm script "dev": bash ./scripts/dev.sh _(from package.json)_
- npm script "lint": eslint _(from package.json)_
- npm script "start": bash ./scripts/start.sh _(from package.json)_
- npm script "test": jest _(from package.json)_
- Engine constraint: pnpm >=9.0.0 _(from package.json)_
- Jest is the test framework _(from jest.config.js)_

## Commit Conventions
_No conventions detected._