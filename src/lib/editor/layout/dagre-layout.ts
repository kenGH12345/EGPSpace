import * as dagre from 'dagre';
import type { LayoutInput, LayoutOutput, Position } from './types';
import { centerAt } from './types';

// Internal lightweight graph layout engine (replaces dagre)
// Implements hierarchical DAG layout: rank assignment -> ordering -> coordinate assignment

interface InternalNode {
  id: string;
  width: number;
  height: number;
  rank: number;
  x: number;
  y: number;
}

interface InternalEdge {
  from: string;
  to: string;
}

function topologicalSort(nodes: InternalNode[], edges: InternalEdge[]): InternalNode[] {
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();
  const nodeMap = new Map<string, InternalNode>();

  for (const n of nodes) {
    nodeMap.set(n.id, n);
    inDegree.set(n.id, 0);
    adj.set(n.id, []);
  }

  for (const e of edges) {
    const current = inDegree.get(e.to) ?? 0;
    inDegree.set(e.to, current + 1);
    adj.get(e.from)!.push(e.to);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree) {
    if (deg === 0) queue.push(id);
  }

  const sorted: InternalNode[] = [];
  while (queue.length > 0) {
    const id = queue.shift()!;
    sorted.push(nodeMap.get(id)!);
    for (const nextId of adj.get(id)!) {
      const newDeg = (inDegree.get(nextId) ?? 0) - 1;
      inDegree.set(nextId, newDeg);
      if (newDeg === 0) queue.push(nextId);
    }
  }

  return sorted;
}

function assignRanks(nodes: InternalNode[], edges: InternalEdge[]) {
  const inEdges = new Map<string, string[]>();
  for (const n of nodes) inEdges.set(n.id, []);
  for (const e of edges) {
    inEdges.get(e.to)!.push(e.from);
  }

  const sorted = topologicalSort(nodes, edges);
  const rankMap = new Map<string, number>();

  for (const n of sorted) {
    const parents = inEdges.get(n.id) ?? [];
    if (parents.length === 0) {
      rankMap.set(n.id, 0);
    } else {
      let maxParentRank = -1;
      for (const p of parents) {
        maxParentRank = Math.max(maxParentRank, rankMap.get(p) ?? 0);
      }
      rankMap.set(n.id, maxParentRank + 1);
    }
  }

  for (const n of nodes) {
    n.rank = rankMap.get(n.id) ?? 0;
  }
}

export function dagreLayout(input: LayoutInput): LayoutOutput {
  const nodes: InternalNode[] = input.componentIds.map((id) => ({
    id,
    width: 100,
    height: 80,
    rank: 0,
    x: 0,
    y: 0,
  }));

  const edges: InternalEdge[] = input.connections.map((c) => ({
    from: c.from,
    to: c.to,
  }));

  // Step 1: Assign ranks (layers)
  assignRanks(nodes, edges);

  // Step 2: Build rank buckets
  const rankBuckets = new Map<number, InternalNode[]>();
  for (const n of nodes) {
    const bucket = rankBuckets.get(n.rank) ?? [];
    bucket.push(n);
    rankBuckets.set(n.rank, bucket);
  }

  const maxRank = Math.max(...nodes.map((n) => n.rank), 0);
  const rankDir = 'TB';
  const nodeSep = 100; // horizontal spacing
  const rankSep = 100; // vertical spacing
  const marginX = 50;
  const marginY = 50;

  // Step 3: Assign Y coordinates (rank direction)
  for (const n of nodes) {
    n.y = marginY + n.rank * rankSep + n.height / 2;
  }

  // Step 4: Assign X coordinates within each rank
  const sortedRanks = Array.from(rankBuckets.keys()).sort((a, b) => a - b);
  for (const r of sortedRanks) {
    const bucket = rankBuckets.get(r)!;
    const totalWidth = bucket.length * bucket[0].width + (bucket.length - 1) * nodeSep;
    let startX = marginX + totalWidth / 2 - bucket[0].width / 2;
    for (let i = 0; i < bucket.length; i++) {
      const n = bucket[i];
      n.x = startX + i * (bucket[0].width + nodeSep) + n.width / 2;
    }
  }

  // Step 5: Build positions
  const positions: Record<string, Position> = {};
  for (const n of nodes) {
    positions[n.id] = {
      x: n.x - n.width / 2,
      y: n.y - n.height / 2,
    };
  }

  const bounds = input.bounds ?? { width: 800, height: 600 };
  const centered = centerAt(positions, bounds.width / 2, bounds.height / 2);

  return { positions: centered };
}
