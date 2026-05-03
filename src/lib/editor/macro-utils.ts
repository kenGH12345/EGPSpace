/**
 * macro-utils — pure helpers for component encapsulation.
 *
 * These functions are extracted from the encapsulateSelection reducer (T-5) so
 * that the complex boundary-connection classification logic can be unit-tested
 * independently of state-mutation concerns.
 *
 * Zero React. Zero I/O. Zero state mutation.
 */

import type { ConnectionDecl, SpecPortRef, MacroExportPortMap } from '@/lib/framework';
import { macroPortRefKey } from '@/lib/framework';

/** Three-way classification of a connection relative to a selected component set. */
export interface ConnectionClassification {
  /** Both endpoints are inside the selected set. Stays inside the macro. */
  internal: ConnectionDecl[];
  /** Exactly one endpoint is inside — the macro needs to export this as a port. */
  boundary: ConnectionDecl[];
  /** Neither endpoint is inside — untouched by encapsulation. */
  external: ConnectionDecl[];
}

/**
 * Split a connection list into internal/boundary/external buckets relative to
 * a selected component id set.
 *
 * Why this matters:
 *   - `internal` connections become part of the MacroDefinition.spec.connections
 *   - `boundary` connections need their "inside" endpoint rewritten to the new
 *     composite instance's exported port (see remapBoundaryToComposite)
 *   - `external` connections survive untouched
 */
export function classifyConnections(
  selectedIds: ReadonlySet<string>,
  connections: readonly ConnectionDecl[],
): ConnectionClassification {
  const internal: ConnectionDecl[] = [];
  const boundary: ConnectionDecl[] = [];
  const external: ConnectionDecl[] = [];

  for (const conn of connections) {
    const fromIn = selectedIds.has(conn.from.componentId);
    const toIn = selectedIds.has(conn.to.componentId);
    if (fromIn && toIn) internal.push(conn);
    else if (fromIn || toIn) boundary.push(conn);
    else external.push(conn);
  }

  return { internal, boundary, external };
}

/**
 * Remap the "inside" endpoint of a boundary connection to point at the new
 * composite instance's exported port.
 *
 * @param conn            The original boundary connection.
 * @param selectedIds     The set of component ids that were encapsulated.
 * @param compositeId     The id of the newly placed composite instance.
 * @param portMap         exportPortMap inverted: internal port key → "ExtPortName"
 *
 * Returns a new ConnectionDecl whose inside endpoint has been replaced with
 * { componentId: compositeId, portName: ExtPortName }. If the inside endpoint
 * has no entry in `portMap` (should never happen if exportPortMap was generated
 * correctly from the boundary set), throws to surface the bug loudly.
 */
export function remapBoundaryToComposite(
  conn: ConnectionDecl,
  selectedIds: ReadonlySet<string>,
  compositeId: string,
  portMap: Record<string, string>,
): ConnectionDecl {
  const fromIn = selectedIds.has(conn.from.componentId);
  const toIn = selectedIds.has(conn.to.componentId);

  if (fromIn && toIn) {
    throw new Error('remapBoundaryToComposite: connection is internal, not boundary');
  }
  if (!fromIn && !toIn) {
    throw new Error('remapBoundaryToComposite: connection is external, not boundary');
  }

  const rewriteInside = (ref: SpecPortRef): SpecPortRef => {
    const key = macroPortRefKey(ref);
    const extName = portMap[key];
    if (!extName) {
      throw new Error(
        `remapBoundaryToComposite: inside endpoint "${key}" has no exported port name`,
      );
    }
    return { componentId: compositeId, portName: extName };
  };

  return {
    from: fromIn ? rewriteInside(conn.from) : { ...conn.from },
    to: toIn ? rewriteInside(conn.to) : { ...conn.to },
    kind: conn.kind,
  };
}

/**
 * Build the default exportPortMap for a selected subset, using the boundary
 * connections as the signal for "which inner ports must be exposed".
 *
 * Each inner port that appears as the "inside" endpoint of a boundary
 * connection becomes an exported port. The generated external port name is
 * "<innerCompId>_<innerPort>" (stable, predictable, user can rename in the
 * encapsulate dialog).
 *
 * Returns both the forward map (external → structured internal port ref, the
 * shape MacroDefinition.exportPortMap expects) and the inverse map (internal
 * port key → external, used by remapBoundaryToComposite).
 */
export function buildDefaultExportPortMap(
  selectedIds: ReadonlySet<string>,
  boundaryConnections: readonly ConnectionDecl[],
): { exportPortMap: MacroExportPortMap; inverseMap: Record<string, string> } {
  const exportPortMap: MacroExportPortMap = {};
  const inverseMap: Record<string, string> = {};
  const seenInsideKeys = new Set<string>();

  for (const conn of boundaryConnections) {
    const inside = selectedIds.has(conn.from.componentId) ? conn.from : conn.to;
    const insideKey = macroPortRefKey(inside);
    if (seenInsideKeys.has(insideKey)) continue;
    seenInsideKeys.add(insideKey);

    const extName = `${inside.componentId}_${inside.portName}`;
    exportPortMap[extName] = { componentId: inside.componentId, portName: inside.portName };
    inverseMap[insideKey] = extName;
  }

  return { exportPortMap, inverseMap };
}
