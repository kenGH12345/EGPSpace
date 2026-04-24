/**
 * Experiment Dynamics — Spring-damper integration for smooth runtime transitions.
 *
 * Decouples user input (slider / drag target) from displayed state via a simple
 * spring-damper integrator. Without this, raw target changes would snap instantly;
 * with it, values ease toward their target, giving the "feel" of a physical system.
 *
 * Also provides geometric helpers (e.g. submersion fraction) that pure formulas cannot
 * express, because they depend on positional relationships between canvas elements.
 *
 * Design constraint: PURE FUNCTIONS only. State lives outside this module (owned by
 * the React container). Callers pass state in and receive an updated state back.
 */

import type { DynamicsConfig } from './experiment-schema';

export interface DynamicsState {
  position: Record<string, number>;
  velocity: Record<string, number>;
}

// Runaway guard \u2014 any velocity beyond this is clamped to prevent numerical blowup.
const MAX_VELOCITY = 500;

export function createDynamicsState(
  initialPositions: Record<string, number>,
): DynamicsState {
  const velocity: Record<string, number> = {};
  for (const key of Object.keys(initialPositions)) {
    velocity[key] = 0;
  }
  return {
    position: { ...initialPositions },
    velocity,
  };
}

/**
 * Advance one dynamics step.
 *
 * For each variable listed in config.variables:
 *   v += (target - position) * stiffness
 *   v *= damping
 *   position += v * (dt * 60)   // dt normalized to 60Hz reference
 *
 * Variables in `targets` but NOT in config.variables are set directly (static path).
 */
export function stepDynamics(
  state: DynamicsState,
  targets: Record<string, number>,
  config: DynamicsConfig,
  dt: number = 1 / 60,
): DynamicsState {
  const nextPosition: Record<string, number> = { ...state.position };
  const nextVelocity: Record<string, number> = { ...state.velocity };
  const frameScale = dt * 60;

  for (const key of Object.keys(targets)) {
    const target = targets[key];
    if (!Number.isFinite(target)) continue;

    if (!config.variables.includes(key)) {
      nextPosition[key] = target;
      nextVelocity[key] = 0;
      continue;
    }

    const current = nextPosition[key] ?? target;
    let v = nextVelocity[key] ?? 0;

    v += (target - current) * config.stiffness;
    v *= config.damping;

    if (v > MAX_VELOCITY) v = MAX_VELOCITY;
    else if (v < -MAX_VELOCITY) v = -MAX_VELOCITY;

    nextPosition[key] = current + v * frameScale;
    nextVelocity[key] = v;
  }

  return { position: nextPosition, velocity: nextVelocity };
}

/**
 * Compute how much of a vertically-oriented object is submerged in a liquid.
 *
 * Geometry (canvas coordinates, y grows downward):
 *   - object occupies vertical range [objY, objY + objSize]
 *   - liquid surface is at y = waterSurfaceY
 *   - submerged portion = intersection of object range with [waterSurfaceY, +\u221e)
 *
 * Returns:
 *   subFraction: 0..1  \u2014 ratio of submerged height to total object height
 *   vDisplaced: number \u2014 scaled displaced volume in canvas units (subFraction * objSize^3)
 *
 * Degenerate inputs (non-positive objSize) return zeros.
 */
export function computeBuoyancySubmersion(
  objY: number,
  objSize: number,
  waterSurfaceY: number,
): { subFraction: number; vDisplaced: number } {
  if (!(objSize > 0)) return { subFraction: 0, vDisplaced: 0 };

  const objBottom = objY + objSize;
  const raw = objBottom - waterSurfaceY;
  const submerged = Math.max(0, Math.min(objSize, raw));
  const subFraction = submerged / objSize;
  const vDisplaced = subFraction * objSize * objSize * objSize;

  return { subFraction, vDisplaced };
}

/**
 * Convenience: default dynamics tuning for buoyancy.
 * Exposed so tests and callers can rely on consistent parameters without magic numbers.
 */
export const BUOYANCY_DYNAMICS_DEFAULTS: Readonly<{
  stiffness: number;
  damping: number;
}> = Object.freeze({ stiffness: 0.06, damping: 0.88 });
