/**
 * Engine Registry — Central dispatch for all experiment engines
 *
 * Pattern: Registry + lazy-loading plugins.
 * Engines register themselves at import time via registerEngine().
 * The registry is a singleton used by the experiment controller to
 * look up compute/validate/render for any physicsType.
 *
 * Decisions:
 * - Singleton via module-level export (simple, no DI container needed)
 * - Lazy loading: engines imported only when first get() is called
 * - Type-safe: get() returns IExperimentEngine | undefined
 */

import type { IExperimentEngine, EngineMetadata } from './interface';
import type { PhysicsEngineType } from '../experiment-schema';

interface RegistryEntry {
  engine: IExperimentEngine;
  metadata: EngineMetadata;
  // Lazy-loaded flag: true = the engine module has been imported
  loaded: boolean;
}

export class EngineRegistry {
  private engines: Map<string, RegistryEntry> = new Map();
  private lazyLoaders: Map<string, () => Promise<IExperimentEngine>> = new Map();

  /** Register an engine directly (for statically imported engines). */
  register(engine: IExperimentEngine): void {
    const id = engine.metadata.id;
    if (this.engines.has(id)) {
      console.warn(`[EngineRegistry] Engine "${id}" already registered. Overwriting.`);
    }
    this.engines.set(id, { engine, metadata: engine.metadata, loaded: true });
  }

  /**
   * Register a lazy loader.
   * The engine module is imported only on first get() — reduces initial bundle size.
   *
   * @example
   * registry.registerLazy('chemistry/titration', () => import('./chemistry/titration').then(m => m.default));
   */
  registerLazy(id: string, loader: () => Promise<IExperimentEngine>): void {
    this.lazyLoaders.set(id, async () => loader());
  }

  /**
   * Get an engine by its type string (maps to metadata.id).
   * Supports async auto-loading for lazy-registered engines.
   */
  async get(id: string): Promise<IExperimentEngine | undefined> {
    const entry = this.engines.get(id);
    if (entry) return entry.engine;

    const loader = this.lazyLoaders.get(id);
    if (loader) {
      const engine = await loader();
      this.engines.set(id, { engine, metadata: engine.metadata, loaded: true });
      this.lazyLoaders.delete(id);
      return engine;
    }

    console.warn(`[EngineRegistry] Engine "${id}" not found. Available: ${this.list().join(', ')}`);
    return undefined;
  }

  /** Synchronous get — only works if already loaded. */
  getSync(id: string): IExperimentEngine | undefined {
    return this.engines.get(id)?.engine;
  }

  /** Check if an engine is registered (loaded or lazy). */
  has(id: string): boolean {
    return this.engines.has(id) || this.lazyLoaders.has(id);
  }

  /** List all registered engine IDs. */
  list(): string[] {
    return Array.from(this.engines.keys());
  }

  /** List engines by subject. */
  listBySubject(subject: string): IExperimentEngine[] {
    return Array.from(this.engines.values())
      .filter(e => e.metadata.subject === subject)
      .map(e => e.engine);
  }

  /** Get all metadata for UI listing (cards, dropdowns). */
  getAllMetadata(): EngineMetadata[] {
    return Array.from(this.engines.values()).map(e => e.metadata);
  }

  /** Get a single engine's metadata. */
  getMetadata(id: string): EngineMetadata | undefined {
    return this.engines.get(id)?.metadata;
  }

  /** Remove an engine (for hot-reloading in dev). */
  unregister(id: string): boolean {
    return this.engines.delete(id) || this.lazyLoaders.delete(id);
  }

  /** Reset registry (primarily for testing). */
  clear(): void {
    this.engines.clear();
    this.lazyLoaders.clear();
  }
}

/** Singleton registry instance. */
export const registry = new EngineRegistry();

// ============================================================================
// Convenience helpers
// ============================================================================

/**
 * Map a physicsType enum value to a registered engine ID.
 * Supports both old physics-only naming and new multi-subject naming.
 */
export function engineIdFromType(type: PhysicsEngineType): string {
  const mapping: Record<string, string> = {
    // Physics
    buoyancy: 'physics/buoyancy',
    lever: 'physics/lever',
    refraction: 'physics/refraction',
    circuit: 'physics/circuit',
    pendulum: 'physics/pendulum',
    wave: 'physics/wave',
    // Chemistry
    acid_base: 'chemistry/acid-base',
    titration: 'chemistry/titration',
    electrolysis: 'chemistry/electrolysis',
    reaction_rate: 'chemistry/reaction-rate',
    combustion_conditions: 'chemistry/combustion-conditions',
    iron_rusting: 'chemistry/iron-rusting',
    // Biology
    osmosis: 'biology/osmosis',
    enzyme: 'biology/enzyme',
    population: 'biology/population',
    photosynthesis: 'biology/photosynthesis',
    // Math
    function_graph: 'math/function-graph',
    geometry: 'math/geometry',
    probability: 'math/probability',
    statistics: 'math/statistics',
    // Generic fallback
    generic: 'generic/generic',
  };

  return mapping[type] || `generic/${type}`;
}

/**
 * Get engine from a physicsType value.
 * Returns undefined if no engine is registered for this type.
 */
export async function getEngineByType(type: PhysicsEngineType): Promise<IExperimentEngine | undefined> {
  const id = engineIdFromType(type);
  return registry.get(id);
}
