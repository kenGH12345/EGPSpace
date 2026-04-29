/**
 * Chemistry domain drawers — minimal visual representation.
 *
 * All chemistry components are drawn in a 60×60 box. Port is at top-center
 * (dy=0) for reagents/bubbles/solids (they flow INTO a flask) and at
 * bottom-center for flask itself (opens upward to receive).
 */

import type { CanvasDrawer } from '../editor-config';
import { drawHoverFrame } from './draw-helpers';

const STROKE = '#0F172A';
const LBL = '#334155';

function label(ctx: CanvasRenderingContext2D, x: number, y: number, text: string, color = LBL) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = '10px sans-serif';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function selFrame(ctx: CanvasRenderingContext2D, ax: number, ay: number) {
  ctx.save();
  ctx.strokeStyle = '#2563EB';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 3]);
  ctx.strokeRect(ax - 4, ay - 4, 68, 68);
  ctx.restore();
}

/** D 阶段 · selected/hover 统一入口（selected 优先级高） */
function drawInteractionFrame(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  selected: boolean,
  hovered?: boolean,
): void {
  if (selected) selFrame(ctx, ax, ay);
  else if (hovered) drawHoverFrame(ctx, { x: ax, y: ay, width: 60, height: 60 });
}

export const flaskDrawer: CanvasDrawer = (ctx, c, v, selected, hovered) => {
  const ax = c.anchor.x;
  const ay = c.anchor.y;
  const volume = (c.props.volumeML as number) || 100;
  drawInteractionFrame(ctx, ax, ay, selected, hovered);
  ctx.save();
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 1.5;
  // flask body (trapezoid narrowing to neck)
  ctx.beginPath();
  ctx.moveTo(ax + 20, ay + 10);
  ctx.lineTo(ax + 20, ay + 20);
  ctx.lineTo(ax + 5, ay + 55);
  ctx.lineTo(ax + 55, ay + 55);
  ctx.lineTo(ax + 40, ay + 20);
  ctx.lineTo(ax + 40, ay + 10);
  ctx.closePath();
  ctx.stroke();
  // liquid (fill) if we have a totalMoles or pH
  const fillColor = (v?.pH !== undefined ? pHToColor(v.pH as number) : '#BFDBFE');
  ctx.fillStyle = fillColor;
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(ax + 20, ay + 40);
  ctx.lineTo(ax + 10, ay + 52);
  ctx.lineTo(ax + 50, ay + 52);
  ctx.lineTo(ax + 40, ay + 40);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  label(ctx, ax + 8, ay + 8, `${volume}mL`);
  label(ctx, ax + 15, ay + 70, c.id, '#64748B');
  if (v?.pH !== undefined) {
    label(ctx, ax + 20, ay + 50, `pH=${(v.pH as number).toFixed(1)}`, '#1E3A8A');
  }
  ctx.restore();
};

function pHToColor(pH: number): string {
  if (pH < 3) return '#FCA5A5'; // red
  if (pH < 6) return '#FDBA74'; // orange
  if (pH < 8) return '#BFDBFE'; // neutral blue
  if (pH < 11) return '#A7F3D0'; // green
  return '#A78BFA'; // purple
}

export const reagentDrawer: CanvasDrawer = (ctx, c, _v, selected, hovered) => {
  const ax = c.anchor.x;
  const ay = c.anchor.y;
  const formula = (c.props.formula as string) || '?';
  const moles = (c.props.moles as number) || 0;
  const phase = (c.props.phase as string) || 'aq';
  drawInteractionFrame(ctx, ax, ay, selected, hovered);
  ctx.save();
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 1.5;
  // test tube shape
  ctx.beginPath();
  ctx.moveTo(ax + 20, ay + 5);
  ctx.lineTo(ax + 20, ay + 50);
  ctx.arc(ax + 30, ay + 50, 10, Math.PI, 0, true);
  ctx.lineTo(ax + 40, ay + 5);
  ctx.stroke();
  ctx.fillStyle = phase === 'aq' ? '#DBEAFE' : phase === 'l' ? '#A7F3D0' : '#E5E7EB';
  ctx.beginPath();
  ctx.moveTo(ax + 22, ay + 30);
  ctx.lineTo(ax + 22, ay + 50);
  ctx.arc(ax + 30, ay + 50, 8, Math.PI, 0, true);
  ctx.lineTo(ax + 38, ay + 30);
  ctx.closePath();
  ctx.fill();
  label(ctx, ax + 16, ay + 18, formula, '#1E3A8A');
  label(ctx, ax + 10, ay + 70, `${c.id} · ${moles.toFixed(2)}mol`, '#64748B');
  ctx.restore();
};

export const bubbleDrawer: CanvasDrawer = (ctx, c, _v, selected, hovered) => {
  const ax = c.anchor.x;
  const ay = c.anchor.y;
  const gas = (c.props.gas as string) || 'H2';
  drawInteractionFrame(ctx, ax, ay, selected, hovered);
  ctx.save();
  ctx.strokeStyle = '#0369A1';
  ctx.lineWidth = 1;
  // 3 bubble circles
  ctx.fillStyle = 'rgba(186,230,253,0.7)';
  [20, 35, 25].forEach((dy, i) => {
    ctx.beginPath();
    ctx.arc(ax + 20 + i * 10, ay + dy, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  label(ctx, ax + 18, ay + 60, `${gas}↑`, '#0369A1');
  label(ctx, ax + 15, ay + 72, c.id, '#64748B');
  ctx.restore();
};

export const solidDrawer: CanvasDrawer = (ctx, c, v, selected, hovered) => {
  const ax = c.anchor.x;
  const ay = c.anchor.y;
  const formula = (c.props.formula as string) || '?';
  const mass = (c.props.massG as number) || 0;
  const state = (v?.state as string) || (c.props.state as string) || 'intact';
  drawInteractionFrame(ctx, ax, ay, selected, hovered);
  ctx.save();
  // Color by state
  ctx.fillStyle = state === 'rusting' ? '#B45309' : state === 'dissolved' ? '#E5E7EB' : '#94A3B8';
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 1;
  // chunky polygon (fake crystal)
  ctx.beginPath();
  ctx.moveTo(ax + 20, ay + 15);
  ctx.lineTo(ax + 45, ay + 20);
  ctx.lineTo(ax + 50, ay + 45);
  ctx.lineTo(ax + 25, ay + 50);
  ctx.lineTo(ax + 10, ay + 30);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  label(ctx, ax + 20, ay + 35, formula);
  label(ctx, ax + 10, ay + 70, `${c.id} · ${mass.toFixed(1)}g · ${state}`, '#64748B');
  ctx.restore();
};

export const indicatorDrawer: CanvasDrawer = (ctx, c, v, selected, hovered) => {
  const ax = c.anchor.x;
  const ay = c.anchor.y;
  const dyeType = (c.props.dyeType as string) || 'phenolphthalein';
  const currentColor = (v?.color as string) || '#D1D5DB';
  drawInteractionFrame(ctx, ax, ay, selected, hovered);
  ctx.save();
  ctx.fillStyle = currentColor;
  ctx.strokeStyle = STROKE;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(ax + 30, ay + 30, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  label(ctx, ax + 4, ay + 55, dyeType, '#1F2937');
  label(ctx, ax + 15, ay + 70, c.id, '#64748B');
  ctx.restore();
};
