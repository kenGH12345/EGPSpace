# External Reference Policy

## Purpose

The `output/eureka-*.js` and `output/eureka-*.html` files are **behavior-observation artifacts** obtained by analyzing the public-facing UI of eurekafinder.com. They are used exclusively to understand the *behavior* and *UX patterns* of a reference product, NOT as source code to copy or adapt.

## What Is Allowed

- Reading these files to understand interaction patterns, physics formulas, and UX flows
- Using the *ideas* and *behavior patterns* as inspiration for our own original implementation
- Referencing parameter ranges (e.g. density min/max) that are grounded in physical reality

## What Is Prohibited

- Importing any `output/eureka-*` file into production source code (`src/`)
- Copying code blocks verbatim from these files into our codebase
- Distributing these files or including them in git history (they are `.gitignore`d)

## Enforcement

- ESLint rule `no-restricted-imports` in `eslint.config.mjs` blocks any `import` of `output/eureka-*` from `src/`
- `.gitignore` excludes `output/eureka-*.js` and `output/eureka-*.html` from version control

## Rationale

Our implementations (e.g. `experiment-dynamics.ts`, `ambient-animations.ts`) are original code written from scratch, informed only by the *behavioral specification* derived from observing the reference product's UI. This is analogous to clean-room reverse engineering of a public API's behavior.
