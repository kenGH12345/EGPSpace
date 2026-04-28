/* Eureka Physics Draw — reusable Canvas 2D drawing atoms for physics templates.
 *
 * Extracted from the inline drawing code of public/templates/physics/*.html
 * (primarily buoyancy.html:156-306) into subject-agnostic primitives that
 * v2-atomic templates can compose.
 *
 * All functions:
 *  - Do not clear the canvas (caller owns ctx.clearRect)
 *  - Do not touch globalAlpha outside their own block (save/restore)
 *  - Accept plain option objects for future-proofing
 *  - Are pure w.r.t. inputs (no module-level state)
 *
 * Loaded with <script src="/templates/_shared/physics-draw.js"></script>
 */

(function () {
  'use strict';

  /**
   * drawBeaker — a simple 3-sided beaker outline.
   * opts: { left, right, bottom, top, color='#64748B', lineWidth=2, label='烧杯' }
   */
  function drawBeaker(ctx, opts) {
    const left = opts.left;
    const right = opts.right;
    const bottom = opts.bottom;
    const top = opts.top;
    const color = opts.color || '#64748B';

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = opts.lineWidth || 2;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.lineTo(right, top);
    ctx.stroke();

    if (opts.label) {
      ctx.font = '11px system-ui';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(opts.label, (left + right) / 2, bottom + 14);
      ctx.textAlign = 'left';
    }
    ctx.restore();
  }

  /**
   * drawLiquidFill — draw a translucent liquid body with an optional dashed surface line.
   * opts: { x, y, width, height, color='#06B6D4', alpha=0.5,
   *         drawSurface=true, surfaceColor='#0EA5E9' }
   */
  function drawLiquidFill(ctx, opts) {
    const x = opts.x || 0;
    const y = opts.y;
    const width = opts.width;
    const height = opts.height;
    const color = opts.color || '#06B6D4';
    const alpha = opts.alpha !== undefined ? opts.alpha : 0.5;

    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(x, y, width, height);
    ctx.globalAlpha = 1;

    if (opts.drawSurface !== false) {
      ctx.strokeStyle = opts.surfaceColor || '#0EA5E9';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.restore();
  }

  /**
   * drawGradientBlock — a coloured rectangle with hue gradient, centered text and subtext.
   * Used for "object in liquid" in buoyancy, or generic labeled physical body.
   * opts: { x, y, width, height, hue, text, subtext, stroke='#333' }
   */
  function drawGradientBlock(ctx, opts) {
    const x = opts.x;
    const y = opts.y;
    const w = opts.width;
    const h = opts.height;
    const hue = opts.hue !== undefined ? opts.hue : 200;

    ctx.save();
    const grad = ctx.createLinearGradient(x, y, x + w, y);
    grad.addColorStop(0, 'hsl(' + hue + ', 70%, 55%)');
    grad.addColorStop(1, 'hsl(' + hue + ', 70%, 35%)');
    ctx.fillStyle = grad;
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

    if (opts.stroke !== 'none') {
      ctx.strokeStyle = opts.stroke || '#333';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);
    }

    if (opts.text) {
      ctx.font = 'bold 11px system-ui';
      ctx.fillStyle = '#FFF';
      ctx.textAlign = 'center';
      ctx.fillText(opts.text, x + w / 2, y + h / 2);
      if (opts.subtext) {
        ctx.font = '10px system-ui';
        ctx.fillText(opts.subtext, x + w / 2, y + h / 2 + 14);
      }
      ctx.textAlign = 'left';
    }
    ctx.restore();
  }

  /**
   * drawForceArrow — vertical force arrow with magnitude-scaled length and thickness.
   * opts: { x, y, magnitude, direction: 'up'|'down', color, label,
   *         maxLen=80, maxThick=8, lenScale=3, thickScale=15 }
   */
  function drawForceArrow(ctx, opts) {
    const x = opts.x;
    const y = opts.y;
    const mag = Math.abs(opts.magnitude || 0);
    if (mag <= 0) return;

    const direction = opts.direction || 'up';
    const color = opts.color || (direction === 'up' ? '#3B82F6' : '#EF4444');
    const maxLen = opts.maxLen || 80;
    const maxThick = opts.maxThick || 8;
    const lenScale = opts.lenScale || 3;
    const thickScale = opts.thickScale || 15;

    const arrowLen = Math.min(maxLen, mag / lenScale);
    const arrowThick = Math.max(2, Math.min(maxThick, mag / thickScale));

    const tipY = direction === 'up' ? y - arrowLen : y + arrowLen;
    const headSide = direction === 'up' ? 15 : -15;

    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = arrowThick;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, tipY);
    ctx.stroke();

    // Triangle head
    ctx.beginPath();
    ctx.moveTo(x, tipY);
    ctx.lineTo(x - 10, tipY + headSide);
    ctx.lineTo(x + 10, tipY + headSide);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    if (opts.label) {
      ctx.font = 'bold 12px system-ui';
      ctx.fillStyle = color;
      const labelY = direction === 'up' ? y - arrowLen / 2 : y + arrowLen / 2 + 5;
      ctx.fillText(opts.label, x + 12, labelY);
    }
    ctx.restore();
  }

  /**
   * drawStateBadge — small coloured pill for canvas-level state labels.
   * opts: { x, y, text, kind: 'success'|'danger'|'info'|'warning' }
   */
  function drawStateBadge(ctx, opts) {
    const x = opts.x;
    const y = opts.y;
    const text = opts.text || '';
    const kind = opts.kind || 'info';

    const palette = {
      success: { bg: '#DCFCE7', fg: '#059669' },
      danger:  { bg: '#FEE2E2', fg: '#DC2626' },
      info:    { bg: '#DBEAFE', fg: '#2563EB' },
      warning: { bg: '#FEF3C7', fg: '#D97706' },
    };
    const c = palette[kind] || palette.info;

    ctx.save();
    ctx.font = 'bold 13px system-ui';
    const padX = 8;
    const padY = 4;
    const m = ctx.measureText(text);
    const w = m.width + padX * 2;
    const h = 22;

    ctx.fillStyle = c.bg;
    _roundRect(ctx, x, y, w, h, 6);
    ctx.fill();

    ctx.fillStyle = c.fg;
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + padX, y + h / 2);
    ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }

  function _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  window.EurekaPhysicsDraw = {
    drawBeaker,
    drawLiquidFill,
    drawGradientBlock,
    drawForceArrow,
    drawStateBadge,
  };
})();
