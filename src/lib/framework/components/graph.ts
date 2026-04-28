/**
 * DomainGraph — cross-domain topology container for experiment components.
 *
 * Responsibilities:
 *  - Register components (add)
 *  - Record connections between ports (connect)
 *  - Identify equipotential/equivalent node classes via Union-Find
 *  - Produce a serializable DTO for postMessage transport
 *
 * What this file explicitly does NOT do:
 *  - Knows nothing about MNA, light rays, or chemical reactions
 *  - Does no actual solving — that's for domain-specific IDomainSolver
 *
 * This file is the single import that every domain's graph class extends or uses.
 */

import type { IExperimentComponent, ComponentDTO, ComponentDomain } from './base';
import type { PortRef, Connection } from './port';
import { portKey, portEquals } from './port';
import { UnionFind } from './union-find';

export interface EquipotentialNodeMap {
  /** Port key ("componentId#portName") → canonical node id ("n0","n1",...) */
  portToNode: Map<string, string>;
  /** All nodes in order (n0, n1, ...) */
  nodes: string[];
  /** Inverse: node id → all port keys in that class */
  nodeMembers: Map<string, string[]>;
}

export interface GraphValidation {
  ok: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Serializable DTO for a whole DomainGraph (for postMessage transport).
 */
export interface DomainGraphDTO {
  domain: ComponentDomain;
  components: ComponentDTO[];
  connections: Connection[];
}

/**
 * Generic graph parameterised by its component type.
 * Circuit/Optics/Mechanics each get a typed graph:
 *     class CircuitGraph extends DomainGraph<ICircuitComponent> { ... }
 */
export class DomainGraph<TComponent extends IExperimentComponent = IExperimentComponent> {
  readonly domain: ComponentDomain;
  private readonly _components = new Map<string, TComponent>();
  private readonly _connections: Connection[] = [];

  constructor(domain: ComponentDomain) {
    this.domain = domain;
  }

  // ─── Mutation ─────────────────────────────────────────────────────────
  add(component: TComponent): this {
    if (this._components.has(component.id)) {
      throw new Error(`DomainGraph.add: duplicate component id "${component.id}"`);
    }
    if (component.domain !== this.domain && component.domain !== 'meta') {
      throw new Error(
        `DomainGraph.add: component "${component.id}" has domain="${component.domain}" but graph is "${this.domain}"`,
      );
    }
    this._components.set(component.id, component);
    return this;
  }

  remove(componentId: string): TComponent | undefined {
    const c = this._components.get(componentId);
    if (!c) return undefined;
    this._components.delete(componentId);
    // Prune connections involving this component
    for (let i = this._connections.length - 1; i >= 0; i--) {
      const cn = this._connections[i];
      if (cn.from.componentId === componentId || cn.to.componentId === componentId) {
        this._connections.splice(i, 1);
      }
    }
    return c;
  }

  connect(from: PortRef, to: PortRef, kind?: string): Connection {
    this._assertPort(from);
    this._assertPort(to);
    if (portEquals(from, to)) {
      throw new Error(`DomainGraph.connect: cannot connect a port to itself (${portKey(from)})`);
    }
    const conn: Connection = {
      id: `c${this._connections.length}`,
      from,
      to,
      kind,
    };
    this._connections.push(conn);
    return conn;
  }

  // ─── Query ────────────────────────────────────────────────────────────
  get(componentId: string): TComponent | undefined {
    return this._components.get(componentId);
  }

  components(): readonly TComponent[] {
    return [...this._components.values()];
  }

  connections(): readonly Connection[] {
    return [...this._connections];
  }

  componentCount(): number {
    return this._components.size;
  }

  // ─── Equipotential analysis ───────────────────────────────────────────
  /**
   * Collapse ports linked by {explicit connections + caller-supplied "short" edges}
   * into canonical nodes using Union-Find.
   *
   * @param shortEdgeFilter Optional predicate: given (componentId, portA, portB),
   *   return true if those two ports of the same component are internally shorted
   *   (e.g. a closed Switch, a wire). Circuit domain uses this to collapse wires
   *   and closed switches into their endpoint's node.
   */
  buildEquipotentialNodes(
    shortEdgeFilter?: (component: TComponent) => Array<[string, string]>,
  ): EquipotentialNodeMap {
    const uf = new UnionFind();

    // 1. Every port starts as its own node.
    for (const c of this._components.values()) {
      for (const p of c.ports) {
        uf.add(portKey({ componentId: c.id, portName: p }));
      }
    }

    // 2. Every explicit connection merges two ports.
    for (const cn of this._connections) {
      uf.union(portKey(cn.from), portKey(cn.to));
    }

    // 3. Component-internal short edges (wire/closed switch) merge intra-component ports.
    if (shortEdgeFilter) {
      for (const c of this._components.values()) {
        const shorts = shortEdgeFilter(c);
        for (const [pa, pb] of shorts) {
          uf.union(portKey({ componentId: c.id, portName: pa }), portKey({ componentId: c.id, portName: pb }));
        }
      }
    }

    // 4. Canonicalise: each root → "n0","n1",...
    const rootToId = new Map<string, string>();
    const portToNode = new Map<string, string>();
    const nodeMembers = new Map<string, string[]>();
    let nextIdx = 0;
    for (const k of uf.keys()) {
      const r = uf.find(k);
      let nodeId = rootToId.get(r);
      if (!nodeId) {
        nodeId = `n${nextIdx++}`;
        rootToId.set(r, nodeId);
        nodeMembers.set(nodeId, []);
      }
      portToNode.set(k, nodeId);
      nodeMembers.get(nodeId)!.push(k);
    }

    return {
      portToNode,
      nodes: [...nodeMembers.keys()],
      nodeMembers,
    };
  }

  /** Detect floating ports (ports not connected to any other port). */
  validateTopology(): GraphValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Build port touch-count
    const touches = new Map<string, number>();
    for (const c of this._components.values()) {
      for (const p of c.ports) {
        touches.set(portKey({ componentId: c.id, portName: p }), 0);
      }
    }
    for (const cn of this._connections) {
      touches.set(portKey(cn.from), (touches.get(portKey(cn.from)) ?? 0) + 1);
      touches.set(portKey(cn.to), (touches.get(portKey(cn.to)) ?? 0) + 1);
    }
    for (const [k, n] of touches) {
      if (n === 0) warnings.push(`port ${k} is not connected to anything (floating)`);
    }

    return { ok: errors.length === 0, errors, warnings };
  }

  // ─── Serialization ────────────────────────────────────────────────────
  toDTO(): DomainGraphDTO {
    return {
      domain: this.domain,
      components: [...this._components.values()].map((c) => c.serialize()),
      connections: [...this._connections],
    };
  }

  // ─── Internal helpers ─────────────────────────────────────────────────
  private _assertPort(p: PortRef): void {
    const c = this._components.get(p.componentId);
    if (!c) throw new Error(`DomainGraph: unknown componentId "${p.componentId}"`);
    if (!c.ports.includes(p.portName)) {
      throw new Error(
        `DomainGraph: component "${p.componentId}" has no port "${p.portName}" (has: ${c.ports.join(', ')})`,
      );
    }
  }
}
