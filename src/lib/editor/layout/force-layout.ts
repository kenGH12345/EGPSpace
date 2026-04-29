/**
 * force-layout.ts — Force-directed 布局（Fruchterman-Reingold 经典算法）
 *
 * 设计要点：
 * - Mulberry32 PRNG（12 行自写）保证相同输入产生相同输出（确定性）
 * - seed 从 componentIds 字符串哈希产生（稳定 seed）
 * - 迭代 100 次 + temperature 线性衰减
 * - 最终 centerAt 到画布中心 (400, 300)
 *
 * 复杂度：O(iterations × N²)，100 次迭代 × 100 元件 ≈ 10⁶ 次力计算 < 500ms（目标）
 */

import type { LayoutInput, LayoutOutput, Position } from './types';
import { centerAt } from './types';

// ── Mulberry32 PRNG（固定 seed → 固定序列） ────────────────────────
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function (): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 从字符串哈希产生稳定 seed（简化版 djb2） */
export function seedFromIds(ids: readonly string[]): number {
  let hash = 5381;
  for (const id of ids) {
    for (let i = 0; i < id.length; i++) {
      hash = ((hash << 5) + hash + id.charCodeAt(i)) | 0;
    }
  }
  return hash >>> 0;
}

// ── Fruchterman-Reingold ─────────────────────────────────────────

const ITERATIONS = 100;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const INITIAL_TEMP = 50;

interface Node {
  id: string;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export function forceLayout(input: LayoutInput): LayoutOutput {
  const { componentIds, connections } = input;
  const n = componentIds.length;

  if (n === 0) return { positions: {} };
  if (n === 1) return { positions: { [componentIds[0]]: { x: 400, y: 300 } } };

  const bounds = input.bounds ?? { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
  const area = bounds.width * bounds.height;
  const k = Math.sqrt(area / n) * 1.2;

  // 稳定 PRNG 初始化节点位置
  const rng = mulberry32(seedFromIds(componentIds));
  const nodes: Node[] = componentIds.map((id) => ({
    id,
    x: rng() * bounds.width,
    y: rng() * bounds.height,
    dx: 0,
    dy: 0,
  }));

  const nodeIndex = new Map(nodes.map((nd, i) => [nd.id, i]));

  // FR 迭代
  let temperature = INITIAL_TEMP;
  const tempStep = INITIAL_TEMP / ITERATIONS;

  for (let iter = 0; iter < ITERATIONS; iter++) {
    // ── repulsion ──
    for (let i = 0; i < n; i++) {
      nodes[i].dx = 0;
      nodes[i].dy = 0;
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        const deltaX = nodes[i].x - nodes[j].x;
        const deltaY = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 0.01;
        const repel = (k * k) / dist;
        nodes[i].dx += (deltaX / dist) * repel;
        nodes[i].dy += (deltaY / dist) * repel;
      }
    }

    // ── attraction (only for connected pairs) ──
    for (const conn of connections) {
      const ia = nodeIndex.get(conn.from);
      const ib = nodeIndex.get(conn.to);
      if (ia === undefined || ib === undefined) continue;
      const deltaX = nodes[ia].x - nodes[ib].x;
      const deltaY = nodes[ia].y - nodes[ib].y;
      const dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY) || 0.01;
      const attract = (dist * dist) / k;
      const fx = (deltaX / dist) * attract;
      const fy = (deltaY / dist) * attract;
      nodes[ia].dx -= fx;
      nodes[ia].dy -= fy;
      nodes[ib].dx += fx;
      nodes[ib].dy += fy;
    }

    // ── apply forces with temperature limit ──
    for (let i = 0; i < n; i++) {
      const disp = Math.sqrt(nodes[i].dx * nodes[i].dx + nodes[i].dy * nodes[i].dy) || 0.01;
      const limit = Math.min(disp, temperature);
      nodes[i].x += (nodes[i].dx / disp) * limit;
      nodes[i].y += (nodes[i].dy / disp) * limit;
      // 边界夹紧
      nodes[i].x = Math.max(0, Math.min(bounds.width, nodes[i].x));
      nodes[i].y = Math.max(0, Math.min(bounds.height, nodes[i].y));
    }

    temperature -= tempStep;
  }

  // 收尾：中心化到 (400, 300)
  const rawPositions: Record<string, Position> = {};
  for (const nd of nodes) {
    rawPositions[nd.id] = { x: Math.round(nd.x), y: Math.round(nd.y) };
  }
  const centered = centerAt(rawPositions, 400, 300);

  return { positions: centered };
}
