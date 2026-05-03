/**
 * macro-resolver — thin factory that wraps EditorState.macros as a
 * MacroResolver consumable by SpecFlattener.
 *
 * Pure function, zero React, zero state mutation.
 */

import type { MacroDefinition, MacroResolver } from '@/lib/framework/macro/flattener';

const MACRO_KIND_PREFIX = 'macro:';

/**
 * Build a MacroResolver from a macros map.
 * Only resolves kinds that start with "macro:" — atomic kinds fall through to
 * undefined, which SpecFlattener interprets as "leave as leaf component".
 */
export function makeResolverFromState(
  macros: Readonly<Record<string, MacroDefinition>>,
): MacroResolver {
  return {
    resolve(kind: string): MacroDefinition | undefined {
      if (!kind.startsWith(MACRO_KIND_PREFIX)) return undefined;
      return macros[kind];
    },
  };
}

/** True when at least one component in the spec references a macro kind. */
export function specReferencesMacros(components: ReadonlyArray<{ kind: string }>): boolean {
  for (const c of components) {
    if (c.kind.startsWith(MACRO_KIND_PREFIX)) return true;
  }
  return false;
}
