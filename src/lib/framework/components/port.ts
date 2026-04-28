/**
 * Port & Connection Types — Framework L0
 *
 * Port: a named connection point on a component (e.g. 'positive'/'negative' for a
 * battery, 'in'/'out' for a switch). Cross-domain: optics uses 'in'/'out' for light
 * rays; mechanics uses 'a'/'b' for force application points.
 *
 * Connection: an equipotential/equivalent link between two ports. Solvers typically
 * use Union-Find to collapse connected ports into a single "node".
 */

/**
 * Reference to a specific port on a specific component instance.
 * Used everywhere connections are declared.
 */
export interface PortRef {
  /** ID of the owning component. Must be unique within a DomainGraph. */
  componentId: string;
  /** Port name, matching one declared in ICircuitComponent.ports. */
  portName: string;
}

/**
 * A topological connection declaring "these two ports are the same node".
 * For circuit: equipotential; for optics: colinear ray path; for mechanics: rigid link.
 */
export interface Connection {
  id: string;
  from: PortRef;
  to: PortRef;
  /** Optional tag for domain-specific semantics (e.g. 'rigid'|'flexible' in mechanics). */
  kind?: string;
}

/** Build a PortRef with a readable toString for debugging. */
export function portRef(componentId: string, portName: string): PortRef {
  return { componentId, portName };
}

/** Deterministic key for maps/sets. */
export function portKey(p: PortRef): string {
  return `${p.componentId}#${p.portName}`;
}

/** Equality check. */
export function portEquals(a: PortRef, b: PortRef): boolean {
  return a.componentId === b.componentId && a.portName === b.portName;
}
