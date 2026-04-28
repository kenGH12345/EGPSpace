/**
 * AssemblyValidator — three-layer check on an AssemblySpec.
 *
 *   Layer 1: structural shape (isAssemblySpec)
 *   Layer 2: intra-spec referential integrity
 *             - unique component ids
 *             - connection's from/to reference existing component ids
 *             - no self-connection
 *   Layer 3: domain-agnostic port-name soundness
 *             - requires caller-supplied portsOf(kind) → string[] to check port names exist
 *             - if portsOf not provided, layer 3 is skipped (checker is still useful for layers 1-2)
 *
 * Layer 3 intentionally takes a callback instead of importing componentRegistry
 * to keep this file zero-dependency on any specific domain (AC-A).
 */

import type { AssemblySpec } from './spec';
import { isAssemblySpec } from './spec';
import type { AssemblyError, AssemblyValidationResult } from './errors';
import { makeError } from './errors';

/** Optional ports lookup: kind → list of valid port names. */
export type PortsLookup = (kind: string) => readonly string[] | undefined;

/**
 * Validate a spec. `portsOf` is optional — if omitted, port-reference names
 * are only checked against other components' ids (not against known port lists).
 */
export function validateSpec(
  spec: unknown,
  portsOf?: PortsLookup,
): AssemblyValidationResult {
  const errors: AssemblyError[] = [];
  const warnings: AssemblyError[] = [];

  // ── Layer 1: shape ──
  if (!isAssemblySpec(spec)) {
    errors.push(makeError('spec_shape_invalid', 'Spec does not match expected shape (requires domain:string, components:array, connections:array).'));
    return { ok: false, errors, warnings };
  }

  const typedSpec = spec as AssemblySpec;
  const idSet = new Set<string>();
  // Map: componentId → kind (for layer 3 port lookups)
  const idToKind = new Map<string, string>();

  // ── Layer 2a: unique ids + valid kind strings ──
  typedSpec.components.forEach((comp, i) => {
    if (typeof comp.id !== 'string' || comp.id.length === 0) {
      errors.push(makeError('spec_shape_invalid', `components[${i}].id must be a non-empty string`, { path: `components[${i}].id` }));
      return;
    }
    if (typeof comp.kind !== 'string' || comp.kind.length === 0) {
      errors.push(makeError('spec_shape_invalid', `components[${i}].kind must be a non-empty string`, { path: `components[${i}].kind` }));
      return;
    }
    if (idSet.has(comp.id)) {
      errors.push(makeError(
        'duplicate_component_id',
        `Duplicate component id "${comp.id}" at components[${i}]`,
        { path: `components[${i}].id`, detail: { duplicateId: comp.id } },
      ));
      return;
    }
    idSet.add(comp.id);
    idToKind.set(comp.id, comp.kind);
  });

  // ── Layer 2b + Layer 3: connections ──
  typedSpec.connections.forEach((conn, i) => {
    // 2b.1 structural
    if (!conn.from || !conn.to || typeof conn.from.componentId !== 'string' || typeof conn.to.componentId !== 'string') {
      errors.push(makeError('spec_shape_invalid', `connections[${i}] must have from and to with componentId/portName`, { path: `connections[${i}]` }));
      return;
    }
    // 2b.2 self-connection (same component, same port)
    if (
      conn.from.componentId === conn.to.componentId &&
      conn.from.portName === conn.to.portName
    ) {
      errors.push(makeError(
        'self_connection',
        `connections[${i}] connects ${conn.from.componentId}#${conn.from.portName} to itself`,
        { path: `connections[${i}]` },
      ));
    }
    // 2b.3 referenced components exist
    for (const side of ['from', 'to'] as const) {
      const ref = conn[side];
      if (!idSet.has(ref.componentId)) {
        errors.push(makeError(
          'port_reference_invalid',
          `connections[${i}].${side} references unknown component id "${ref.componentId}"`,
          { path: `connections[${i}].${side}.componentId`, detail: { componentId: ref.componentId } },
        ));
        continue;
      }
      // Layer 3: port name exists for that kind
      if (portsOf) {
        const kind = idToKind.get(ref.componentId);
        const validPorts = kind ? portsOf(kind) : undefined;
        if (validPorts && !validPorts.includes(ref.portName)) {
          errors.push(makeError(
            'port_reference_invalid',
            `connections[${i}].${side} references port "${ref.portName}" which does not exist on kind "${kind}" (has: ${validPorts.join(', ')})`,
            { path: `connections[${i}].${side}.portName`, detail: { portName: ref.portName, kind, validPorts: [...validPorts] } },
          ));
        }
      }
    }
  });

  // ── Floating ports (warnings only) ──
  if (portsOf) {
    const touchedPorts = new Set<string>();
    typedSpec.connections.forEach((c) => {
      touchedPorts.add(`${c.from.componentId}#${c.from.portName}`);
      touchedPorts.add(`${c.to.componentId}#${c.to.portName}`);
    });
    typedSpec.components.forEach((comp) => {
      const ports = portsOf(comp.kind);
      if (!ports) return;
      ports.forEach((p) => {
        if (!touchedPorts.has(`${comp.id}#${p}`)) {
          warnings.push(makeError(
            'floating_port',
            `Port ${comp.id}#${p} is not connected to anything.`,
            { severity: 'warning', path: `components[${comp.id}].ports.${p}` },
          ));
        }
      });
    });
  }

  return { ok: errors.length === 0, errors, warnings };
}
