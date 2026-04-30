/**
 * compute.spec.ts — Smoke tests for the 4 iframe experiments that use the
 * compute RPC (requestCompute → host-side engine → compute_result).
 *
 * These 4 experiments share the `experiment-core.js` foundation and depend on
 * the auto-attached compute listener (fixed in 80ce8f8). Without that listener,
 * they would show "timeout waiting for host response". This suite ensures
 * the RPC chain stays healthy across future changes.
 *
 * Run locally:  npm run test:e2e
 * Run single:   npx playwright test tests/e2e/iframe-smoke/compute.spec.ts
 */
import { test } from '@playwright/test';
import { iframeSmokeCheck } from './iframe-helpers';

const COMPUTE_EXPERIMENTS = [
  { path: '/experiments/physics/circuit',                   name: 'physics-circuit' },
  { path: '/experiments/physics/buoyancy',                  name: 'physics-buoyancy' },
  { path: '/experiments/chemistry/acid-base-titration',     name: 'chemistry-acid-base-titration' },
  { path: '/experiments/chemistry/metal-acid-reaction',     name: 'chemistry-metal-acid-reaction' },
];

for (const exp of COMPUTE_EXPERIMENTS) {
  test(`compute smoke · ${exp.name}`, async ({ page }) => {
    const errors = await iframeSmokeCheck(page, {
      path: exp.path,
      name: exp.name,
    });
    // Filter out benign noise (React dev warnings, font loading, etc.)
    const real = errors.filter(
      (e) => !/favicon|ResizeObserver|DevTools|Download the React DevTools/i.test(e),
    );
    if (real.length > 0) {
      throw new Error(`Console errors detected in ${exp.name}:\n${real.join('\n')}`);
    }
  });
}
