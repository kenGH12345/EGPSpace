/**
 * Declarative Canvas Renderer — Renders CanvasElement[] to Canvas 2D context
 *
 * Architecture decision: DEC-2 (dual-track: declarative elements + preset templates)
 * This renderer handles the declarative track. Preset templates remain in
 * DynamicExperiment.tsx's drawXxx() functions.
 *
 * Supports 7 base element types: rect, circle, line, arrow, text, polygon, arc
 * Dynamic property binding via {variableName} syntax
 */

import type { AmbientAnimation, CanvasElement, CanvasLayout, ElementType } from './experiment-schema';
import { AmbientAnimator } from './ambient-animations';

// ============ Dynamic Value Resolution ============

export function resolveDynamicValue(
  value: number | string | undefined,
  paramValues: Record<string, number>,
  computedValues?: Record<string, number>
): number {
  if (value === undefined) return 0;
  if (typeof value === 'number') return value;

  const allValues = { ...paramValues, ...computedValues };

  const resolved = value.replace(/\{(\w+)\}/g, (_, key: string) => {
    const num = allValues[key];
    return num !== undefined ? String(num) : '0';
  });

  try {
    return new Function(`return ${resolved};`)();
  } catch {
    return 0;
  }
}

export function resolveDynamicString(
  value: string | undefined,
  paramValues: Record<string, number>,
  computedValues?: Record<string, number>
): string {
  if (!value) return '';
  const allValues = { ...paramValues, ...computedValues };

  return value.replace(/\{(\w+)\}/g, (_, key: string) => {
    const num = allValues[key];
    return num !== undefined ? num.toFixed(2) : key;
  });
}

/**
 * Evaluate a dynamic expression that may return a string or number.
 * Supports simple arithmetic, ternary operators, and variable references.
 * Used for dynamic fill/stroke colors and text values.
 */
export function resolveDynamicExpression(
  expr: string | undefined,
  paramValues: Record<string, number>,
  computedValues?: Record<string, number>
): string {
  if (!expr) return '';
  const allValues = { ...paramValues, ...computedValues };
  try {
    const keys = Object.keys(allValues);
    const vals = keys.map(k => allValues[k]);
     
    const result = new Function(...keys, `return (${expr});`)(...vals);
    return String(result ?? '');
  } catch {
    return expr;
  }
}

// ============ Coordinate Transform ============

function transformX(x: number, layout: CanvasLayout): number {
  const cs = layout.coordinateSystem;
  if (!cs) return x;
  switch (cs.origin) {
    case 'center':
      return layout.width / 2 + x * cs.scaleX;
    case 'bottomLeft':
      return x * cs.scaleX;
    default:
      return x;
  }
}

function transformY(y: number, layout: CanvasLayout): number {
  const cs = layout.coordinateSystem;
  if (!cs) return y;
  switch (cs.origin) {
    case 'center':
      return layout.height / 2 - y * cs.scaleY;
    case 'bottomLeft':
      return layout.height - y * cs.scaleY;
    default:
      return y;
  }
}

// ============ Element Renderers ============

function renderRect(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const x = transformX(resolveDynamicValue(el.dynamic?.x ?? el.x, paramValues, computedValues), layout);
  const y = transformY(resolveDynamicValue(el.dynamic?.y ?? el.y, paramValues, computedValues), layout);
  const w = resolveDynamicValue(el.width, paramValues, computedValues);
  const h = resolveDynamicValue(el.height, paramValues, computedValues);

  if (el.fill !== undefined || el.dynamic?.fill) {
    ctx.fillStyle = el.dynamic?.fill
      ? resolveDynamicExpression(el.dynamic.fill, paramValues, computedValues)
      : (el.fill ?? '#000');
    ctx.fillRect(x, y, w, h);
  }
  if (el.stroke && el.stroke !== 'none') {
    ctx.strokeStyle = el.stroke;
    ctx.lineWidth = el.strokeWidth ?? 1;
    ctx.strokeRect(x, y, w, h);
  }
}

function renderCircle(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const cx = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const cy = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);
  const r = resolveDynamicValue(el.radius, paramValues, computedValues);

  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2);

  if (el.fill) {
    ctx.fillStyle = el.fill;
    ctx.fill();
  }
  if (el.stroke) {
    ctx.strokeStyle = el.stroke;
    ctx.lineWidth = el.strokeWidth ?? 1;
    ctx.stroke();
  }
}

function renderLine(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const x1 = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const y1 = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);
  const x2 = transformX(resolveDynamicValue(el.x2, paramValues, computedValues), layout);
  const y2 = transformY(resolveDynamicValue(el.y2, paramValues, computedValues), layout);

  ctx.strokeStyle = el.stroke ?? '#333';
  ctx.lineWidth = el.strokeWidth ?? 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function renderArrow(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const x1 = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const y1 = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);
  const x2 = transformX(resolveDynamicValue(el.x2, paramValues, computedValues), layout);
  const y2 = transformY(resolveDynamicValue(el.y2, paramValues, computedValues), layout);

  ctx.strokeStyle = el.stroke ?? '#333';
  ctx.lineWidth = el.strokeWidth ?? 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const angle = Math.atan2(y2 - y1, x2 - x1);
  const headLen = 10;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
  ctx.stroke();
}

function renderText(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const x = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const y = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);

  ctx.fillStyle = el.dynamic?.fill
    ? resolveDynamicExpression(el.dynamic.fill, paramValues, computedValues)
    : (el.fill ?? '#333');
  ctx.font = `${el.fontSize ?? 14}px system-ui`;
  const text = el.dynamic?.text
    ? resolveDynamicExpression(el.dynamic.text, paramValues, computedValues)
    : resolveDynamicString(el.text, paramValues, computedValues);
  ctx.fillText(text, x, y);
}

function renderPolygon(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  if (!el.points || el.points.length === 0) return;

  ctx.beginPath();
  const first = el.points[0];
  ctx.moveTo(
    transformX(resolveDynamicValue(first.x, paramValues, computedValues), layout),
    transformY(resolveDynamicValue(first.y, paramValues, computedValues), layout)
  );

  for (let i = 1; i < el.points.length; i++) {
    const pt = el.points[i];
    ctx.lineTo(
      transformX(resolveDynamicValue(pt.x, paramValues, computedValues), layout),
      transformY(resolveDynamicValue(pt.y, paramValues, computedValues), layout)
    );
  }

  ctx.closePath();

  if (el.fill) {
    ctx.fillStyle = el.fill;
    ctx.fill();
  }
  if (el.stroke) {
    ctx.strokeStyle = el.stroke;
    ctx.lineWidth = el.strokeWidth ?? 1;
    ctx.stroke();
  }
}

function renderArc(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const cx = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const cy = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);
  const r = resolveDynamicValue(el.radius, paramValues, computedValues);
  const start = resolveDynamicValue(el.startAngle, paramValues, computedValues) * (Math.PI / 180);
  const end = resolveDynamicValue(el.endAngle, paramValues, computedValues) * (Math.PI / 180);

  ctx.beginPath();
  ctx.arc(cx, cy, Math.max(0, r), start, end);

  if (el.stroke) {
    ctx.strokeStyle = el.stroke;
    ctx.lineWidth = el.strokeWidth ?? 1;
    ctx.stroke();
  }
}

// ============ Physics Renderers ============

function renderSpring(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const x = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const y = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);
  const length = resolveDynamicValue(el.length, paramValues, computedValues) || 80;
  const coils = el.coils ?? 8;
  const amplitude = typeof el.amplitude === 'number' ? el.amplitude : 8;

  ctx.strokeStyle = el.stroke ?? '#6B7280';
  ctx.lineWidth = el.strokeWidth ?? 2;
  ctx.beginPath();
  ctx.moveTo(x, y);

  const segH = length / (coils * 2 + 2);
  ctx.lineTo(x, y + segH);
  for (let i = 0; i < coils; i++) {
    ctx.lineTo(x + amplitude, y + segH + (i * 2 + 1) * segH);
    ctx.lineTo(x - amplitude, y + segH + (i * 2 + 2) * segH);
  }
  ctx.lineTo(x, y + length);
  ctx.stroke();
}

function renderWave(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const x = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const y = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);
  const w = resolveDynamicValue(el.width, paramValues, computedValues) || 200;
  const amplitude = resolveDynamicValue(el.amplitude, paramValues, computedValues) || 20;
  const wavelength = resolveDynamicValue(el.wavelength, paramValues, computedValues) || 60;
  const phase = resolveDynamicValue(el.phase, paramValues, computedValues) || 0;

  ctx.strokeStyle = el.stroke ?? '#3B82F6';
  ctx.lineWidth = el.strokeWidth ?? 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  for (let i = 0; i <= w; i++) {
    ctx.lineTo(x + i, y + amplitude * Math.sin((2 * Math.PI * i) / wavelength + phase));
  }
  ctx.stroke();
}

function renderPendulum(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const ax = transformX(resolveDynamicValue(el.anchorX ?? el.x, paramValues, computedValues), layout);
  const ay = transformY(resolveDynamicValue(el.anchorY ?? el.y, paramValues, computedValues), layout);
  const length = resolveDynamicValue(el.length, paramValues, computedValues) || 100;
  const angle = resolveDynamicValue(el.angle, paramValues, computedValues) || 0;
  const bobR = el.bobRadius ?? 12;

  const bx = ax + length * Math.sin(angle * Math.PI / 180);
  const by = ay + length * Math.cos(angle * Math.PI / 180);

  ctx.strokeStyle = el.stroke ?? '#6B7280';
  ctx.lineWidth = el.strokeWidth ?? 2;
  ctx.beginPath();
  ctx.moveTo(ax, ay);
  ctx.lineTo(bx, by);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(bx, by, bobR, 0, Math.PI * 2);
  ctx.fillStyle = el.fill ?? '#3B82F6';
  ctx.fill();
  if (el.stroke) {
    ctx.strokeStyle = el.stroke;
    ctx.stroke();
  }
}

function renderForceArrow(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const x1 = transformX(resolveDynamicValue(el.dynamic?.x ?? el.x, paramValues, computedValues), layout);
  const y1 = transformY(resolveDynamicValue(el.dynamic?.y ?? el.y, paramValues, computedValues), layout);

  let x2: number;
  let y2: number;

  if (el.x2 !== undefined || el.dynamic?.x2) {
    // Explicit endpoint mode (used by buoyancy arrows)
    x2 = transformX(resolveDynamicValue(el.dynamic?.x2 ?? el.x2, paramValues, computedValues), layout);
    y2 = transformY(resolveDynamicValue(el.dynamic?.y2 ?? el.y2, paramValues, computedValues), layout);
  } else {
    // Angle + magnitude mode (legacy)
    const angle = resolveDynamicValue(el.angle, paramValues, computedValues) || -90;
    const magnitude = resolveDynamicValue(el.dynamic?.magnitude ?? el.magnitude, paramValues, computedValues) || 50;
    const rad = angle * Math.PI / 180;
    x2 = x1 + magnitude * Math.cos(rad);
    y2 = y1 + magnitude * Math.sin(rad);
  }

  const len = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  if (len < 2) return;

  ctx.strokeStyle = el.stroke ?? '#3B82F6';
  ctx.lineWidth = el.strokeWidth ?? 3;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();

  const headLen = Math.min(10, len * 0.4);
  const headAngle = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(headAngle - Math.PI / 6), y2 - headLen * Math.sin(headAngle - Math.PI / 6));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - headLen * Math.cos(headAngle + Math.PI / 6), y2 - headLen * Math.sin(headAngle + Math.PI / 6));
  ctx.stroke();

  if (el.label) {
    ctx.fillStyle = el.fill ?? el.stroke ?? '#3B82F6';
    ctx.font = `bold ${el.fontSize ?? 12}px system-ui`;
    ctx.fillText(el.label, x2 + 4, y2 + 4);
  }
}

function renderLightRay(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const x = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const y = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);
  const angle = resolveDynamicValue(el.angle, paramValues, computedValues) || 0;
  const length = resolveDynamicValue(el.length, paramValues, computedValues) || 100;
  const rad = angle * Math.PI / 180;

  ctx.strokeStyle = el.stroke ?? '#F59E0B';
  ctx.lineWidth = el.strokeWidth ?? 3;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + length * Math.cos(rad), y + length * Math.sin(rad));
  ctx.stroke();
}

// ============ Chemistry Renderers ============

function renderBeaker(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const x = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const y = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);
  const w = resolveDynamicValue(el.width, paramValues, computedValues) || 60;
  const h = resolveDynamicValue(el.height, paramValues, computedValues) || 80;
  const fillLevel = Math.max(0, Math.min(1, resolveDynamicValue(el.fillLevel, paramValues, computedValues) || 0.6));
  const liquidColor = el.liquidColor ?? '#06B6D4';

  const liquidH = h * fillLevel;
  ctx.fillStyle = liquidColor;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(x, y + h - liquidH, w, liquidH);
  ctx.globalAlpha = 1;

  ctx.strokeStyle = el.stroke ?? '#374151';
  ctx.lineWidth = el.strokeWidth ?? 2;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y);
  ctx.stroke();
}

function renderMolecule(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const x = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const y = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);
  const r = resolveDynamicValue(el.radius, paramValues, computedValues) || 8;

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = el.fill ?? '#3B82F6';
  ctx.fill();
  if (el.stroke) {
    ctx.strokeStyle = el.stroke;
    ctx.lineWidth = el.strokeWidth ?? 1;
    ctx.stroke();
  }

  if (el.label) {
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${el.fontSize ?? 10}px system-ui`;
    ctx.textAlign = 'center';
    ctx.fillText(el.label, x, y + 4);
    ctx.textAlign = 'left';
  }
}

function renderBubble(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const x = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const y = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);
  const r = resolveDynamicValue(el.radius, paramValues, computedValues) || 6;

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = el.stroke ?? '#06B6D4';
  ctx.lineWidth = el.strokeWidth ?? 1;
  ctx.globalAlpha = 0.7;
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function renderReaction(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const x = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const y = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);

  ctx.fillStyle = el.fill ?? '#374151';
  ctx.font = `${el.fontSize ?? 14}px system-ui`;
  const text = resolveDynamicString(el.text, paramValues, computedValues);
  ctx.fillText(text || '→', x, y);
}

// ============ Math Renderers ============

function renderAxis(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const x = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const y = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);
  const w = resolveDynamicValue(el.width, paramValues, computedValues) || 200;
  const h = resolveDynamicValue(el.height, paramValues, computedValues) || 150;

  ctx.strokeStyle = el.stroke ?? '#374151';
  ctx.lineWidth = el.strokeWidth ?? 1.5;

  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.stroke();

  const headLen = 8;
  ctx.beginPath();
  ctx.moveTo(x + w - headLen, y + h - 4);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w - headLen, y + h + 4);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - 4, y + headLen);
  ctx.lineTo(x, y);
  ctx.lineTo(x + 4, y + headLen);
  ctx.stroke();
}

function renderFunctionPlot(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  if (!el.fn) return;

  const x0 = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const y0 = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);
  const w = resolveDynamicValue(el.width, paramValues, computedValues) || 200;
  const h = resolveDynamicValue(el.height, paramValues, computedValues) || 150;
  const xMin = el.xMin ?? -5;
  const xMax = el.xMax ?? 5;
  const yMin = el.yMin ?? -5;
  const yMax = el.yMax ?? 5;

  const sanitized = el.fn.replace(/[^0-9x+\-*/().Math\s,]/g, '');
  let evalFn: (x: number) => number;
  try {
    evalFn = new Function('x', `with(Math){return ${sanitized};}`) as (x: number) => number;
  } catch {
    return;
  }

  ctx.strokeStyle = el.stroke ?? '#3B82F6';
  ctx.lineWidth = el.strokeWidth ?? 2;
  ctx.beginPath();

  const steps = Math.ceil(w);
  let started = false;
  for (let i = 0; i <= steps; i++) {
    const xVal = xMin + (i / steps) * (xMax - xMin);
    let yVal: number;
    try { yVal = evalFn(xVal); } catch { continue; }
    if (!isFinite(yVal)) { started = false; continue; }

    const px = x0 + (i / steps) * w;
    const py = y0 + h - ((yVal - yMin) / (yMax - yMin)) * h;

    if (!started) { ctx.moveTo(px, py); started = true; }
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function renderPoint(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const x = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const y = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);
  const size = resolveDynamicValue(el.radius, paramValues, computedValues) || 4;

  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fillStyle = el.fill ?? '#374151';
  ctx.fill();
}

function renderGroup(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  if (!el.children?.length) return;
  ctx.save();
  for (const child of el.children) {
    renderElement(ctx, child, layout, paramValues, computedValues);
  }
  ctx.restore();
}

// ============ Placeholder for Unknown Types ============

function renderPlaceholder(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number>
) {
  const x = transformX(resolveDynamicValue(el.x, paramValues, computedValues), layout);
  const y = transformY(resolveDynamicValue(el.y, paramValues, computedValues), layout);
  const w = resolveDynamicValue(el.width, paramValues, computedValues) || 60;
  const h = resolveDynamicValue(el.height, paramValues, computedValues) || 40;

  ctx.strokeStyle = '#9CA3AF';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(x, y, w, h);
  ctx.setLineDash([]);

  ctx.fillStyle = '#9CA3AF';
  ctx.font = '11px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(`?${el.type}`, x + w / 2, y + h / 2 + 4);
  ctx.textAlign = 'left';
}

// ============ Element Type Dispatch ============

const RENDERERS: Record<ElementType, typeof renderRect> = {
  // Base geometry
  rect: renderRect,
  circle: renderCircle,
  line: renderLine,
  arrow: renderArrow,
  text: renderText,
  polygon: renderPolygon,
  arc: renderArc,
  image: renderPlaceholder,
  // Physics-specific
  spring: renderSpring,
  wave: renderWave,
  pendulum: renderPendulum,
  forceArrow: renderForceArrow,
  lightRay: renderLightRay,
  // Chemistry-specific
  beaker: renderBeaker,
  molecule: renderMolecule,
  bubble: renderBubble,
  reaction: renderReaction,
  // Math-specific
  axis: renderAxis,
  functionPlot: renderFunctionPlot,
  point: renderPoint,
  // Composite
  group: renderGroup,
};

// ============ Main Render Function ============

export function renderElement(
  ctx: CanvasRenderingContext2D,
  el: CanvasElement,
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number> = {}
) {
  if (el.visible === false) return;

  ctx.save();
  if (el.opacity !== undefined) ctx.globalAlpha = el.opacity;

  const renderer = RENDERERS[el.type] ?? renderPlaceholder;
  renderer(ctx, el, layout, paramValues, computedValues);

  if (el.children) {
    for (const child of el.children) {
      renderElement(ctx, child, layout, paramValues, computedValues);
    }
  }

  ctx.restore();
}

export function renderElements(
  ctx: CanvasRenderingContext2D,
  elements: CanvasElement[],
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number> = {}
) {
  for (const el of elements) {
    renderElement(ctx, el, layout, paramValues, computedValues);
  }
}

export function renderCanvas(
  ctx: CanvasRenderingContext2D,
  elements: CanvasElement[],
  layout: CanvasLayout,
  paramValues: Record<string, number>,
  computedValues: Record<string, number> = {},
  options?: {
    ambientAnimator?: AmbientAnimator;
    ambientAnimations?: AmbientAnimation[];
    dynamicsVars?: Record<string, number>;
  }
) {
  ctx.clearRect(0, 0, layout.width, layout.height);

  if (layout.background) {
    ctx.fillStyle = layout.background;
    ctx.fillRect(0, 0, layout.width, layout.height);
  }

  if (layout.grid?.show) {
    ctx.strokeStyle = layout.grid.color;
    ctx.lineWidth = 0.5;
    for (let x = 0; x < layout.width; x += layout.grid.spacing) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, layout.height);
      ctx.stroke();
    }
    for (let y = 0; y < layout.height; y += layout.grid.spacing) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(layout.width, y);
      ctx.stroke();
    }
  }

  // Merge dynamics position overrides into computedValues before rendering elements
  const mergedComputed = options?.dynamicsVars
    ? { ...computedValues, ...options.dynamicsVars }
    : computedValues;

  // Draw ambient animations BEFORE foreground elements (background layer)
  if (options?.ambientAnimator && options.ambientAnimations?.length) {
    options.ambientAnimator.draw(ctx, options.ambientAnimations, mergedComputed);
  }

  renderElements(ctx, elements, layout, paramValues, mergedComputed);
}
