/**
 * engine-dispatch — dynamic per-domain engine loading.
 *
 * Design (D-5):
 *   Editor doesn't hard-import CircuitEngine / ChemistryReactionEngine.
 *   Each domain contributes a loader in the registry below; loaders are
 *   async so that Next.js can code-split them.
 */

import type { AssemblyBundle, ComponentDomain } from '@/lib/framework';

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
 * Never throws — always returns a result object.
 */
export async function runEditorBundle<D extends ComponentDomain>(
  domain: D,
  bundle: AssemblyBundle<D>,
): Promise<RunBundleResult> {
  const loader = ENGINE_LOADERS[domain];
  if (!loader) {
    return { ok: false, error: `no engine registered for domain "${domain}"` };
  }
  try {
    const engine = await loader();
    const result = engine.compute({ graph: bundle.spec });
    return { ok: true, result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
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
