/**
 * Circuit domain drawers — one function per component kind.
 *
 * Register with ComponentMirror.register('circuit', kind, drawFn).
 *
 * Convention:
 *   - Each drawer reads componentDTO.anchor for position
 *   - Orientation: horizontal (left→right) by default
 *   - Size: ~60x40 nominal
 *   - Solved values (from result.perComponent[id]): may be undefined on first paint
 *
 * Colours:
 *   - base stroke: #0F172A
 *   - battery pos/neg: #DC2626 / #1E3A8A
 *   - current >0 active: tinted
 */

(function () {
  'use strict';

  if (!window.ComponentMirror) {
    console.error('[circuit-draw] ComponentMirror not loaded — load component-mirror.js first');
    return;
  }

  const M = window.ComponentMirror;
  const STROKE = '#0F172A';
  const LBL = '#334155';

  function drawLabel(ctx, x, y, text, color) {
    ctx.save();
    ctx.fillStyle = color || LBL;
    ctx.font = '11px sans-serif';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  // ── Battery ──────────────────────────────────────────────────────────
  M.register('circuit', 'battery', function (ctx, c, v) {
    const ax = (c.anchor && c.anchor.x) || 0;
    const ay = (c.anchor && c.anchor.y) || 0;
    const voltage = (c.props && c.props.voltage) || 0;
    ctx.save();
    // Long + line (positive)
    ctx.strokeStyle = '#DC2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(ax + 20, ay + 5);
    ctx.lineTo(ax + 20, ay + 35);
    ctx.stroke();
    // Short - line (negative)
    ctx.strokeStyle = '#1E3A8A';
    ctx.beginPath();
    ctx.moveTo(ax + 30, ay + 12);
    ctx.lineTo(ax + 30, ay + 28);
    ctx.stroke();
    // Lead wires
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay + 20); ctx.lineTo(ax + 20, ay + 20);
    ctx.moveTo(ax + 30, ay + 20); ctx.lineTo(ax + 50, ay + 20);
    ctx.stroke();
    // Label
    drawLabel(ctx, ax + 10, ay - 2, voltage.toFixed(1) + ' V');
    drawLabel(ctx, ax + 15, ay + 50, c.id, '#64748B');
    ctx.restore();
  });

  // ── Wire ─────────────────────────────────────────────────────────────
  M.register('circuit', 'wire', function (ctx, c) {
    const ax = (c.anchor && c.anchor.x) || 0;
    const ay = (c.anchor && c.anchor.y) || 0;
    ctx.save();
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay + 20); ctx.lineTo(ax + 50, ay + 20);
    ctx.stroke();
    ctx.restore();
  });

  // ── Switch ───────────────────────────────────────────────────────────
  M.register('circuit', 'switch', function (ctx, c) {
    const ax = (c.anchor && c.anchor.x) || 0;
    const ay = (c.anchor && c.anchor.y) || 0;
    const closed = !!(c.props && c.props.closed);
    ctx.save();
    // Lead wires
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay + 20); ctx.lineTo(ax + 15, ay + 20);
    ctx.moveTo(ax + 35, ay + 20); ctx.lineTo(ax + 50, ay + 20);
    ctx.stroke();
    // Contact dots
    ctx.fillStyle = STROKE;
    ctx.beginPath(); ctx.arc(ax + 15, ay + 20, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(ax + 35, ay + 20, 2.5, 0, Math.PI * 2); ctx.fill();
    // Switch blade
    ctx.strokeStyle = closed ? '#16A34A' : '#DC2626';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (closed) {
      ctx.moveTo(ax + 15, ay + 20); ctx.lineTo(ax + 35, ay + 20);
    } else {
      ctx.moveTo(ax + 15, ay + 20); ctx.lineTo(ax + 33, ay + 8);
    }
    ctx.stroke();
    drawLabel(ctx, ax + 10, ay + 50, c.id + (closed ? ' ✓' : ' ✗'), '#64748B');
    ctx.restore();
  });

  // ── Resistor ─────────────────────────────────────────────────────────
  M.register('circuit', 'resistor', function (ctx, c, v) {
    const ax = (c.anchor && c.anchor.x) || 0;
    const ay = (c.anchor && c.anchor.y) || 0;
    const R = (c.props && c.props.resistance) || 0;
    const I = (v && v.current) || 0;
    ctx.save();
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = 1.5;
    // Leads
    ctx.beginPath();
    ctx.moveTo(ax, ay + 20); ctx.lineTo(ax + 10, ay + 20);
    ctx.moveTo(ax + 40, ay + 20); ctx.lineTo(ax + 50, ay + 20);
    ctx.stroke();
    // Zigzag body
    ctx.beginPath();
    ctx.moveTo(ax + 10, ay + 20);
    const xs = [13, 16, 19, 22, 25, 28, 31, 34, 37, 40];
    const ys = [14, 26, 14, 26, 14, 26, 14, 26, 14, 20];
    for (let i = 0; i < xs.length; i++) ctx.lineTo(ax + xs[i], ay + ys[i]);
    ctx.stroke();
    // Label
    drawLabel(ctx, ax + 12, ay - 2, R.toFixed(1) + 'Ω');
    drawLabel(ctx, ax + 10, ay + 50, c.id + ' · ' + I.toFixed(3) + 'A', '#64748B');
    ctx.restore();
  });

  // ── Bulb ─────────────────────────────────────────────────────────────
  M.register('circuit', 'bulb', function (ctx, c, v) {
    const ax = (c.anchor && c.anchor.x) || 0;
    const ay = (c.anchor && c.anchor.y) || 0;
    const glow = Math.max(0, Math.min(1.5, (v && v.glow) || 0));
    const state = (v && v.state) || 'normal';
    ctx.save();
    // Lead wires
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay + 20); ctx.lineTo(ax + 15, ay + 20);
    ctx.moveTo(ax + 35, ay + 20); ctx.lineTo(ax + 50, ay + 20);
    ctx.stroke();
    // Bulb body
    const cx = ax + 25, cy = ay + 20;
    const intensity = Math.min(1, glow);
    const yellowish = 'rgba(250, 204, 21, ' + intensity + ')';
    ctx.fillStyle = yellowish;
    ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = state === 'overload' ? '#DC2626' : STROKE;
    ctx.lineWidth = 2;
    ctx.stroke();
    // Cross filament
    ctx.strokeStyle = '#7C2D12';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy - 8); ctx.lineTo(cx + 8, cy + 8);
    ctx.moveTo(cx - 8, cy + 8); ctx.lineTo(cx + 8, cy - 8);
    ctx.stroke();
    // Label
    drawLabel(ctx, ax + 15, ay + 50, c.id, '#64748B');
    if (state === 'overload') drawLabel(ctx, ax + 2, ay - 4, '⚠ 过载', '#DC2626');
    ctx.restore();
  });

  // ── BurntBulb ────────────────────────────────────────────────────────
  M.register('circuit', 'burnt_bulb', function (ctx, c) {
    const ax = (c.anchor && c.anchor.x) || 0;
    const ay = (c.anchor && c.anchor.y) || 0;
    ctx.save();
    // Dimmer, black smoke
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay + 20); ctx.lineTo(ax + 15, ay + 20);
    ctx.moveTo(ax + 35, ay + 20); ctx.lineTo(ax + 50, ay + 20);
    ctx.stroke();
    const cx = ax + 25, cy = ay + 20;
    ctx.fillStyle = '#1F2937';
    ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.fill();
    // Crossed-out filament
    ctx.strokeStyle = '#F87171';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 10); ctx.lineTo(cx + 10, cy + 10);
    ctx.moveTo(cx - 10, cy + 10); ctx.lineTo(cx + 10, cy - 10);
    ctx.stroke();
    drawLabel(ctx, ax + 5, ay - 4, '💥 烧毁', '#DC2626');
    drawLabel(ctx, ax + 15, ay + 50, c.id, '#64748B');
    ctx.restore();
  });

  // ── Ammeter ──────────────────────────────────────────────────────────
  M.register('circuit', 'ammeter', function (ctx, c, v) {
    const ax = (c.anchor && c.anchor.x) || 0;
    const ay = (c.anchor && c.anchor.y) || 0;
    const I = (v && v.current) || 0;
    ctx.save();
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay + 20); ctx.lineTo(ax + 13, ay + 20);
    ctx.moveTo(ax + 37, ay + 20); ctx.lineTo(ax + 50, ay + 20);
    ctx.stroke();
    ctx.fillStyle = '#E0F2FE';
    ctx.beginPath(); ctx.arc(ax + 25, ay + 20, 12, 0, Math.PI * 2); ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#0369A1';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('A', ax + 22, ay + 23);
    drawLabel(ctx, ax + 2, ay + 50, c.id + ' · ' + I.toFixed(3) + 'A', '#64748B');
    ctx.restore();
  });

  // ── Voltmeter ────────────────────────────────────────────────────────
  M.register('circuit', 'voltmeter', function (ctx, c, v) {
    const ax = (c.anchor && c.anchor.x) || 0;
    const ay = (c.anchor && c.anchor.y) || 0;
    const U = (v && v.voltage) || 0;
    ctx.save();
    ctx.strokeStyle = STROKE;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(ax, ay + 20); ctx.lineTo(ax + 13, ay + 20);
    ctx.moveTo(ax + 37, ay + 20); ctx.lineTo(ax + 50, ay + 20);
    ctx.stroke();
    ctx.fillStyle = '#FEF3C7';
    ctx.beginPath(); ctx.arc(ax + 25, ay + 20, 12, 0, Math.PI * 2); ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#92400E';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText('V', ax + 22, ay + 23);
    drawLabel(ctx, ax + 2, ay + 50, c.id + ' · ' + U.toFixed(2) + 'V', '#64748B');
    ctx.restore();
  });

  window.__EUREKA_CIRCUIT_DRAW_LOADED = true;
})();
