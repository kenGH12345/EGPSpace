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
import { drawHoverFrame } from './draw-helpers';

const STROKE = '#0F172A';
const LBL = '#334155';
const SELECTED_STROKE = '#2563EB';
const COMPONENT_W = 50;
const COMPONENT_H = 40;

type PlacedComp = Parameters<CanvasDrawer>[1];

export interface SvgPathDef {
  d: string | ((c: PlacedComp, v: any) => string);
  stroke?: string | ((c: PlacedComp, v: any) => string);
  fill?: string | ((c: PlacedComp, v: any) => string);
  lineWidth?: number;
}

export interface SvgTextDef {
  x: number;
  y: number;
  text: string | ((c: PlacedComp, v: any) => string);
  color?: string | ((c: PlacedComp, v: any) => string);
  font?: string;
  align?: CanvasTextAlign;
}

export interface SvgDrawerConfig {
  width?: number;
  height?: number;
  paths?: SvgPathDef[];
  texts?: SvgTextDef[];
  customDraw?: CanvasDrawer;
}

export function createSvgDrawer(config: SvgDrawerConfig): CanvasDrawer {
  return (ctx, c, v, selected, hovered) => {
    const ax = c.anchor.x;
    const ay = c.anchor.y;
    drawInteractionFrame(ctx, ax, ay, selected, hovered);

    ctx.save();
    try {
      ctx.translate(ax, ay);
      if (config.paths) {
        for (const p of config.paths) {
          const d = typeof p.d === 'function' ? p.d(c, v) : p.d;
          const stroke = typeof p.stroke === 'function' ? p.stroke(c, v) : p.stroke;
          const fill = typeof p.fill === 'function' ? p.fill(c, v) : p.fill;

          const path2d = new Path2D(d);
          if (p.lineWidth) ctx.lineWidth = p.lineWidth;
          else ctx.lineWidth = 1.5;

          if (fill) {
            ctx.fillStyle = fill;
            ctx.fill(path2d);
          }
          if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.stroke(path2d);
          }
        }
      }

      if (config.texts) {
        for (const t of config.texts) {
          const text = typeof t.text === 'function' ? t.text(c, v) : t.text;
          const color = typeof t.color === 'function' ? t.color(c, v) : t.color;
          ctx.fillStyle = color || LBL;
          ctx.font = t.font || '11px sans-serif';
          if (t.align) ctx.textAlign = t.align;
          ctx.fillText(text, t.x, t.y);
        }
      }
    } catch (e) {
      console.error(`[SvgDrawer] failed to render component ${c.id}:`, e);
    }
    ctx.restore();

    if (config.customDraw) {
      config.customDraw(ctx, c, v, selected, hovered);
    }
  };
}

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

/** Hover frame helper (D 阶段 · 仅在非 selected 时调用) */
function drawHoverAt(ctx: CanvasRenderingContext2D, ax: number, ay: number): void {
  drawHoverFrame(ctx, { x: ax, y: ay, width: COMPONENT_W, height: COMPONENT_H });
}

/** Selected/hover 统一入口（D 阶段 · selected 优先级高于 hovered） */
function drawInteractionFrame(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  selected: boolean,
  hovered?: boolean,
): void {
  if (selected) drawSelectionFrame(ctx, ax, ay);
  else if (hovered) drawHoverAt(ctx, ax, ay);
}

export const batteryDrawer: CanvasDrawer = createSvgDrawer({
  paths: [
    { d: 'M 20 5 L 20 35', stroke: '#DC2626', lineWidth: 3 },
    { d: 'M 30 12 L 30 28', stroke: '#1E3A8A', lineWidth: 3 },
    { d: 'M 0 20 L 20 20 M 30 20 L 50 20', stroke: STROKE }
  ],
  texts: [
    { x: 10, y: -2, text: (c) => (((c.props.voltage as number) || 0).toFixed(1) + ' V') },
    { x: 15, y: 50, text: (c) => c.id, color: '#64748B' }
  ]
});

export const switchDrawer: CanvasDrawer = createSvgDrawer({
  paths: [
    { d: 'M 0 20 L 15 20 M 35 20 L 50 20', stroke: STROKE },
    { d: 'M 17.5 20 A 2.5 2.5 0 1 1 12.5 20 A 2.5 2.5 0 1 1 17.5 20', fill: STROKE },
    { d: 'M 37.5 20 A 2.5 2.5 0 1 1 32.5 20 A 2.5 2.5 0 1 1 37.5 20', fill: STROKE },
    {
      d: (c) => c.props.closed ? 'M 15 20 L 35 20' : 'M 15 20 L 33 8',
      stroke: (c) => c.props.closed ? '#16A34A' : '#DC2626',
      lineWidth: 2
    }
  ],
  texts: [
    { x: 10, y: 50, text: (c) => c.id + (c.props.closed ? ' ✓' : ' ✗'), color: '#64748B' }
  ]
});

export const bulbDrawer: CanvasDrawer = createSvgDrawer({
  paths: [
    { d: 'M 0 20 L 15 20 M 35 20 L 50 20', stroke: STROKE },
    { d: 'M 17 12 L 33 28 M 17 28 L 33 12', stroke: '#7C2D12', lineWidth: 1 }
  ],
  texts: [
    { x: 15, y: 50, text: (c) => c.id, color: '#64748B' },
    { x: 2, y: -4, text: (c, v) => v?.state === 'overload' ? '⚠ 过载' : '', color: '#DC2626' }
  ],
  customDraw: (ctx, c, v) => {
    const ax = c.anchor.x;
    const ay = c.anchor.y;
    const glow = Math.max(0, Math.min(1.5, (v?.glow as number) || 0));
    const state = (v?.state as string) || 'normal';

    ctx.save();
    ctx.translate(ax, ay);

    const cx = 25;
    const cy = 20;
    const intensity = Math.min(1, glow);
    // Off: subtle dark-yellow fill so the bulb shape is still visible
    // On:  warm yellow fill driven by glow intensity
    const offColor  = 'rgba(250, 204, 21, 0.04)';
    const onColor   = `rgba(250, 204, 21, ${intensity})`;
    ctx.fillStyle = intensity === 0 ? offColor : onColor;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();

    // Add a small halo when glowing (intensity > 0.1)
    if (intensity > 0.1) {
      ctx.shadowColor = 'rgba(250, 204, 21, 0.6)';
      ctx.shadowBlur  = 6 + intensity * 10;
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.strokeStyle = state === 'overload' ? '#DC2626' : STROKE;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
  }
});

export const wireDrawer: CanvasDrawer = createSvgDrawer({
  paths: [
    { d: 'M 0 20 L 50 20', stroke: STROKE }
  ],
  texts: [
    { x: 15, y: 50, text: (c) => c.id, color: '#64748B' }
  ]
});

export const ammeterDrawer: CanvasDrawer = createSvgDrawer({
  paths: [
    { d: 'M 0 20 L 13 20 M 37 20 L 50 20', stroke: STROKE },
    { d: 'M 37 20 A 12 12 0 1 1 13 20 A 12 12 0 1 1 37 20', stroke: STROKE, fill: '#E0F2FE' }
  ],
  texts: [
    { x: 22, y: 23, text: 'A', color: '#0369A1', font: 'bold 10px sans-serif' },
    { x: 2, y: 50, text: (c, v) => `${c.id} · ${((v?.current as number) || 0).toFixed(3)}A`, color: '#64748B' }
  ]
});

export const voltmeterDrawer: CanvasDrawer = createSvgDrawer({
  paths: [
    { d: 'M 0 20 L 13 20 M 37 20 L 50 20', stroke: STROKE },
    { d: 'M 37 20 A 12 12 0 1 1 13 20 A 12 12 0 1 1 37 20', stroke: STROKE, fill: '#FEF3C7' }
  ],
  texts: [
    { x: 22, y: 23, text: 'V', color: '#92400E', font: 'bold 10px sans-serif' },
    { x: 2, y: 50, text: (c, v) => `${c.id} · ${((v?.voltage as number) || 0).toFixed(2)}V`, color: '#64748B' }
  ]
});

export const resistorDrawer: CanvasDrawer = createSvgDrawer({
  paths: [
    { d: 'M 0 20 L 10 20 M 40 20 L 50 20', stroke: STROKE },
    { d: 'M 10 20 L 13 14 L 16 26 L 19 14 L 22 26 L 25 14 L 28 26 L 31 14 L 34 26 L 37 14 L 40 20', stroke: STROKE }
  ],
  texts: [
    { x: 12, y: -2, text: (c) => (((c.props.resistance as number) || 0).toFixed(1) + 'Ω') },
    { x: 10, y: 50, text: (c, v) => `${c.id} · ${((v?.current as number) || 0).toFixed(3)}A`, color: '#64748B' }
  ]
});
