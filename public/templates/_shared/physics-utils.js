/* physics-utils.js — physics-specific utilities for experiment templates.
 *
 * Provides:
 *   - Physical constants
 *   - Formula library (mechanics, kinematics, waves, electromagnetism)
 *   - Canvas rendering helpers for physics visualisations
 *
 * Architecture: Layer 2 of the 3-layer shared model.
 *
 * Usage:
 *   <script src="/templates/_shared/experiment-core.js"></script>
 *   <script src="/templates/_shared/physics-utils.js"></script>
 */

/* ---------- Constants ---------- */
const G = 9.8;       // gravitational acceleration (m/s²)
const PI = Math.PI;  // convenience alias

/* ---------- Mechanics Formulas (batch-1 compatible) ---------- */

function buoyancyForce(rhoFluid, volume, g = G) {
  return rhoFluid * volume * g;
}

function gravityForce(mass, g = G) {
  return mass * g;
}

function leverTorque(force, armLength) {
  return force * armLength;
}

function pressureForce(pressure, area) {
  return pressure * area;
}

/* ---------- Kinematics Formulas (batch-2) ---------- */

function displacement(v0, a, t) {
  return v0 * t + 0.5 * a * t * t;
}

function finalVelocity(v0, a, t) {
  return v0 + a * t;
}

function averageVelocity(v0, v) {
  return (v0 + v) / 2;
}

function kineticEnergy(mass, velocity) {
  return 0.5 * mass * velocity * velocity;
}

function potentialEnergy(mass, height, g = G) {
  return mass * g * height;
}

function totalEnergy(mass, velocity, height, g = G) {
  return kineticEnergy(mass, velocity) + potentialEnergy(mass, height, g);
}

/* ---------- Wave Formulas (batch-2) ---------- */

function waveDisplacement(amplitude, wavelength, frequency, time, x) {
  return amplitude * Math.sin(2 * PI * (x / wavelength - frequency * time));
}

function superposition(a1, lambda1, f1, a2, lambda2, f2, time, x) {
  const y1 = waveDisplacement(a1, lambda1, f1, time, x);
  const y2 = waveDisplacement(a2, lambda2, f2, time, x);
  return { y1, y2, total: y1 + y2 };
}

function waveSpeed(wavelength, frequency) {
  return wavelength * frequency;
}

/* ---------- Electromagnetism Formulas (batch-2) ---------- */

function faradayEMF(dPhi, dt) {
  return -dPhi / dt;
}

function resistance(voltage, current) {
  return voltage / current;
}

function ohmVoltage(current, resistance) {
  return current * resistance;
}

/* ---------- Optics Formulas (batch-1 compatible) ---------- */

function snellsLaw(n1, theta1, n2) {
  return Math.asin((n1 * Math.sin(theta1)) / n2);
}

/* ---------- Canvas Rendering Helpers ---------- */

function drawArrow(ctx, fromX, fromY, toX, toY, options = {}) {
  const headLen = options.headLength || 10;
  const color = options.color || '#000';
  const lineWidth = options.lineWidth || 3;
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(toX, toY);
  ctx.lineTo(
    toX - headLen * Math.cos(angle - Math.PI / 6),
    toY - headLen * Math.sin(angle - Math.PI / 6)
  );
  ctx.lineTo(
    toX - headLen * Math.cos(angle + Math.PI / 6),
    toY - headLen * Math.sin(angle + Math.PI / 6)
  );
  ctx.closePath();
  ctx.fill();

  if (options.label) {
    ctx.font = options.font || 'bold 13px system-ui, sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(options.label, toX + 6, toY - 4);
  }
  ctx.restore();
}

function drawAxis(ctx, originX, originY, width, height, options = {}) {
  const TICK_LENGTH = 6;
  const tickSpacing = options.tickSpacing || 50;

  ctx.save();
  ctx.strokeStyle = options.color || '#6B7280';
  ctx.lineWidth = 1;

  // X-axis
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX + width, originY);
  ctx.stroke();

  // Y-axis
  ctx.beginPath();
  ctx.moveTo(originX, originY);
  ctx.lineTo(originX, originY - height);
  ctx.stroke();

  // Arrowheads
  drawArrow(ctx, originX, originY, originX + width - 4, originY, { color: ctx.strokeStyle, headLength: 8, lineWidth: 1 });
  drawArrow(ctx, originX, originY, originX, originY - height + 4, { color: ctx.strokeStyle, headLength: 8, lineWidth: 1 });

  // Grid ticks
  ctx.fillStyle = options.tickColor || '#9CA3AF';
  ctx.font = '11px system-ui, sans-serif';

  // X ticks
  for (let x = originX + tickSpacing; x < originX + width - 10; x += tickSpacing) {
    ctx.beginPath();
    ctx.moveTo(x, originY - TICK_LENGTH / 2);
    ctx.lineTo(x, originY + TICK_LENGTH / 2);
    ctx.stroke();
    if (options.xLabels) {
      const idx = Math.round((x - originX) / tickSpacing) - 1;
      if (options.xLabels[idx] !== undefined) {
        ctx.textAlign = 'center';
        ctx.fillText(String(options.xLabels[idx]), x, originY + 18);
      }
    }
  }

  // Y ticks
  for (let y = originY - tickSpacing; y > originY - height + 10; y -= tickSpacing) {
    ctx.beginPath();
    ctx.moveTo(originX - TICK_LENGTH / 2, y);
    ctx.lineTo(originX + TICK_LENGTH / 2, y);
    ctx.stroke();
    if (options.yLabels) {
      const idx = Math.round((originY - y) / tickSpacing) - 1;
      if (options.yLabels[idx] !== undefined) {
        ctx.textAlign = 'right';
        ctx.fillText(String(options.yLabels[idx]), originX - 8, y + 4);
      }
    }
  }

  ctx.restore();
}

function drawEnergyBar(ctx, x, y, value, maxValue, options = {}) {
  const barWidth = options.barWidth || 20;
  const barMaxHeight = options.barMaxHeight || 120;
  const color = options.color || '#3B82F6';
  const label = options.label || '';

  const height = Math.max(2, (value / maxValue) * barMaxHeight);

  ctx.save();
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(x, y - height, barWidth, height);
  ctx.globalAlpha = 1;

  // Outline
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y - barMaxHeight, barWidth, barMaxHeight);

  if (label) {
    ctx.font = 'bold 12px system-ui, sans-serif';
    ctx.fillStyle = '#1F2937';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + barWidth / 2, y + 16);
  }

  // Value label on top
  if (options.showValue !== false) {
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = color;
    ctx.fillText(String(value.toFixed(1)), x + barWidth / 2, y - height - 4);
  }

  ctx.restore();
}

/* ---------- Small Assorted Helpers ---------- */

function setupHiDPI(canvas, cssWidth, cssHeight) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;
  canvas.style.width = cssWidth + 'px';
  canvas.style.height = cssHeight + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return ctx;
}

function clearCanvas(ctx, width, height, color) {
  if (color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }
}

/* ---------- Basic Self-Asserts ----------
   A minimal hand-written test runner. Only runs when the file is
   loaded directly (not inside a template).  */

const _tests = [];

function assert(name, fn) {
  _tests.push({ name, fn });
}

function runTests() {
  const failures = [];
  _tests.forEach(t => {
    try {
      t.fn();
    } catch (e) {
      failures.push(t.name + ': ' + e.message);
    }
  });
  if (failures.length) {
    console.error('[physics-utils] ' + failures.length + ' test(s) FAILED:\n  ' + failures.join('\n  '));
  } else {
    console.log('[physics-utils] All ' + _tests.length + ' tests passed.');
  }
}

// Assertions for batch-1 formulas
assert('buoyancyForce water', () => {
  const f = buoyancyForce(1000, 0.01, 9.8);
  if (Math.abs(f - 98) > 0.01) throw new Error('Expected 98, got ' + f);
});

assert('gravityForce 1kg', () => {
  const f = gravityForce(1, 9.8);
  if (Math.abs(f - 9.8) > 0.001) throw new Error('Expected 9.8, got ' + f);
});

assert('leverTorque simple', () => {
  const t = leverTorque(10, 2);
  if (Math.abs(t - 20) > 0.001) throw new Error('Expected 20, got ' + t);
});

assert('pressureForce', () => {
  const f = pressureForce(100, 0.5);
  if (Math.abs(f - 50) > 0.001) throw new Error('Expected 50, got ' + f);
});

// Assertions for batch-2 formulas
assert('displacement constant velocity', () => {
  const s = displacement(10, 0, 2);
  if (Math.abs(s - 20) > 0.001) throw new Error('Expected 20, got ' + s);
});

assert('displacement with acceleration', () => {
  const s = displacement(0, 2, 3);
  if (Math.abs(s - 9) > 0.001) throw new Error('Expected 9, got ' + s);
});

assert('finalVelocity', () => {
  const v = finalVelocity(5, 2, 3);
  if (Math.abs(v - 11) > 0.001) throw new Error('Expected 11, got ' + v);
});

assert('averageVelocity', () => {
  const v = averageVelocity(0, 10);
  if (Math.abs(v - 5) > 0.001) throw new Error('Expected 5, got ' + v);
});

assert('kineticEnergy', () => {
  const e = kineticEnergy(2, 3);
  if (Math.abs(e - 9) > 0.001) throw new Error('Expected 9, got ' + e);
});

assert('potentialEnergy', () => {
  const e = potentialEnergy(1, 10, 9.8);
  if (Math.abs(e - 98) > 0.001) throw new Error('Expected 98, got ' + e);
});

assert('totalEnergy conservation', () => {
  const m = 1, v = 0, h = 10;
  const e = totalEnergy(m, v, h, 9.8);
  if (Math.abs(e - 98) > 0.001) throw new Error('Expected 98, got ' + e);
});

assert('waveDisplacement', () => {
  const y = waveDisplacement(1, 2, 1, 0, 0.5);
  if (Math.abs(y - 1) > 0.001) throw new Error('Expected 1 at peak, got ' + y);
});

assert('superposition phase', () => {
  const s = superposition(1, 2, 1, 1, 2, 1, 0, 0.5);
  if (Math.abs(s.total - 2) > 0.001) throw new Error('Expected 2 (constructive), got ' + s.total);
});

assert('waveSpeed', () => {
  const v = waveSpeed(2, 5);
  if (Math.abs(v - 10) > 0.001) throw new Error('Expected 10, got ' + v);
});

assert('faradayEMF sign', () => {
  const e = faradayEMF(5, 1);
  if (Math.abs(e + 5) > 0.001) throw new Error('Expected -5 by Lenz law, got ' + e);
});

assert('ohmsLaw', () => {
  const v = ohmVoltage(2, 10);
  if (Math.abs(v - 20) > 0.001) throw new Error('Expected 20, got ' + v);
});

assert('snellsLaw', () => {
  const theta2 = snellsLaw(1, Math.PI / 6, 1.5);
  const expected = Math.asin(Math.sin(Math.PI / 6) / 1.5);
  if (Math.abs(theta2 - expected) > 0.00001) throw new Error('Unexpected refraction angle');
});

/* ---------- Expose globals ---------- */

window.EurekaPhysics = {
  G, PI,
  buoyancyForce, gravityForce, leverTorque, pressureForce,
  displacement, finalVelocity, averageVelocity,
  kineticEnergy, potentialEnergy, totalEnergy,
  waveDisplacement, superposition, waveSpeed,
  faradayEMF, resistance, ohmVoltage,
  snellsLaw,
};

window.EurekaCanvas2D = {
  setupHiDPI, clear: clearCanvas,
  drawArrow, drawAxis, drawEnergyBar,
};

// Run asserts on load (only when this file is the last script)
if (typeof window !== 'undefined') {
  window.addEventListener('load', runTests);
}
