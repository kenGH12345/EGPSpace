/* Eureka Chemistry Draw — Canvas 2D drawing atoms for chemistry templates.
 *
 * Extracted from public/templates/chemistry/*.html into subject-agnostic
 * primitives for v2-atomic templates.
 *
 * Loaded with <script src="/templates/_shared/chemistry-draw.js"></script>
 */

(function () {
  'use strict';

  /**
   * drawBeakerWithLiquid — beaker outline + filled liquid level.
   * opts: { left, right, bottom, top, liquidColor, level,
   *         strokeColor='#64748B', fillAlpha=1.0, label }
   * `level`: 0..1 — fraction of (bottom - top) filled from bottom.
   */
  function drawBeakerWithLiquid(ctx, opts) {
    const left = opts.left;
    const right = opts.right;
    const bottom = opts.bottom;
    const top = opts.top;
    const level = Math.max(0, Math.min(1, opts.level || 0));
    const liquidColor = opts.liquidColor || '#06B6D4';
    const strokeColor = opts.strokeColor || '#64748B';

    ctx.save();

    // Liquid fill
    if (level > 0) {
      const liqTop = bottom - (bottom - top) * level;
      ctx.fillStyle = liquidColor;
      ctx.globalAlpha = opts.fillAlpha !== undefined ? opts.fillAlpha : 1.0;
      ctx.fillRect(left + 1, liqTop, right - left - 2, bottom - liqTop - 1);
      ctx.globalAlpha = 1;
    }

    // Beaker outline (3-sided)
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(left, top);
    ctx.lineTo(left, bottom);
    ctx.lineTo(right, bottom);
    ctx.lineTo(right, top);
    ctx.stroke();

    if (opts.label) {
      ctx.font = '11px system-ui';
      ctx.fillStyle = strokeColor;
      ctx.textAlign = 'center';
      ctx.fillText(opts.label, (left + right) / 2, bottom + 14);
      ctx.textAlign = 'left';
    }
    ctx.restore();
  }

  /**
   * drawBurette — vertical thin tube with fill level, for titration setups.
   * opts: { x, y, height, width=16, fillLevel, fillColor='#A78BFA',
   *         strokeColor='#475569', label }
   * `fillLevel`: 0..1 from bottom.
   */
  function drawBurette(ctx, opts) {
    const x = opts.x;
    const y = opts.y;
    const height = opts.height;
    const width = opts.width || 16;
    const level = Math.max(0, Math.min(1, opts.fillLevel || 0));
    const fillColor = opts.fillColor || '#A78BFA';
    const strokeColor = opts.strokeColor || '#475569';

    ctx.save();

    if (level > 0) {
      const liqH = height * level;
      ctx.fillStyle = fillColor;
      ctx.fillRect(x + 1, y + height - liqH, width - 2, liqH);
    }

    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, width, height);

    // Nozzle (bottom spout)
    ctx.beginPath();
    ctx.moveTo(x, y + height);
    ctx.lineTo(x + width / 2 - 2, y + height + 6);
    ctx.lineTo(x + width / 2 + 2, y + height + 6);
    ctx.lineTo(x + width, y + height);
    ctx.stroke();

    if (opts.label) {
      ctx.font = '10px system-ui';
      ctx.fillStyle = strokeColor;
      ctx.textAlign = 'center';
      ctx.fillText(opts.label, x + width / 2, y - 4);
      ctx.textAlign = 'left';
    }
    ctx.restore();
  }

  /**
   * drawIndicatorDrop — small translucent circle at (x,y), used for dripping drops.
   * opts: { x, y, radius=4, color='#EC4899', alpha=0.7 }
   */
  function drawIndicatorDrop(ctx, opts) {
    const radius = opts.radius || 4;
    ctx.save();
    ctx.fillStyle = opts.color || '#EC4899';
    ctx.globalAlpha = opts.alpha !== undefined ? opts.alpha : 0.7;
    ctx.beginPath();
    ctx.arc(opts.x, opts.y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /**
   * drawPhScale — pH gradient bar with current-value marker.
   * opts: { x, y, width, currentPh, min=0, max=14,
   *         height=14, vertical=false }
   */
  function drawPhScale(ctx, opts) {
    const x = opts.x;
    const y = opts.y;
    const width = opts.width;
    const height = opts.height || 14;
    const min = opts.min !== undefined ? opts.min : 0;
    const max = opts.max !== undefined ? opts.max : 14;
    const current = Math.max(min, Math.min(max, opts.currentPh || 0));
    const vertical = !!opts.vertical;

    ctx.save();
    // Gradient: red (acid) → yellow (neutral) → blue (base)
    const grad = vertical
      ? ctx.createLinearGradient(x, y + height, x, y)
      : ctx.createLinearGradient(x, y, x + width, y);
    grad.addColorStop(0.0, '#DC2626');
    grad.addColorStop(0.5, '#FDE047');
    grad.addColorStop(1.0, '#2563EB');

    ctx.fillStyle = grad;
    if (vertical) {
      ctx.fillRect(x, y, height, width);
    } else {
      ctx.fillRect(x, y, width, height);
    }

    // Marker position
    const t = (current - min) / (max - min);
    const markerX = vertical ? x + height / 2 : x + t * width;
    const markerY = vertical ? y + (1 - t) * width : y + height / 2;

    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (vertical) {
      ctx.moveTo(x - 2, markerY);
      ctx.lineTo(x + height + 2, markerY);
    } else {
      ctx.moveTo(markerX, y - 2);
      ctx.lineTo(markerX, y + height + 2);
    }
    ctx.stroke();

    // Endpoint labels
    ctx.font = '10px system-ui';
    ctx.fillStyle = '#374151';
    if (vertical) {
      ctx.fillText(String(min), x + height + 4, y + width);
      ctx.fillText(String(max), x + height + 4, y + 8);
    } else {
      ctx.fillText(String(min), x - 12, y + height + 10);
      ctx.fillText(String(max), x + width + 4, y + height + 10);
      ctx.font = 'bold 10px system-ui';
      ctx.fillText('pH ' + current.toFixed(2), markerX - 20, y - 4);
    }
    ctx.restore();
  }

  window.EurekaChemistryDraw = {
    drawBeakerWithLiquid,
    drawBurette,
    drawIndicatorDrop,
    drawPhScale,
  };
})();
