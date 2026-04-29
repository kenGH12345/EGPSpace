/**
 * layout/types.ts — 自动布局模块的公共类型
 *
 * 设计要点：
 * - 算法纯函数 (LayoutInput) => LayoutOutput
 * - LayoutInput 不依赖 EditorState，让布局算法可独立测试 + 可脱离 editor 复用
 * - boundingBox / centerAt helper 供算法收尾使用
 */

export type LayoutAlgorithm = 'grid' | 'force';

export interface Position {
  readonly x: number;
  readonly y: number;
}

/** 布局输入：元件 id 列表 + 连接拓扑（可选 bounds 约束画布尺寸） */
export interface LayoutInput {
  readonly componentIds: readonly string[];
  readonly connections: ReadonlyArray<{ readonly from: string; readonly to: string }>;
  readonly bounds?: { readonly width: number; readonly height: number };
}

/** 布局输出：每个 id 对应一个 (x, y) 坐标 */
export interface LayoutOutput {
  readonly positions: Readonly<Record<string, Position>>;
}

/** 计算 positions 的外包围盒 */
export function boundingBox(positions: Readonly<Record<string, Position>>): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  const ids = Object.keys(positions);
  if (ids.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const id of ids) {
    const p = positions[id];
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  return { minX, minY, maxX, maxY };
}

/** 把 positions 的中心平移到 (cx, cy) */
export function centerAt(
  positions: Readonly<Record<string, Position>>,
  cx: number,
  cy: number,
): Record<string, Position> {
  const bbox = boundingBox(positions);
  const centerX = (bbox.minX + bbox.maxX) / 2;
  const centerY = (bbox.minY + bbox.maxY) / 2;
  const dx = cx - centerX;
  const dy = cy - centerY;
  const result: Record<string, Position> = {};
  for (const id of Object.keys(positions)) {
    result[id] = { x: positions[id].x + dx, y: positions[id].y + dy };
  }
  return result;
}
