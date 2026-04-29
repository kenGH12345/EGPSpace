/**
 * draw-helpers — 共享的 canvas 绘制工具（D 阶段）
 *
 * 目标：统一选中/hover 态视觉语言。所有 drawer 都应从这里调用 helper，
 * 避免各自硬编码颜色/虚线/框尺寸。
 */

import type { ComponentBounds } from '../port-layout';

/**
 * 在元件 AABB 外 2px 处画一个浅蓝虚线 hover 框。
 * 调用方规约：仅当 `hovered && !selected` 时调用（selected 优先级高）。
 */
export function drawHoverFrame(
  ctx: CanvasRenderingContext2D,
  bounds: ComponentBounds,
): void {
  ctx.save();
  ctx.strokeStyle = '#93C5FD'; // Tailwind blue-300
  ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.strokeRect(
    bounds.x - 2,
    bounds.y - 2,
    bounds.width + 4,
    bounds.height + 4,
  );
  ctx.restore();
}
