/**
 * Ambient Animations — Background visual effects decoupled from foreground elements.
 *
 * Driven by the rAF loop in the React container. Each call to step() advances internal
 * time, and draw() renders all configured animations onto the canvas context.
 *
 * Supported types:
 *   wave    \u2014 sinusoidal water surface (horizontal, scrolling)
 *   bubble  \u2014 rising bubbles inside a liquid container
 *   particle \u2014 directional particles (current flow, photons, etc.)
 *   ripple  \u2014 expanding circular rings
 *
 * Design: stateful class (owns wavePhase + particle pools) but draw() is deterministic
 * given the same state. The React container holds one instance per experiment.
 */

import type { AmbientAnimation } from './experiment-schema';

interface BubbleParticle {
  x: number;
  y: number;
  r: number;
  speed: number;
  opacity: number;
}

interface FlowParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

interface RippleRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  opacity: number;
}

export class AmbientAnimator {
  private wavePhase = 0;
  private bubbles: BubbleParticle[] = [];
  private particles: FlowParticle[] = [];
  private ripples: RippleRing[] = [];
  private initialized = false;

  /** Advance internal time by dt seconds. Call once per rAF frame. */
  step(dt: number): void {
    this.wavePhase += dt * 30;

    for (const b of this.bubbles) {
      b.y -= b.speed;
      if (b.y < -b.r * 2) {
        b.y = 300 + Math.random() * 50;
        b.x = b.x + (Math.random() - 0.5) * 20;
      }
    }

    for (const p of this.particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x > 560 + 10) p.x = -10;
      if (p.x < -10) p.x = 570;
      if (p.y > 280 + 10) p.y = -10;
      if (p.y < -10) p.y = 290;
    }

    for (const r of this.ripples) {
      r.radius += r.speed;
      r.opacity = Math.max(0, 1 - r.radius / r.maxRadius);
    }
    const alive = this.ripples.filter(r => r.opacity > 0);
    this.ripples.length = 0;
    this.ripples.push(...alive);
  }

  /** Render all ambient animations. Call after clearing / drawing background. */
  draw(
    ctx: CanvasRenderingContext2D,
    configs: AmbientAnimation[],
    vars: Record<string, number>,
  ): void {
    if (!this.initialized) {
      this.initPools(configs, vars);
      this.initialized = true;
    }

    for (const cfg of configs) {
      switch (cfg.type) {
        case 'wave':
          this.drawWave(ctx, cfg, vars);
          break;
        case 'bubble':
          this.drawBubbles(ctx, cfg, vars);
          break;
        case 'particle':
          this.drawParticles(ctx, cfg, vars);
          break;
        case 'ripple':
          this.drawRipples(ctx, cfg, vars);
          break;
      }
    }
  }

  /** Trigger a ripple at (x, y) \u2014 called by the drag handler on release. */
  addRipple(x: number, y: number, maxRadius = 40, speed = 1.5): void {
    this.ripples.push({ x, y, radius: 0, maxRadius, speed, opacity: 1 });
  }

  /** Reset all pools (call when schema changes). */
  reset(): void {
    this.wavePhase = 0;
    this.bubbles.length = 0;
    this.particles.length = 0;
    this.ripples.length = 0;
    this.initialized = false;
  }

  // ── Private helpers ──────────────────────────────────────────────────────

  private initPools(configs: AmbientAnimation[], vars: Record<string, number>): void {
    for (const cfg of configs) {
      if (cfg.type === 'bubble') {
        const count = this.resolveNum(cfg.params.count, vars, 5);
        const minR = this.resolveNum(cfg.params.minRadius, vars, 2);
        const maxR = this.resolveNum(cfg.params.maxRadius, vars, 6);
        const containerX = this.resolveNum(cfg.params.x, vars, 160);
        const containerW = this.resolveNum(cfg.params.width, vars, 120);
        const containerH = this.resolveNum(cfg.params.height, vars, 160);
        const containerY = this.resolveNum(cfg.params.y, vars, 80);
        for (let i = 0; i < count; i++) {
          this.bubbles.push({
            x: containerX + Math.random() * containerW,
            y: containerY + Math.random() * containerH,
            r: minR + Math.random() * (maxR - minR),
            speed: 0.3 + Math.random() * 0.5,
            opacity: 0.4 + Math.random() * 0.4,
          });
        }
      }

      if (cfg.type === 'particle') {
        const count = this.resolveNum(cfg.params.count, vars, 8);
        const vx = this.resolveNum(cfg.params.vx, vars, 1.5);
        const vy = this.resolveNum(cfg.params.vy, vars, 0);
        const size = this.resolveNum(cfg.params.size, vars, 3);
        const startX = this.resolveNum(cfg.params.startX, vars, 0);
        const startY = this.resolveNum(cfg.params.startY, vars, 140);
        const spread = this.resolveNum(cfg.params.spread, vars, 20);
        for (let i = 0; i < count; i++) {
          this.particles.push({
            x: startX + Math.random() * 560,
            y: startY + (Math.random() - 0.5) * spread,
            vx,
            vy,
            size,
            opacity: 0.5 + Math.random() * 0.5,
          });
        }
      }
    }
  }

  private drawWave(
    ctx: CanvasRenderingContext2D,
    cfg: AmbientAnimation,
    vars: Record<string, number>,
  ): void {
    const amplitude = this.resolveNum(cfg.params.amplitude, vars, 3);
    const frequency = this.resolveNum(cfg.params.frequency, vars, 0.03);
    const y = this.resolveNum(cfg.params.y, vars, 140);
    const color = String(cfg.params.color ?? 'rgba(100,180,255,0.5)');
    const width = this.resolveNum(cfg.params.width, vars, 560);
    const x0 = this.resolveNum(cfg.params.x, vars, 0);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, y);
    for (let px = 0; px <= width; px += 2) {
      const py = y + Math.sin((px * frequency) + this.wavePhase) * amplitude;
      ctx.lineTo(x0 + px, py);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  private drawBubbles(
    ctx: CanvasRenderingContext2D,
    cfg: AmbientAnimation,
    vars: Record<string, number>,
  ): void {
    const color = String(cfg.params.color ?? 'rgba(180,220,255,0.6)');

    ctx.save();
    for (const b of this.bubbles) {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.globalAlpha = b.opacity;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private drawParticles(
    ctx: CanvasRenderingContext2D,
    cfg: AmbientAnimation,
    vars: Record<string, number>,
  ): void {
    const color = String(cfg.params.color ?? 'rgba(255,200,50,0.8)');

    ctx.save();
    for (const p of this.particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private drawRipples(
    ctx: CanvasRenderingContext2D,
    cfg: AmbientAnimation,
    vars: Record<string, number>,
  ): void {
    const color = String(cfg.params.color ?? 'rgba(100,180,255,0.6)');

    ctx.save();
    for (const r of this.ripples) {
      ctx.beginPath();
      ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.globalAlpha = r.opacity;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
  }

  private resolveNum(
    value: number | string | undefined,
    vars: Record<string, number>,
    fallback: number,
  ): number {
    if (value === undefined || value === null) return fallback;
    if (typeof value === 'number') return value;
    const fromVars = vars[value];
    if (typeof fromVars === 'number') return fromVars;
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}
