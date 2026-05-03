/**
 * auto-layout.ts — 自动布局算法分派入口
 *
 * 使用方：reducer 层 & UI 层的 AutoLayout 按钮
 */

import type { LayoutInput, LayoutOutput, LayoutAlgorithm } from './types';
import { gridLayout } from './grid-layout';
import { forceLayout } from './force-layout';
import { dagreLayout } from './dagre-layout';

export function autoLayout(
  input: LayoutInput,
  algorithm: LayoutAlgorithm = 'grid',
): LayoutOutput {
  switch (algorithm) {
    case 'grid':
      return gridLayout(input);
    case 'force':
      return forceLayout(input);
    case 'dagre':
      return dagreLayout(input);
    default:
      // 静态枚举完整性保护
      return gridLayout(input);
  }
}
