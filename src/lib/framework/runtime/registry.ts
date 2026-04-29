/**
 * ComponentRegistry — cross-domain factory for reconstructing components from DTOs.
 *
 * Each domain module registers a factory function per ComponentKind at module load.
 * Used by:
 *  - DTO → live instance deserialization (postMessage receive path)
 *  - InteractionEngine spawning new components by kind
 *  - Future: LLM-generated component lists instantiated by name
 *
 * This is the single lookup path that lets "a bulb created by domain X" be visible
 * to "domain Y" — enabling the cross-domain reuse requirement (AC-4).
 */

import type { IExperimentComponent, ComponentDTO, ComponentDomain, ComponentKind } from '../contracts/component';

export type ComponentFactory = (dto: ComponentDTO) => IExperimentComponent;

interface RegistryKey {
  domain: ComponentDomain;
  kind: ComponentKind;
}

function keyOf(k: RegistryKey): string {
  return `${k.domain}/${k.kind}`;
}

class ComponentRegistryImpl {
  private factories = new Map<string, ComponentFactory>();

  register(domain: ComponentDomain, kind: ComponentKind, factory: ComponentFactory): void {
    const k = keyOf({ domain, kind });
    if (this.factories.has(k)) {
      // Non-fatal: overwriting allows hot reload in dev.
      // eslint-disable-next-line no-console
      console.warn(`[ComponentRegistry] overriding factory for "${k}"`);
    }
    this.factories.set(k, factory);
  }

  has(domain: ComponentDomain, kind: ComponentKind): boolean {
    return this.factories.has(keyOf({ domain, kind }));
  }

  /** Instantiate a live component from a plain DTO. */
  create(dto: ComponentDTO): IExperimentComponent {
    const k = keyOf({ domain: dto.domain, kind: dto.kind });
    const f = this.factories.get(k);
    if (!f) {
      throw new Error(`ComponentRegistry: no factory registered for "${k}"`);
    }
    return f(dto);
  }

  /** Enumerate all registered kinds (useful for docs / diagnostics). */
  list(): Array<{ domain: ComponentDomain; kind: ComponentKind }> {
    return [...this.factories.keys()].map((k) => {
      const [domain, kind] = k.split('/') as [ComponentDomain, ComponentKind];
      return { domain, kind };
    });
  }

  clear(): void {
    this.factories.clear();
  }
}

/** Singleton registry. Import and register from every domain's index.ts. */
export const componentRegistry = new ComponentRegistryImpl();
