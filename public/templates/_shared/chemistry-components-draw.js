/**
 * Chemistry domain drawers — one function per component kind.
 *
 * Conventions mirror circuit-draw.js:
 *   - Each drawer reads componentDTO.anchor for position
 *   - Defaults assume a 60x80 vertical layout
 *   - Solved values from result.perComponent[id] may be undefined on first paint
 *
 * Visual language:
 *   - Flask: outlined glassware with a fill gradient based on contents count
 *   - Reagent: coloured pill with formula text; colour keyed to phase
 *   - Bubble: translucent circle above the source flask, size = accumulatedMoles
 *   - Solid: solid rectangle with formula text; tint keyed to solidState
 *   - Thermometer: vertical bar + tempC label
 */

(function () {
  'use strict';
  if (!window.ComponentMirror) {
    console.error('[chemistry-draw] ComponentMirror not loaded');
    return;
  }
  const M = window.ComponentMirror;
  const STROKE = '#0F172A';
  const LBL = '#334155';

  const PHASE_COLOR = {
    aq: '#60A5FA',
    l: '#93C5FD',
    s: '#A1A1AA',
    g: '#FBBF24',
  };

  function drawLabel(ctx, x, y, text, color, size) {
    ctx.save();
    ctx.fillStyle = color || LBL;
    ctx.font = (size || 11) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
    ctx.restore();
  }

  // ── Flask ─────────────────────────────────────────────────────────────
  M.register('chemistry', 'flask', function (ctx, c /* , v */) {
    const ax = (c.anchor && c.anchor.x) || 0;
    const ay = (c.anchor && c.anchor.y) || 0;
    const volume = (c.props && c.props.volumeML) || 100;
    const shape = (c.props && c.props.shape) || 'beaker';
    ctx.save();
    ctx.strokeStyle = STROKE;
    ctx.fillStyle = '#E0F2FE';
    ctx.lineWidth = 2;

    if (shape === 'beaker') {
      // Rectangular beaker
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(ax, ay + 80);
      ctx.lineTo(ax + 60, ay + 80);
      ctx.lineTo(ax + 60, ay);
      ctx.stroke();
      ctx.fillRect(ax + 1, ay + 30, 58, 49);
    } else if (shape === 'tube') {
      // Narrow test tube
      ctx.beginPath();
      ctx.moveTo(ax + 10, ay);
      ctx.lineTo(ax + 10, ay + 80);
      ctx.quadraticCurveTo(ax + 25, ay + 90, ax + 40, ay + 80);
      ctx.lineTo(ax + 40, ay);
      ctx.stroke();
      ctx.fillRect(ax + 11, ay + 40, 28, 42);
    } else {
      // Erlenmeyer: triangular flask
      ctx.beginPath();
      ctx.moveTo(ax + 20, ay);
      ctx.lineTo(ax + 20, ay + 25);
      ctx.lineTo(ax, ay + 80);
      ctx.lineTo(ax + 60, ay + 80);
      ctx.lineTo(ax + 40, ay + 25);
      ctx.lineTo(ax + 40, ay);
      ctx.stroke();
    }
    drawLabel(ctx, ax + 30, ay + 95, (c.id + ' ' + volume + 'mL'), LBL, 10);
    ctx.restore();
  });

  // ── Reagent ───────────────────────────────────────────────────────────
  M.register('chemistry', 'reagent', function (ctx, c, v) {
    const ax = (c.anchor && c.anchor.x) || 0;
    const ay = (c.anchor && c.anchor.y) || 0;
    const formula = (c.props && c.props.formula) || '?';
    const moles = v && typeof v.moles === 'number' ? v.moles : (c.props && c.props.moles) || 0;
    const phase = (c.props && c.props.phase) || 'aq';
    const state = v && v.state;
    ctx.save();
    ctx.fillStyle = PHASE_COLOR[phase] || '#94A3B8';
    ctx.globalAlpha = state === 'exhausted' ? 0.25 : 0.85;
    ctx.beginPath();
    ctx.roundRect(ax, ay, 80, 22, 11);
    ctx.fill();
    ctx.globalAlpha = 1;
    drawLabel(ctx, ax + 40, ay + 14, formula + ' (' + moles.toFixed(2) + 'mol)', '#0F172A', 10);
    ctx.restore();
  });

  // ── Bubble ────────────────────────────────────────────────────────────
  M.register('chemistry', 'bubble', function (ctx, c, v) {
    const ax = (c.anchor && c.anchor.x) || 0;
    const ay = (c.anchor && c.anchor.y) || 0;
    const accumulated = v && typeof v.moles === 'number'
      ? v.moles
      : ((c.props && c.props.accumulatedMoles) || 0);
    const radius = Math.min(20, 5 + Math.sqrt(accumulated * 50));
    ctx.save();
    ctx.strokeStyle = '#0EA5E9';
    ctx.fillStyle = 'rgba(14, 165, 233, 0.22)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(ax + 30, ay + 30, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    const gas = (c.props && c.props.gas) || '?';
    drawLabel(ctx, ax + 30, ay + 30 + radius + 12, gas + '↑ ' + accumulated.toFixed(3) + 'mol', '#0369A1', 10);
    ctx.restore();
  });

  // ── Solid ─────────────────────────────────────────────────────────────
  M.register('chemistry', 'solid', function (ctx, c, v) {
    const ax = (c.anchor && c.anchor.x) || 0;
    const ay = (c.anchor && c.anchor.y) || 0;
    const formula = (c.props && c.props.formula) || '?';
    const massG = (c.props && c.props.massG) || 0;
    const solidState = (v && v.solidState) || (c.props && c.props.state) || 'intact';
    const tint =
      solidState === 'dissolved' ? '#E5E7EB'
        : solidState === 'rusting' ? '#A16207'
          : '#6B7280';
    ctx.save();
    ctx.fillStyle = tint;
    ctx.fillRect(ax, ay, 40, 18);
    drawLabel(ctx, ax + 20, ay + 13, formula + ' ' + massG.toFixed(1) + 'g', '#F9FAFB', 10);
    if (solidState === 'rusting') {
      drawLabel(ctx, ax + 20, ay + 30, '⚠ rusting', '#92400E', 9);
    }
    if (solidState === 'dissolved') {
      drawLabel(ctx, ax + 20, ay + 30, '(dissolved)', '#6B7280', 9);
    }
    ctx.restore();
  });

  // ── Thermometer ───────────────────────────────────────────────────────
  M.register('chemistry', 'thermometer', function (ctx, c) {
    const ax = (c.anchor && c.anchor.x) || 0;
    const ay = (c.anchor && c.anchor.y) || 0;
    const tempC = (c.props && c.props.tempC) || 0;
    ctx.save();
    ctx.strokeStyle = STROKE;
    ctx.fillStyle = '#DC2626';
    ctx.lineWidth = 1.5;
    // Bar
    ctx.strokeRect(ax + 5, ay + 5, 6, 40);
    // Fill proportional to temp 0..100
    const fillPct = Math.max(0, Math.min(1, tempC / 100));
    ctx.fillRect(ax + 6, ay + 44 - 38 * fillPct, 4, 38 * fillPct);
    // Bulb
    ctx.beginPath();
    ctx.arc(ax + 8, ay + 50, 6, 0, Math.PI * 2);
    ctx.fill();
    drawLabel(ctx, ax + 8, ay + 70, tempC.toFixed(0) + '°C', LBL, 10);
    ctx.restore();
  });

  // Polyfill roundRect for older canvas contexts
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      const rr = Math.min(r, w / 2, h / 2);
      this.beginPath();
      this.moveTo(x + rr, y);
      this.arcTo(x + w, y, x + w, y + h, rr);
      this.arcTo(x + w, y + h, x, y + h, rr);
      this.arcTo(x, y + h, x, y, rr);
      this.arcTo(x, y, x + w, y, rr);
      this.closePath();
    };
  }
})();
