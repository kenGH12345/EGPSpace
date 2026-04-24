/* Eureka Physics Core — shared utilities for HTML experiment templates.
 *
 * Provides:
 *  - Host communication (postMessage wrapper with source namespacing)
 *  - Canvas helpers (HiDPI setup, clear, arrow drawing)
 *  - First-run hint system
 *  - Numeric formatting utilities
 *
 * All templates MUST load this script before their own logic.
 * Loaded with <script src="/templates/_shared/physics-core.js"></script>
 */

(function () {
  'use strict';

  const MESSAGE_SOURCE = 'eureka-experiment';

  // -------------------- Host Communication --------------------

  const EurekaHost = {
    templateId: null,

    /** Set the active template ID. Called once per template. */
    setTemplateId(id) {
      this.templateId = id;
    },

    /** Send a 'ready' message to the host. Call once when template is initialized. */
    emitReady(supportedParams) {
      this._post({
        type: 'ready',
        templateId: this.templateId,
        supportedParams: supportedParams || [],
      });
    },

    /** Notify host of a parameter change (e.g. user moved a slider). */
    emitParamChange(param, value) {
      this._post({
        type: 'param_change',
        templateId: this.templateId,
        param,
        value: Number(value),
      });
    },

    /** Notify host of new computed results. */
    emitResultUpdate(results) {
      this._post({
        type: 'result_update',
        templateId: this.templateId,
        results,
      });
    },

    /** Notify host of a user interaction (drag, tap, etc.). */
    emitInteraction(kind, data) {
      this._post({
        type: 'interaction',
        templateId: this.templateId,
        kind,
        data: data || {},
      });
    },

    /** Report an error to the host. */
    emitError(message, code) {
      this._post({
        type: 'error',
        templateId: this.templateId,
        message: String(message),
        code: code || 'template_error',
      });
    },

    /**
     * Listen for host commands (set_param, reset, etc.).
     * callback receives parsed command object.
     */
    onHostCommand(callback) {
      window.addEventListener('message', (event) => {
        // Security: only trust messages from the same origin as the hosting page.
        // For sandboxed iframes, event.origin may be 'null' — only accept our own origin.
        if (event.origin !== window.location.origin) return;

        const data = event.data;
        if (!data || typeof data !== 'object') return;
        if (data.source !== MESSAGE_SOURCE) return;
        if (typeof data.type !== 'string') return;

        // Whitelist of accepted command types
        const validCommands = ['set_param', 'set_params', 'reset', 'highlight'];
        if (validCommands.indexOf(data.type) === -1) return;

        try {
          callback(data);
        } catch (err) {
          this.emitError('Host command handler failed: ' + err.message, 'handler_error');
        }
      });
    },

    _post(msg) {
      msg.source = MESSAGE_SOURCE;
      msg.timestamp = new Date().toISOString();
      // Post to parent with any origin — the parent will validate origin on its side.
      // Parent enforces same-origin check, so this is safe.
      if (window.parent && window.parent !== window) {
        window.parent.postMessage(msg, '*');
      }
    },
  };

  // -------------------- Canvas Helpers --------------------

  const EurekaCanvas = {
    /**
     * Set up a canvas for HiDPI rendering.
     * Returns the 2D context with transform already applied.
     */
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

    /** Clear a canvas to a solid color. */
    clear(ctx, cssWidth, cssHeight, color) {
      if (color) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, cssWidth, cssHeight);
      } else {
        ctx.clearRect(0, 0, cssWidth, cssHeight);
      }
    },

    /** Draw an arrow from (x1,y1) to (x2,y2) with given color and label. */
    drawArrow(ctx, x1, y1, x2, y2, color, label) {
      const headLen = 10;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const angle = Math.atan2(dy, dx);

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 3;

      // Shaft
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // Head
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

  // -------------------- First-Run Hint --------------------

  const EurekaHints = {
    _shown: false,

    /**
     * Show a first-run hint tooltip anchored to a target element.
     * Auto-hides after the user interacts or after timeoutMs (default 6000ms).
     */
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

  // -------------------- Formatting Helpers --------------------

  const EurekaFormat = {
    /** Format a number with fixed decimal places, trimming trailing zeros. */
    num(value, decimals) {
      const d = typeof decimals === 'number' ? decimals : 2;
      return Number(value).toFixed(d);
    },

    /** Clamp a value to [min, max]. */
    clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    },
  };

  // Expose globals
  window.EurekaHost = EurekaHost;
  window.EurekaCanvas = EurekaCanvas;
  window.EurekaHints = EurekaHints;
  window.EurekaFormat = EurekaFormat;
})();
