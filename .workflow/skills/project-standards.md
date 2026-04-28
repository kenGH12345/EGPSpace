---
name: project-standards
version: 1.0.0
type: standards
domains: [standards, conventions, project]
dependencies: []
load_level: project
max_tokens: 1200
triggers:
  keywords: [standard, convention, style, lint, format, naming, structure]
  roles: [analyst, architect, developer, reviewer]
description: "Auto-discovered project conventions, coding standards, and toolchain configuration"
auto_discovered: true
discovery_signals: 15
discovery_method: rule-scan-only
---

# Skill: project-standards

> **Version**: 1.0.0
> **Description**: Auto-discovered project conventions, coding standards, and toolchain configuration
> **Domains**: standards, conventions, project
> **Auto-discovered**: ✅ (15 signals, method: rule-scan only)

---

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
- Top-level directories: analysis, assets, coverage, docs, experiment-design-skill, physics-experiment-design, public, scripts, src _(from directory-scan)_

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


## Evolution History

| Version | Date | Change |
|---------|------|--------|
| v1.0.0 | 2026-04-28 | Auto-discovered from project config files |