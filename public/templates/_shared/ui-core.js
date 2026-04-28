/* Eureka UI Core — cross-subject UI atoms for HTML experiment templates.
 *
 * Provides:
 *  - updateStat / updateBadge: keep .eureka-stat-value / .eureka-badge DOM in sync
 *  - createSlider: build or attach to a slider control (R7: idempotent DOM strategy)
 *  - bindExistingSliders: wire up hand-written <input type="range"> elements
 *  - formatNum: display-rounding helper
 *
 * Architecture: Layer 3 of the 3-layer shared model (v2-atomic templates only).
 * Loaded with <script src="/templates/_shared/ui-core.js"></script>
 * MUST be loaded AFTER experiment-core.js.
 */

(function () {
  'use strict';

  // R4 startup guard — templates check this flag to confirm UI atoms loaded
  window.__EUREKA_UI_LOADED = true;

  const BADGE_CLASSES = {
    success: 'success',
    danger: 'danger',
    info: 'info',
    warning: 'warning',
  };

  const STAT_CLASSES = {
    primary: 'primary',
    success: 'success',
    danger: 'danger',
    info: 'info',
    warning: 'warning',
    muted: 'muted',
  };

  function updateStat(id, value, cls) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el) return false;
    el.textContent = String(value);
    if (cls && STAT_CLASSES[cls]) {
      // Preserve the base class .eureka-stat-value and swap only the modifier
      const base = 'eureka-stat-value';
      const modifiers = Object.values(STAT_CLASSES);
      const next = el.className
        .split(/\s+/)
        .filter(c => c && c !== base && !modifiers.includes(c));
      next.unshift(base, STAT_CLASSES[cls]);
      el.className = next.join(' ');
    }
    return true;
  }

  function updateBadge(id, text, kind) {
    const el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el) return false;
    if (text !== undefined && text !== null) el.textContent = String(text);
    if (kind && BADGE_CLASSES[kind]) {
      el.className = 'eureka-badge ' + BADGE_CLASSES[kind];
    }
    return true;
  }

  function formatNum(v, decimals) {
    const d = typeof decimals === 'number' ? decimals : 2;
    const n = Number(v);
    if (!Number.isFinite(n)) return String(v);
    const s = n.toFixed(d);
    // Trim trailing zeros for cleaner display (keep "1.0" → "1", "1.50" → "1.5")
    return d > 0 ? s.replace(/\.?0+$/, '') : s;
  }

  /**
   * Create a slider control, or attach to an existing one at #ctl-<name>.
   * opts: { min, max, step, defaultValue, label, unit, onChange(v), container? }
   * Returns: { get, set, input, valueSpan }
   */
  function createSlider(name, opts) {
    opts = opts || {};
    const existing = document.getElementById('ctl-' + name);
    let input, valueSpan;

    if (existing) {
      // Attach mode — wire up the already-rendered DOM
      input = existing;
      valueSpan = document.getElementById('v-' + name);
      if (opts.min !== undefined) input.min = String(opts.min);
      if (opts.max !== undefined) input.max = String(opts.max);
      if (opts.step !== undefined) input.step = String(opts.step);
      if (opts.defaultValue !== undefined) input.value = String(opts.defaultValue);
    } else {
      // Build mode — create wrapper + header + input
      const parent = opts.container || document.getElementById('eureka-params-root') || document.body;
      const wrapper = document.createElement('div');
      wrapper.className = 'eureka-control';

      const header = document.createElement('div');
      header.className = 'eureka-control-header';

      const labelEl = document.createElement('span');
      labelEl.className = 'eureka-control-label';
      labelEl.textContent = opts.label || name;

      const valueEl = document.createElement('span');
      valueEl.className = 'eureka-control-value';
      valueSpan = document.createElement('span');
      valueSpan.id = 'v-' + name;
      valueSpan.textContent = formatNum(opts.defaultValue, _decimalsFromStep(opts.step));
      valueEl.appendChild(valueSpan);
      if (opts.unit) {
        const unitEl = document.createElement('span');
        unitEl.textContent = ' ' + opts.unit;
        valueEl.appendChild(unitEl);
      }

      header.appendChild(labelEl);
      header.appendChild(valueEl);

      input = document.createElement('input');
      input.className = 'eureka-slider';
      input.type = 'range';
      input.id = 'ctl-' + name;
      if (opts.min !== undefined) input.min = String(opts.min);
      if (opts.max !== undefined) input.max = String(opts.max);
      if (opts.step !== undefined) input.step = String(opts.step);
      if (opts.defaultValue !== undefined) input.value = String(opts.defaultValue);

      wrapper.appendChild(header);
      wrapper.appendChild(input);
      parent.appendChild(wrapper);
    }

    const step = opts.step !== undefined ? Number(opts.step) : 1;
    const decimals = _decimalsFromStep(step);

    function notify(v) {
      if (valueSpan) valueSpan.textContent = formatNum(v, decimals);
      if (typeof opts.onChange === 'function') opts.onChange(Number(v));
    }

    input.addEventListener('input', (e) => notify(e.target.value));

    return {
      get() { return Number(input.value); },
      set(v) { input.value = String(v); notify(v); },
      input,
      valueSpan,
    };
  }

  /**
   * Bulk-attach onChange handlers to existing static sliders.
   * mapping: { [sliderName]: (value:number) => void }
   * Returns: { [sliderName]: {get, set, input} }
   */
  function bindExistingSliders(mapping) {
    const result = {};
    for (const name in mapping) {
      if (!Object.prototype.hasOwnProperty.call(mapping, name)) continue;
      const handler = mapping[name];
      const input = document.getElementById('ctl-' + name);
      if (!input) {
        console.warn('[EurekaUI] bindExistingSliders: #ctl-' + name + ' not found');
        continue;
      }
      const valueSpan = document.getElementById('v-' + name);
      const step = Number(input.step) || 1;
      const decimals = _decimalsFromStep(step);
      const fire = (v) => {
        if (valueSpan) valueSpan.textContent = formatNum(v, decimals);
        if (typeof handler === 'function') handler(Number(v));
      };
      input.addEventListener('input', (e) => fire(e.target.value));
      result[name] = {
        get() { return Number(input.value); },
        set(v) { input.value = String(v); fire(v); },
        input,
        valueSpan,
      };
    }
    return result;
  }

  function _decimalsFromStep(step) {
    if (step === undefined || step === null) return 0;
    const s = String(step);
    const dot = s.indexOf('.');
    return dot === -1 ? 0 : s.length - dot - 1;
  }

  // Expose globals
  window.EurekaUI = {
    updateStat,
    updateBadge,
    createSlider,
    bindExistingSliders,
    formatNum,
  };
})();
