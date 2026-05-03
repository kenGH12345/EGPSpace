/**
 * engine-dispatch — dynamic per-domain engine loading.
 *
 * Design (D-5):
 *   Editor doesn't hard-import CircuitEngine / ChemistryReactionEngine.
 *   Each domain contributes a loader in the registry below; loaders are
 *   async so that Next.js can code-split them.
 */

import type { AssemblyBundle, ComponentDomain, AssemblySpec } from '@/lib/framework';
import { SpecFlattener, type MacroDefinition } from '@/lib/framework/macro/flattener';
import { makeResolverFromState, specReferencesMacros } from './macro-resolver';

/** Generic shape returned by any engine.compute(). */
export interface EngineComputeResult {
  state: string;
  values: Record<string, unknown>;
  explanation?: string;
}

export interface RunBundleResult {
  ok: boolean;
  result?: EngineComputeResult;
  error?: string;
  /**
   * Phase at which failure occurred (when ok === false). Exposed for diagnostics.
   * - "flatten": macro expansion failed (circular dep, missing port, etc.)
   * - "compute": engine-side failure
   */
  failedPhase?: 'flatten' | 'compute';
}

/** Registry of per-domain dynamic engine loaders. */
const ENGINE_LOADERS: Partial<Record<
  ComponentDomain,
  () => Promise<{ compute: (input: Record<string, unknown>) => EngineComputeResult }>
>> = {
  circuit: async () => {
    const mod = await import('@/lib/engines/physics/circuit');
    return new mod.CircuitEngine() as unknown as {
      compute: (input: Record<string, unknown>) => EngineComputeResult;
    };
  },
  chemistry: async () => {
    const mod = await import('@/lib/engines/chemistry/reaction');
    return new mod.ChemistryReactionEngine() as unknown as {
      compute: (input: Record<string, unknown>) => EngineComputeResult;
    };
  },
};

/**
 * Run an AssemblyBundle through the appropriate engine.
 *
 * When `macros` is provided and the bundle's spec (or any nested spec) references
 * a macro kind, SpecFlattener is invoked to expand all macros into atomic
 * components before engines see the spec. Engines remain macro-unaware.
 *
 * Zero-overhead short-circuit: when no macro is referenced, `finalSpec` is the
 * same reference as `bundle.spec` — no allocation, no flatten pass.
 *
 * Never throws — always returns a result object.
 */
export async function runEditorBundle<D extends ComponentDomain>(
  domain: D,
  bundle: AssemblyBundle<D>,
  macros?: Readonly<Record<string, MacroDefinition>>,
): Promise<RunBundleResult> {
  const loader = ENGINE_LOADERS[domain];
  if (!loader) {
    return { ok: false, error: `no engine registered for domain "${domain}"` };
  }

  let finalSpec: AssemblySpec = bundle.spec;
  const hasMacros =
    (macros && Object.keys(macros).length > 0) ||
    specReferencesMacros(bundle.spec.components);

  if (hasMacros) {
    try {
      const resolver = makeResolverFromState(macros ?? {});
      finalSpec = new SpecFlattener(resolver).flatten(bundle.spec);
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        failedPhase: 'flatten',
      };
    }
  }

  try {
    const engine = await loader();
    const result = engine.compute({ graph: finalSpec });
    return { ok: true, result };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : String(e),
      failedPhase: 'compute',
    };
  }
}

/**
 * Extract a per-component values map from the engine result, if available.
 * Returns {} when absent.
 */
export function extractPerComponent(result: EngineComputeResult): Record<string, Record<string, unknown>> {
  const v = result.values;
  const perC = v.perComponent;
  if (perC && typeof perC === 'object') {
    return perC as Record<string, Record<string, unknown>>;
  }
  return {};
}
