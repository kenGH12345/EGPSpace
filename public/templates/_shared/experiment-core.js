/* Eureka Experiment Core — cross-subject shared layer for HTML experiment templates.
 *
 * Provides:
 *  - Host communication (postMessage protocol v1.0 with backward compatibility)
 *  - Template lifecycle (setTemplateId, emitReady, emitError)
 *  - Parameter system (bindParam — auto-generates DOM controls)
 *  - Render loop management (startRenderLoop, stopRenderLoop)
 *  - Host command handling (set_param, reset, pause, resume)
 *
 * Architecture: Layer 1 of the 3-layer shared model.
 *   experiment-core.js (this file) → subject-utils.js → template-specific logic
 *
 * Protocol version: 1.0
 */

(function () {
  'use strict';

  const PROTOCOL_VERSION = '1.0';
  const MESSAGE_SOURCE = 'eureka-experiment';

  // ---------- Internal state ----------
  let _templateId = null;
  const _params = new Map(); // name → ParamEntry
  const _renderLoops = new Map(); // id → { running, rafId, fn }
  let _nextLoopId = 1;
  let _globalPaused = false;
  let _lastTime = 0;

  // Compute RPC state (v2-atomic protocol)
  const _pendingRequests = new Map(); // requestId(string) → { resolve, reject, timer }
  let _nextRequestId = 1;
  let _latestResolvedId = 0; // for race-condition guard

  // ---------- Compute RPC listener (auto-attached on load) ----------
  // BUG-FIX 2026-04-30: previously this listener was only attached when a
  // template called EurekaHost.onHostCommand(). Templates that use requestCompute
  // but don't bind params (e.g. physics/circuit.html) never attached a listener,
  // so compute_result messages were silently dropped → requestCompute always
  // timed out after 3s. The fix: always attach a compute-only listener at load
  // time, independent of user-level onHostCommand callbacks.
  window.addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) return;
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (data.source !== MESSAGE_SOURCE) return;
    if (data.type !== 'compute_result' && data.type !== 'compute_error') return;

    const entry = _pendingRequests.get(data.requestId);
    if (!entry) return;
    clearTimeout(entry.timer);
    _pendingRequests.delete(data.requestId);

    // Race-condition guard (ADR R1): drop stale responses
    const rid = Number(data.requestId);
    if (Number.isFinite(rid) && rid < _latestResolvedId) {
      return; // newer response already applied, ignore
    }
    if (data.type === 'compute_result') {
      _latestResolvedId = Math.max(_latestResolvedId, rid);
      entry.resolve({
        values: data.values || {},
        state: data.state,
        explanation: data.explanation,
      });
    } else {
      entry.reject(new Error(data.message || 'compute_error'));
    }
  });

  // ---------- Host Communication (backward compatible) ----------

  const EurekaHost = {
    /** Set the active template ID. Called once per template. */
    setTemplateId(id) {
      _templateId = id;
    },

    /** Send a 'ready' message to the host. Call once when template is initialized. */
    emitReady(supportedParams, metadata) {
      _post({
        type: 'ready',
        templateId: _templateId,
        protocolVersion: PROTOCOL_VERSION,
        supportedParams: supportedParams || [],
        metadata: metadata || {},
      });
    },

    /** Notify host of a parameter change (e.g. user moved a slider). */
    emitParamChange(param, value) {
      _post({
        type: 'param_change',
        templateId: _templateId,
        param,
        value: Number(value),
      });
    },

    /** Notify host of new computed results. */
    emitResultUpdate(results) {
      _post({
        type: 'result_update',
        templateId: _templateId,
        results,
      });
    },

    /** Notify host of a user interaction (drag, tap, etc.). */
    emitInteraction(kind, data) {
      _post({
        type: 'interaction',
        templateId: _templateId,
        kind,
        data: data || {},
      });
    },

    /** Report an error to the host. */
    emitError(message, code) {
      _post({
        type: 'error',
        templateId: _templateId,
        message: String(message),
        code: code || 'template_error',
      });
    },

    /** Listen for host commands (set_param, reset, pause, resume, etc.). */
    onHostCommand(callback) {
      window.addEventListener('message', (event) => {
        if (event.origin !== window.location.origin) return;
        const data = event.data;
        if (!data || typeof data !== 'object') return;
        if (data.source !== MESSAGE_SOURCE) return;
        if (typeof data.type !== 'string') return;

        // Note: compute_result / compute_error are handled by the auto-attached
        // listener above (not routed through user callbacks).
        const validCommands = [
          'set_param', 'set_params', 'reset', 'pause', 'resume', 'highlight',
        ];
        if (validCommands.indexOf(data.type) === -1) return;

        try {
          if (data.type === 'pause') _globalPaused = true;
          if (data.type === 'resume') _globalPaused = false;
          callback(data);
        } catch (err) {
          this.emitError('Host command handler failed: ' + err.message, 'handler_error');
        }
      });
    },

    // Internal post helper
    _post(msg) {
      msg.source = MESSAGE_SOURCE;
      msg.timestamp = new Date().toISOString();
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(msg, '*');
      }
    },
  };

  // Keep internal _post accessible on EurekaHost for backwards compat
  EurekaHost._post = EurekaHost._post;

  // ---------- Parameter System (new in v1.0) ----------

  /** Bind a parameter to an auto-generated slider control.
   *
   *  config: { min, max, step, defaultValue, unit?, label?, container?, onChange? }
   *
   *  Returns { get(): number, set(value), element: HTMLElement }
   */
  function bindParam(name, config) {
    if (_params.has(name)) {
      throw new Error(`bindParam: parameter "${name}" already bound`);
    }

    const {
      min,
      max,
      step = 1,
      defaultValue = min,
      unit = '',
      label,
      container,
      onChange,
    } = config;

    const parent = container || document.getElementById('eureka-params-root') || document.body;

    const wrapper = document.createElement('div');
    wrapper.className = 'eureka-control';

    const header = document.createElement('div');
    header.className = 'eureka-control-header';

    const labelEl = document.createElement('span');
    labelEl.className = 'eureka-control-label';
    labelEl.textContent = label || name;

    const valueEl = document.createElement('span');
    valueEl.className = 'eureka-control-value';
    const valueSpan = document.createElement('span');
    valueSpan.id = `v-${name}`;
    valueSpan.textContent = fmt(defaultValue, step);
    valueEl.appendChild(valueSpan);
    if (unit) {
      const unitEl = document.createElement('span');
      unitEl.textContent = ' ' + unit;
      valueEl.appendChild(unitEl);
    }

    header.appendChild(labelEl);
    header.appendChild(valueEl);

    const input = document.createElement('input');
    input.className = 'eureka-slider';
    input.type = 'range';
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = defaultValue;
    input.id = `ctl-${name}`;

    wrapper.appendChild(header);
    wrapper.appendChild(input);
    parent.appendChild(wrapper);

    let currentValue = defaultValue;

    function update(newValue, emit) {
      newValue = clamp(+newValue, min, max);
      newValue = snap(newValue, step);
      currentValue = newValue;
      input.value = newValue;
      valueSpan.textContent = fmt(newValue, step);
      if (emit !== false) {
        _host.emitParamChange(name, newValue);
      }
      if (typeof onChange === 'function') onChange(newValue);
    }

    input.addEventListener('input', () => update(input.value, true));

    const entry = {
      get() { return currentValue; },
      set(v, emit) { update(v, emit); },
      element: wrapper,
      input,
      config: { min, max, step, defaultValue, unit, label },
    };
    _params.set(name, entry);
    return entry;
  }

  /** Get a bound parameter's current value (by name). */
  function getParam(name) {
    const entry = _params.get(name);
    if (!entry) throw new Error(`getParam: parameter "${name}" not bound`);
    return entry.get();
  }

  /** Set a bound parameter's value programmatically (by name). */
  function setParam(name, value, emit) {
    const entry = _params.get(name);
    if (!entry) throw new Error(`setParam: parameter "${name}" not bound`);
    entry.set(value, emit);
  }

  // ---------- Compute RPC (new in v2-atomic protocol) ----------

  /**
   * Ask the host to run a registered L1 engine.compute() and return the result.
   * Returns a Promise<{ values, state, explanation }>.
   *
   * - Internal requestId recycles 1..Number.MAX_SAFE_INTEGER per iframe instance
   * - Stale responses (requestId < latest resolved) are dropped silently
   * - Rejects with Error on timeout (default 3000ms) or compute_error from host
   * - If not running in an iframe (e.g. standalone preview), rejects immediately
   */
  function requestCompute(engineId, params, timeoutMs) {
    return new Promise((resolve, reject) => {
      if (!window.parent || window.parent === window) {
        reject(new Error('requestCompute: not running inside a host iframe'));
        return;
      }
      const rid = String(_nextRequestId++);
      const timer = setTimeout(() => {
        if (_pendingRequests.has(rid)) {
          _pendingRequests.delete(rid);
          reject(new Error('requestCompute: timeout waiting for host response'));
        }
      }, typeof timeoutMs === 'number' ? timeoutMs : 3000);

      _pendingRequests.set(rid, { resolve, reject, timer });

      window.parent.postMessage({
        source: MESSAGE_SOURCE,
        type: 'compute_request',
        templateId: _templateId,
        requestId: rid,
        engineId: String(engineId || ''),
        params: params || {},
        timestamp: new Date().toISOString(),
      }, '*');
    });
  }

  // ---------- Render Loop Management (new in v1.0) ----------

  /** Start a managed render loop. Returns loop ID for stopRenderLoop(). */
  function startRenderLoop(fn) {
    const id = _nextLoopId++;
    const loop = {
      running: true,
      rafId: null,
      fn,
    };
    _renderLoops.set(id, loop);

    const tick = (time) => {
      if (!loop.running) return;
      if (_globalPaused) {
        loop.rafId = requestAnimationFrame(tick);
        return;
      }
      const dt = _lastTime ? (time - _lastTime) / 1000 : 0;
      _lastTime = time;
      try {
        fn(dt);
      } catch (err) {
        _host.emitError('Render loop error: ' + err.message, 'render_error');
        loop.running = false;
        return;
      }
      loop.rafId = requestAnimationFrame(tick);
    };

    loop.rafId = requestAnimationFrame(tick);
    return id;
  }

  /** Stop a managed render loop by ID. */
  function stopRenderLoop(id) {
    const loop = _renderLoops.get(id);
    if (loop) {
      loop.running = false;
      if (loop.rafId) cancelAnimationFrame(loop.rafId);
      _renderLoops.delete(id);
    }
  }

  // ---------- Utility helpers (internal) ----------

  const _host = EurekaHost;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function snap(v, step) {
    return Math.round(v / step) * step;
  }

  function fmt(v, step) {
    const decimals = step < 1 ? String(step).split('.')[1].length : 0;
    return Number(v).toFixed(decimals).replace(/\.?0+$/, '');
  }

  // ---------- Expose globals ----------

  window.EurekaHost = EurekaHost;
  window.bindParam = bindParam;
  window.getParam = getParam;
  window.setParam = setParam;
  window.startRenderLoop = startRenderLoop;
  window.stopRenderLoop = stopRenderLoop;
  window.requestCompute = requestCompute;
  window.EurekaFormat = {
    num(value, decimals) {
      const d = typeof decimals === 'number' ? decimals : 2;
      return Number(value).toFixed(d);
    },
    clamp,
  };

  // ─────────────────────────────────────────────────────────────────────
  // EurekaCanvas & EurekaHints — merged from legacy physics-core.js (G 阶段 W3).
  // Ported verbatim to preserve 11 migrated templates' behavior. Together with
  // EurekaHost/EurekaFormat, these form the single-source iframe foundation.
  // ─────────────────────────────────────────────────────────────────────
  const EurekaCanvas = {
    setupHiDPI(canvas, cssWidth, cssHeight) {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      canvas.style.width = cssWidth + 'px';
      canvas.style.height = cssHeight + 'px';
      const ctx = canvas.getContext('2d');
      ctx.scale(dpr, dpr);
      return ctx;
    },

    clear(ctx, cssWidth, cssHeight, color) {
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, cssWidth, cssHeight);
      } else {
        ctx.clearRect(0, 0, cssWidth, cssHeight);
      }
    },

    drawArrow(ctx, x1, y1, x2, y2, color, label) {
      const headLen = 10;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const angle = Math.atan2(dy, dx);

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(
        x2 - headLen * Math.cos(angle - Math.PI / 6),
        y2 - headLen * Math.sin(angle - Math.PI / 6)
      );
      ctx.lineTo(
        x2 - headLen * Math.cos(angle + Math.PI / 6),
        y2 - headLen * Math.sin(angle + Math.PI / 6)
      );
      ctx.closePath();
      ctx.fill();

      if (label) {
        ctx.font = 'bold 13px system-ui';
        ctx.fillStyle = color;
        ctx.fillText(label, x2 + 6, y2 - 4);
      }
    },
  };

  const EurekaHints = {
    _shown: false,

    show(targetElement, text, timeoutMs) {
      if (this._shown) return;
      this._shown = true;
      const timeout = typeof timeoutMs === 'number' ? timeoutMs : 6000;

      const hint = document.createElement('div');
      hint.className = 'eureka-hint';
      hint.textContent = text;
      document.body.appendChild(hint);

      const rect = targetElement.getBoundingClientRect();
      hint.style.left = rect.left + rect.width / 2 - 80 + 'px';
      hint.style.top = rect.top - 48 + window.scrollY + 'px';
      hint.style.width = '160px';

      requestAnimationFrame(() => {
        hint.classList.add('visible');
      });

      const dismiss = () => {
        hint.classList.remove('visible');
        setTimeout(() => hint.remove(), 200);
        window.removeEventListener('click', dismiss);
        window.removeEventListener('input', dismiss);
      };

      setTimeout(dismiss, timeout);
      window.addEventListener('click', dismiss, { once: true });
      window.addEventListener('input', dismiss, { once: true });
    },
  };

  window.EurekaCanvas = EurekaCanvas;
  window.EurekaHints = EurekaHints;
})();
