/**
 * Knowledge Graph: Force-Directed Layout Engine
 *
 * Implements a 2D force-directed graph layout using:
 * - Spring force (pull adjacent nodes together)
 * - Repulsive force (push all nodes apart)
 * - Gravity/centering force (pull toward viewport center)
 * - Alpha decay for cooling (prevents oscillation)
 *
 * Inspired by D3-force and Observable's force graphs.
 */

import type { KnowledgeNode, KnowledgeEdge, GraphState } from './types';

interface LayoutConfig {
  springLength: number;    // Ideal edge length
  springK: number;         // Spring stiffness
  repulsionK: number;      // Repulsive force constant
  gravity: number;         // Centering gravity
  alpha: number;           // Cooling parameter (velocity multiplier)
  alphaDecay: number;      // How fast alpha decays per tick
  alphaMin: number;        // Stop when alpha below this
  maxIterations: number;
}

const DEFAULT_CONFIG: LayoutConfig = {
  springLength: 120,
  springK: 0.05,
  repulsionK: 5000,
  gravity: 0.05,
  alpha: 0.9,
  alphaDecay: 0.02,
  alphaMin: 1e-3,
  maxIterations: 500,
};

export class GraphLayoutEngine {
  private nodes: Map<string, KnowledgeNode> = new Map();
  private edges: KnowledgeEdge[] = [];
  private config: LayoutConfig;
  private alpha: number;

  constructor(config: Partial<LayoutConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.alpha = this.config.alpha;
  }

  /* ─── Public API ─── */

  setGraph(state: GraphState): void {
    this.nodes.clear();
    state.nodes.forEach(n => this.nodes.set(n.id, this.ensureVelocity(n)));
    this.edges = state.edges;
    this.alpha = this.config.alpha;
  }

  /** Run a single simulation tick. Returns current alpha (≈ convergence). */
  tick(): number {
    this.applyRepulsiveForce();
    this.applySpringForce();
    this.applyGravity();
    this.updatePositions();

    this.alpha -= this.config.alphaDecay;
    if (this.alpha < this.config.alphaMin) this.alpha = 0;

    return this.alpha;

  }

  /** Run until convergence or max iterations. */
  run(): void {
    for (let i = 0; i < this.config.maxIterations; i++) {
      this.tick();
      if (this.alpha <= 0) break;
    }
  }

  /** Get all node positions. */
  getNodes(): KnowledgeNode[] {
    return Array.from(this.nodes.values());
  }

  /** Is the layout still settling? */
  isConverged(): boolean {
    return this.alpha === 0;
  }

  /** Get convergence progress [0, 1]. */
  getProgress(): number {
    if (this.config.alpha === 0) return 1;
    return 1 - this.alpha / this.config.alpha;
  }

  /** Restart from current state (e.g. after dragging a node). */
  restart(): void {
    this.alpha = this.config.alpha;
  }

  /* ─── Forces ─── */

  private applyRepulsiveForce(): void {
    const nodes = Array.from(this.nodes.values());

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 === 0) continue;

        const dist = Math.sqrt(dist2);
        const force = this.config.repulsionK / dist2;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        a.vx! -= fx;
        a.vy! -= fy;
        b.vx! += fx;
        b.vy! += fy;
      }
    }
  }

  private applySpringForce(): void {
    for (const edge of this.edges) {
      const a = this.nodes.get(edge.source);
      const b = this.nodes.get(edge.target);
      if (!a || !b) continue;

      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = (dist - this.config.springLength) * this.config.springK;

      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      a.vx! += fx;
      a.vy! += fy;
      b.vx! -= fx;
      b.vy! -= fy;
    }
  }

  private applyGravity(): void {
    for (const node of this.nodes.values()) {
      node.vx! -= node.x * this.config.gravity;
      node.vy! -= node.y * this.config.gravity;
    }
  }

  private updatePositions(): void {
    for (const node of this.nodes.values()) {
      node.x += node.vx! * this.alpha;
      node.y += node.vy! * this.alpha;
      node.vx! *= 0.9; // Damping
      node.vy! *= 0.9;
    }
  }

  /* ─── Helpers ─── */

  private ensureVelocity(node: KnowledgeNode): KnowledgeNode {
    if (node.vx === undefined) node.vx = 0;
    if (node.vy === undefined) node.vy = 0;
    return node;
  }
}
