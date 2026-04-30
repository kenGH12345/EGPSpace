/**
 * migration.spec.ts — Smoke tests for 4 migrated templates (G 阶段 W5).
 *
 * These 4 templates were migrated from physics-core.js to experiment-core.js
 * in W4. This suite is the R-G5 guard: it catches any regression caused by
 * the foundation unification (e.g. EurekaCanvas/EurekaHints reference errors,
 * missing globals, changed initialization order).
 *
 * Unlike compute.spec.ts (which tests the compute RPC chain), this suite
 * tests plain rendering — the experiments do local computation, no host RPC.
 *
 * Run locally:  npx playwright test tests/e2e/iframe-smoke/migration.spec.ts
 */
import { test } from '@playwright/test';
import { iframeSmokeCheck } from './iframe-helpers';

const MIGRATED_EXPERIMENTS = [
  { path: '/experiments/physics/friction',                 name: 'migration-physics-friction' },
  { path: '/experiments/physics/pressure',                 name: 'migration-physics-pressure' },
  { path: '/experiments/physics/refraction',               name: 'migration-physics-refraction' },
  { path: '/experiments/chemistry/combustion-conditions',  name: 'migration-chemistry-combustion-conditions' },
];

for (const exp of MIGRATED_EXPERIMENTS) {
  test(`migration smoke · ${exp.name}`, async ({ page }) => {
    const errors = await iframeSmokeCheck(page, {
      path: exp.path,
      name: exp.name,
    });
    // Critical signal: any ReferenceError for Eureka* globals means the
    // migration broke this template. Do NOT filter those.
    const criticalErrors = errors.filter(
      (e) =>
        /ReferenceError|is not defined|EurekaCanvas|EurekaHints|EurekaFormat|EurekaHost/i.test(e),
    );
    if (criticalErrors.length > 0) {
      throw new Error(
        `R-G5 regression: migration broke ${exp.name}:\n${criticalErrors.join('\n')}`,
      );
    }
    // Other minor errors also fail (conservative)
    const other = errors.filter(
      (e) => !/favicon|ResizeObserver|DevTools|Download the React DevTools/i.test(e),
    );
    if (other.length > 0) {
      throw new Error(`Console errors in ${exp.name}:\n${other.join('\n')}`);
    }
  });
}
