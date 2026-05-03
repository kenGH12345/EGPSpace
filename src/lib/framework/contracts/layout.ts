/**
 * LayoutSpec — visual-only companion to AssemblySpec.
 *
 * Design (D-1, D-2):
 *   - AssemblySpec captures topology and domain logic (what components exist,
 *     what connections between them).
 *   - LayoutSpec captures visual placement only (where each component renders).
 *   - They are sibling data structures, never nested. This lets solvers and
 *     engines consume only the AssemblySpec while renderers/editors consume both.
 *
 * Why separate?
 *   - Engine hash stability: user drags a component → anchor changes → Spec
 *     hash unchanged → no compute invalidation
 *   - Editor-friendly: the editor (future) can save/restore LayoutSpec without
 *     touching business logic
 *   - JSON-safe: LayoutSpec serialises independently for persistence
 *
 * ⚠️ `LayoutSpec` and `LayoutEntry` must NOT reference AssemblySpec (enforced
 * by AC-D1). The two types are intentionally decoupled at the type level.
 *
 * NOTE (E 阶段): `AssemblyBundle` is the organisational layer — it's fine for
 * it to reference `AssemblySpec<D>` directly (see L108 comment). This does NOT
 * violate AC-D1 which only constrains LayoutSpec itself.
 */

import type { ComponentDomain, ComponentAnchor } from './component';
import type { AssemblySpec } from './assembly';

// ── LayoutEntry ───────────────────────────────────────────────────────────

/**
 * A single placement binding: "component X sits at anchor Y on the canvas".
 * Domain labels are carried by the parent LayoutSpec, not individual entries.
 */
export interface LayoutEntry {
  /** References AssemblySpec.components[i].id. Soft-referential: renderer tolerates dangling entries. */
  componentId: string;
  /** Where the component is placed on the canvas. */
  anchor: ComponentAnchor;
}

// ── LayoutSpec ────────────────────────────────────────────────────────────

/**
 * Optional metadata carried by a LayoutSpec. Separate from AssemblyMetadata so
 * the two specs can evolve independently.
 */
export interface LayoutMetadata {
  /** Human-readable name of this layout (e.g. "default", "mobile"). */
  name?: string;
  /** Optional grid size hint for editors snapping to a grid. */
  gridSizePx?: number;
  /** Canvas bounds hint for editors. */
  canvasSize?: { width: number; height: number };
}

/**
 * Top-level LayoutSpec: a flat list of anchor bindings for a given domain.
 * Fully serialisable (JSON.stringify-safe).
 */
export interface LayoutSpec<D extends ComponentDomain = ComponentDomain> {
  domain: D;
  entries: LayoutEntry[];
  metadata?: LayoutMetadata;
}

/**
 * Runtime type guard. Checks shape only; does NOT validate that entries
 * reference real components (that would require an AssemblySpec context).
 */
export function isLayoutSpec(value: unknown): value is LayoutSpec {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (typeof v.domain !== 'string') return false;
  if (!Array.isArray(v.entries)) return false;
  return v.entries.every((e) => {
    if (!e || typeof e !== 'object') return false;
    const ee = e as Record<string, unknown>;
    return typeof ee.componentId === 'string' && !!ee.anchor && typeof ee.anchor === 'object';
  });
}

/**
 * Create an empty LayoutSpec for a given domain. Used by FluentAssembly
 * constructor and by callers that want to start fresh.
 */
export function emptyLayout<D extends ComponentDomain>(domain: D): LayoutSpec<D> {
  return { domain, entries: [] };
}

/**
 * Build an O(1) lookup Map from a LayoutSpec. Does NOT mutate the input.
 * If the same componentId appears multiple times (pathological input),
 * the last occurrence wins — matching Builder's "last write wins" semantic.
 */
export function layoutLookup<D extends ComponentDomain>(
  layout: LayoutSpec<D>,
): Map<string, ComponentAnchor> {
  const map = new Map<string, ComponentAnchor>();
  for (const e of layout.entries) {
    map.set(e.componentId, e.anchor);
  }
  return map;
}

// ── AssemblyBundle ────────────────────────────────────────────────────────

export interface MacroPortRef {
  componentId: string;
  portName: string;
}

export type MacroExportPortMap = Record<string, MacroPortRef>;

/**
 * A user-defined macro ("custom component") — reusable subgraph that can be
 * referenced by `kind` in a parent AssemblySpec. The SpecFlattener expands
 * every macro kind into its inner components at engine-run time.
 *
 * Defined at the contracts layer (not in macro/flattener.ts) so that
 * AssemblyBundle can reference it without creating a contracts ↔ macro import
 * cycle — both Bundle persistence and the flattener share this single type.
 *
 *   - spec: inner components + internal connections (domain-typed sub-graph)
 *   - exportPortMap: maps external port names (the "black-box face" of the
 *     macro) to structured internal port references.
 *     Example: { IN: { componentId: 'r1', portName: 'a' } }
 */
export interface MacroDefinition<D extends ComponentDomain = ComponentDomain> {
  spec: AssemblySpec<D>;
  exportPortMap: MacroExportPortMap;
}

/**
 * Optional organising container that carries both an AssemblySpec and a
 * LayoutSpec together. Useful for persistence (save the whole experiment state)
 * and for future editor workflows.
 *
 * ⚠️ This type references AssemblySpec via a structural type import, kept
 * deliberately narrow to avoid breaking AC-D1 (LayoutSpec file independence).
 * AssemblyBundle is the organisational layer — it's fine for it to see both.
 *
 * Use `assembleBundle({spec, layout})` on Assembler to build a graph from a bundle.
 *
 * The optional `macros` field persists user-defined macros alongside the
 * topology so that loading a bundle fully restores the "我的元件" palette
 * entries. Old bundles without this field load as `{}` (see loadBundle reducer).
 */
export interface AssemblyBundle<D extends ComponentDomain = ComponentDomain> {
  spec: AssemblySpec<D>;
  layout?: LayoutSpec<D>;
  metadata?: Record<string, unknown>;
  macros?: Record<string, MacroDefinition>;
}

/**
 * Runtime type guard for AssemblyBundle. Checks that spec exists and is object;
 * delegates layout shape to isLayoutSpec when present. `macros` is tolerated
 * as either absent or any object shape (defensive — downstream code treats
 * malformed entries as missing).
 */
export function isAssemblyBundle(value: unknown): value is AssemblyBundle {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  if (!v.spec || typeof v.spec !== 'object') return false;
  if (v.layout !== undefined && !isLayoutSpec(v.layout)) return false;
  if (v.macros !== undefined && (typeof v.macros !== 'object' || v.macros === null)) return false;
  return true;
}
