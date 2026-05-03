import type { CanvasDrawer } from '../editor-config';
import { MACRO_DEFAULT_SIZE } from '../macro-config';

/**
 * compositeDrawer — renders a user-defined macro as a dark rounded chip.
 *
 * Port dots are drawn by EditorCanvas's DOM overlay (reads config.portLayout),
 * so this drawer only paints the body + name + "macro" subtitle. Port names
 * get rendered as small labels just above their geometric position.
 */
export const compositeDrawer: CanvasDrawer = (ctx, component, _values, selected, hovered) => {
  const { anchor, props } = component;
  const width = MACRO_DEFAULT_SIZE.width;
  const height = MACRO_DEFAULT_SIZE.height;
  const x = anchor.x;
  const y = anchor.y;

  ctx.save();

  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  roundRect(ctx, x, y, width, height, 6);
  ctx.fill();

  if (selected) {
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
  } else if (hovered) {
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 1.5;
  } else {
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1;
  }
  ctx.stroke();

  const rawName =
    (typeof props.name === 'string' && props.name) ||
    (typeof props.displayName === 'string' && props.displayName) ||
    (typeof component.kind === 'string' ? component.kind.replace(/^macro:/, '') : 'Macro');
  ctx.fillStyle = '#f8fafc';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(truncate(rawName, 14), x + width / 2, y + height / 2 - 4);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '8px sans-serif';
  ctx.fillText('macro', x + width / 2, y + height / 2 + 10);

  ctx.restore();
};

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}
