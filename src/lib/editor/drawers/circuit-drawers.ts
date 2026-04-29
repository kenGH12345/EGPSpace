/**
 * Circuit domain drawers — TypeScript mirror of public/templates/_shared/circuit-draw.js.
 *
 * Each drawer renders one component kind on a 2D canvas context.
 * Layout convention:
 *   - nominal size: 50×40
 *   - ports sit at x=0 (left) and x=50 (right), y=20 (centered)
 *   - the anchor is the top-left corner of the nominal bounding box
 *
 * ⚠️ Must be kept in sync with the JS mirror. Any change here requires the
 * same change in circuit-draw.js (R-B mitigation in execution-plan.md).
 */

import type { CanvasDrawer } from '../editor-config';

const STROKE = '#0F172A';
const LBL = '#334155';
const SELECTED_STROKE = '#2563EB';

function drawLabel(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color?: string): void {
  ctx.save();
  ctx.fillStyle = color || LBL;
  ctx.font = '11px sans-serif';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function drawSelectionFrame(ctx: CanvasRenderingContext2D, ax: number, ay: number): void {
  ctx.save();
  ctx.strokeStyle = SELECTED_STROKE;
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(ax - 4, ay - 4, 58, 48);
  ctx.restore();
}

export const batteryDrawer: CanvasDrawer = (ctx, c, _v, selected) => {
  const ax = c.anchor.x;
  const ay = c.anchor.y;
  const voltage = (c.props.voltage as number) || 0;
  if (selected) drawSelectionFrame(ctx, ax, ay);
  ctx.save();
  ctx.strokeStyle = '#DC2626';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ax + 20, ay + 5);
  ctx.lineTo(ax + 20, ay + 35);
  ctx.stroke();
  ctx.strokeStyle = '#1E3A8A';
  ctx.beginPath();
  ctx.moveTo(ax + 30, ay + 12);
  ctx.lineTo(ax + 30, ay + 28);
  ctx.stroke();
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ax, ay + 20);
  ctx.lineTo(ax + 20, ay + 20);
  ctx.moveTo(ax + 30, ay + 20);
  ctx.lineTo(ax + 50, ay + 20);
  ctx.stroke();
  drawLabel(ctx, ax + 10, ay - 2, voltage.toFixed(1) + ' V');
  drawLabel(ctx, ax + 15, ay + 50, c.id, '#64748B');
  ctx.restore();
};

export const wireDrawer: CanvasDrawer = (ctx, c, _v, selected) => {
  const ax = c.anchor.x;
  const ay = c.anchor.y;
  if (selected) drawSelectionFrame(ctx, ax, ay);
  ctx.save();
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ax, ay + 20);
  ctx.lineTo(ax + 50, ay + 20);
  ctx.stroke();
  drawLabel(ctx, ax + 15, ay + 50, c.id, '#64748B');
  ctx.restore();
};

export const switchDrawer: CanvasDrawer = (ctx, c, _v, selected) => {
  const ax = c.anchor.x;
  const ay = c.anchor.y;
  const closed = !!c.props.closed;
  if (selected) drawSelectionFrame(ctx, ax, ay);
  ctx.save();
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ax, ay + 20);
  ctx.lineTo(ax + 15, ay + 20);
  ctx.moveTo(ax + 35, ay + 20);
  ctx.lineTo(ax + 50, ay + 20);
  ctx.stroke();
  ctx.fillStyle = STROKE;
  ctx.beginPath();
  ctx.arc(ax + 15, ay + 20, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(ax + 35, ay + 20, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = closed ? '#16A34A' : '#DC2626';
  ctx.lineWidth = 2;
  ctx.beginPath();
  if (closed) {
    ctx.moveTo(ax + 15, ay + 20);
    ctx.lineTo(ax + 35, ay + 20);
  } else {
    ctx.moveTo(ax + 15, ay + 20);
    ctx.lineTo(ax + 33, ay + 8);
  }
  ctx.stroke();
  drawLabel(ctx, ax + 10, ay + 50, c.id + (closed ? ' ✓' : ' ✗'), '#64748B');
  ctx.restore();
};

export const resistorDrawer: CanvasDrawer = (ctx, c, v, selected) => {
  const ax = c.anchor.x;
  const ay = c.anchor.y;
  const R = (c.props.resistance as number) || 0;
  const I = (v?.current as number) || 0;
  if (selected) drawSelectionFrame(ctx, ax, ay);
  ctx.save();
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ax, ay + 20);
  ctx.lineTo(ax + 10, ay + 20);
  ctx.moveTo(ax + 40, ay + 20);
  ctx.lineTo(ax + 50, ay + 20);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(ax + 10, ay + 20);
  const xs = [13, 16, 19, 22, 25, 28, 31, 34, 37, 40];
  const ys = [14, 26, 14, 26, 14, 26, 14, 26, 14, 20];
  for (let i = 0; i < xs.length; i++) ctx.lineTo(ax + xs[i], ay + ys[i]);
  ctx.stroke();
  drawLabel(ctx, ax + 12, ay - 2, R.toFixed(1) + 'Ω');
  drawLabel(ctx, ax + 10, ay + 50, `${c.id} · ${I.toFixed(3)}A`, '#64748B');
  ctx.restore();
};

export const bulbDrawer: CanvasDrawer = (ctx, c, v, selected) => {
  const ax = c.anchor.x;
  const ay = c.anchor.y;
  const glow = Math.max(0, Math.min(1.5, (v?.glow as number) || 0));
  const state = (v?.state as string) || 'normal';
  if (selected) drawSelectionFrame(ctx, ax, ay);
  ctx.save();
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ax, ay + 20);
  ctx.lineTo(ax + 15, ay + 20);
  ctx.moveTo(ax + 35, ay + 20);
  ctx.lineTo(ax + 50, ay + 20);
  ctx.stroke();
  const cx = ax + 25;
  const cy = ay + 20;
  const intensity = Math.min(1, glow);
  ctx.fillStyle = `rgba(250, 204, 21, ${0.2 + intensity * 0.8})`;
  ctx.beginPath();
  ctx.arc(cx, cy, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = state === 'overload' ? '#DC2626' : STROKE;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = '#7C2D12';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - 8, cy - 8);
  ctx.lineTo(cx + 8, cy + 8);
  ctx.moveTo(cx - 8, cy + 8);
  ctx.lineTo(cx + 8, cy - 8);
  ctx.stroke();
  drawLabel(ctx, ax + 15, ay + 50, c.id, '#64748B');
  if (state === 'overload') drawLabel(ctx, ax + 2, ay - 4, '⚠ 过载', '#DC2626');
  ctx.restore();
};

export const ammeterDrawer: CanvasDrawer = (ctx, c, v, selected) => {
  const ax = c.anchor.x;
  const ay = c.anchor.y;
  const I = (v?.current as number) || 0;
  if (selected) drawSelectionFrame(ctx, ax, ay);
  ctx.save();
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ax, ay + 20);
  ctx.lineTo(ax + 13, ay + 20);
  ctx.moveTo(ax + 37, ay + 20);
  ctx.lineTo(ax + 50, ay + 20);
  ctx.stroke();
  ctx.fillStyle = '#E0F2FE';
  ctx.beginPath();
  ctx.arc(ax + 25, ay + 20, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#0369A1';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('A', ax + 22, ay + 23);
  drawLabel(ctx, ax + 2, ay + 50, `${c.id} · ${I.toFixed(3)}A`, '#64748B');
  ctx.restore();
};

export const voltmeterDrawer: CanvasDrawer = (ctx, c, v, selected) => {
  const ax = c.anchor.x;
  const ay = c.anchor.y;
  const U = (v?.voltage as number) || 0;
  if (selected) drawSelectionFrame(ctx, ax, ay);
  ctx.save();
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(ax, ay + 20);
  ctx.lineTo(ax + 13, ay + 20);
  ctx.moveTo(ax + 37, ay + 20);
  ctx.lineTo(ax + 50, ay + 20);
  ctx.stroke();
  ctx.fillStyle = '#FEF3C7';
  ctx.beginPath();
  ctx.arc(ax + 25, ay + 20, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#92400E';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('V', ax + 22, ay + 23);
  drawLabel(ctx, ax + 2, ay + 50, `${c.id} · ${U.toFixed(2)}V`, '#64748B');
  ctx.restore();
};
