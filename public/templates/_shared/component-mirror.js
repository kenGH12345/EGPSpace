/**
 * ComponentMirror — browser-side per-component dispatch table for rendering.
 *
 * The engine returns `result.perComponent[id] = {current, voltage, power, ...}`.
 * Templates don't draw a "single canvas blob" anymore — they iterate components
 * and let ComponentMirror pick the right draw function by kind.
 *
 * Usage:
 *   window.ComponentMirror.register('circuit', 'battery', (ctx, comp, values) => {...});
 *   window.ComponentMirror.renderAll(ctx, dto.components, result.perComponent);
 *
 * Design:
 *   - Domain-agnostic: same mirror supports circuit, optics (future), chemistry (future)
 *   - Dispatch key: `${domain}/${kind}` — same convention as componentRegistry on the TS side
 *   - Draw functions receive (ctx, componentDTO, solvedValues) — no globals
 */

(function () {
  'use strict';

  const drawers = new Map(); // `${domain}/${kind}` → draw function

  function keyOf(domain, kind) {
    return domain + '/' + kind;
  }

  const ComponentMirror = {
    /** Register a draw function for (domain, kind). */
    register: function (domain, kind, drawFn) {
      if (typeof drawFn !== 'function') {
        throw new Error('ComponentMirror.register: drawFn must be a function');
      }
      drawers.set(keyOf(domain, kind), drawFn);
    },

    /** Check if a (domain, kind) has a registered drawer. */
    has: function (domain, kind) {
      return drawers.has(keyOf(domain, kind));
    },

    /**
     * Draw a single component.
     * @param {CanvasRenderingContext2D} ctx
     * @param {Object} componentDTO {id, domain, kind, props, anchor}
     * @param {Object} solvedValues {current, voltage, power, ...} — may be empty on first render
     */
    draw: function (ctx, componentDTO, solvedValues) {
      const drawer = drawers.get(keyOf(componentDTO.domain, componentDTO.kind));
      if (!drawer) {
        // Visible placeholder so missing drawers are obvious during dev
        ctx.save();
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(
          (componentDTO.anchor && componentDTO.anchor.x) || 0,
          (componentDTO.anchor && componentDTO.anchor.y) || 0,
          30, 30,
        );
        ctx.fillStyle = '#7f1d1d';
        ctx.font = '10px sans-serif';
        ctx.fillText('?' + componentDTO.kind, (componentDTO.anchor && componentDTO.anchor.x) || 0, ((componentDTO.anchor && componentDTO.anchor.y) || 0) + 40);
        ctx.restore();
        return;
      }
      try {
        drawer(ctx, componentDTO, solvedValues || {});
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[ComponentMirror] drawer for ' + keyOf(componentDTO.domain, componentDTO.kind) + ' threw:', err);
      }
    },

    /**
     * Draw all components in a DTO list, consulting a perComponent solved map.
     */
    renderAll: function (ctx, components, perComponent) {
      if (!components || !components.length) return;
      for (let i = 0; i < components.length; i++) {
        const c = components[i];
        const vals = perComponent && perComponent[c.id] ? perComponent[c.id] : {};
        this.draw(ctx, c, vals);
      }
    },

    /** Debug: enumerate registered keys. */
    list: function () {
      return [...drawers.keys()];
    },
  };

  window.ComponentMirror = ComponentMirror;
  window.__EUREKA_COMPONENT_MIRROR_LOADED = true;
})();
