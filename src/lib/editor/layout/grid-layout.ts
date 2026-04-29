/**
 * grid-layout.ts — Grid 布局算法
 *
 * 简单确定性算法：按 componentIds 顺序填入 N×M 网格
 * - cols = min(ceil(sqrt(N)), maxCols)
 * - cell = 120×100（足够一个元件标准尺寸 80×60 + padding）
 * - origin = (60, 60)（预留左上留白）
 *
 * 适合场景：导入无 layout JSON 时的兜底布局 · 元件数量 1-30 视觉可接受
 */

import type { LayoutInput, LayoutOutput, Position } from './types';

const CELL_WIDTH = 120;
const CELL_HEIGHT = 100;
const ORIGIN_X = 60;
const ORIGIN_Y = 60;
const MAX_COLS = 6;

export function gridLayout(input: LayoutInput): LayoutOutput {
  const { componentIds } = input;
  const n = componentIds.length;

  if (n === 0) {
    return { positions: {} };
  }

  const cols = Math.min(Math.ceil(Math.sqrt(n)), MAX_COLS);
  const positions: Record<string, Position> = {};

  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    positions[componentIds[i]] = {
      x: ORIGIN_X + col * CELL_WIDTH,
      y: ORIGIN_Y + row * CELL_HEIGHT,
    };
  }

  return { positions };
}
