import type { ComponentStamp, ComponentSolvedValues } from '../../contracts/component';
import type { OpticsStampEntry } from './components';
import { AbstractSolver } from '../../core/AbstractSolver';
import type { EventBus } from '../../core/EventBus';

interface RayState {
  x: number;
  y: number;
  dx: number;
  dy: number;
  intensity: number;
}

const MAX_BOUNCES = 4;
const MIN_INTENSITY = 0.01;
const DEFAULT_RAY_LENGTH = 10;
const DEFAULT_REFLECTIVITY = 0.65;
const MAX_DELTA_TIME = 1 / 30;

export class OpticsSolver extends AbstractSolver {
  public readonly domain = 'optics';
  private stamps: ComponentStamp<OpticsStampEntry>[] = [];

  public lastResults: Record<string, ComponentSolvedValues> = {};

  constructor(eventBus: EventBus) {
    super(eventBus);
  }

  addStamp(stamp: ComponentStamp<OpticsStampEntry>): void {
    this.stamps.push(stamp);
  }

  protected performUpdate(deltaTime: number): void {
    const dt = clampFinite(deltaTime, 0, MAX_DELTA_TIME);
    const results: Record<string, ComponentSolvedValues> = {};

    for (const stamp of this.stamps) {
      results[stamp.componentId] = this.solveStamp(stamp, dt);
    }

    this.lastResults = results;
  }

  clear(): void {
    this.stamps = [];
    this.lastResults = {};
  }

  private solveStamp(
    stamp: ComponentStamp<OpticsStampEntry>,
    dt: number,
  ): ComponentSolvedValues {
    const sourceEntry = stamp.entries.find((entry) => entry.kind === 'light-source') ?? stamp.entries[0];

    if (!sourceEntry) {
      return { illuminated: false, status: 'invalid', reason: 'empty_stamp', dt };
    }

    if (sourceEntry.kind !== 'light-source') {
      return this.solvePassiveOptic(sourceEntry, dt);
    }

    const ray = createRay(sourceEntry);

    if (!ray) {
      return { illuminated: false, status: 'invalid', reason: 'invalid_direction', dt };
    }

    const reflectivity = clampFiniteNumber(sourceEntry.parameters.reflectivity, 0, 1, DEFAULT_REFLECTIVITY);
    const rayLength = positiveFinite(sourceEntry.parameters.rayLength, DEFAULT_RAY_LENGTH);
    const segments = [] as { x1: number; y1: number; x2: number; y2: number; intensity: number }[];
    let terminatedBy = 'distance_limit';

    for (let bounce = 0; bounce <= MAX_BOUNCES; bounce += 1) {
      const x2 = ray.x + ray.dx * rayLength;
      const y2 = ray.y + ray.dy * rayLength;
      segments.push({ x1: ray.x, y1: ray.y, x2, y2, intensity: ray.intensity });

      ray.x = x2;
      ray.y = y2;
      ray.dx = -ray.dx;
      ray.intensity *= reflectivity;

      if (ray.intensity < MIN_INTENSITY) {
        terminatedBy = 'intensity_threshold';
        break;
      }

      if (bounce === MAX_BOUNCES) {
        terminatedBy = 'max_bounces';
      }
    }

    return {
      illuminated: true,
      status: 'simulating',
      kind: 'light-source',
      raySegments: segments,
      segmentCount: segments.length,
      finalIntensity: ray.intensity,
      terminatedBy,
      dt,
    };
  }

  private solvePassiveOptic(entry: OpticsStampEntry, dt: number): ComponentSolvedValues {
    const focalLength = positiveFinite(entry.parameters.focalLength, 0.1);
    const refractiveIndex = positiveFinite(entry.parameters.refractiveIndex, 1.5);
    const opticalPower = 1 / focalLength;

    return {
      illuminated: false,
      status: 'ready',
      kind: entry.kind,
      focalLength,
      refractiveIndex,
      opticalPower,
      dt,
    };
  }
}

function createRay(entry: OpticsStampEntry): RayState | null {
  const intensity = positiveFinite(entry.parameters.intensity, 1);
  const angleDegrees = finiteOrDefault(entry.parameters.beamAngle, 0);
  const x = finiteOrDefault(entry.parameters.x, 0);
  const y = finiteOrDefault(entry.parameters.y, 0);
  const radians = (angleDegrees * Math.PI) / 180;
  const dx = Math.cos(radians);
  const dy = Math.sin(radians);
  const magnitude = Math.hypot(dx, dy);

  if (!Number.isFinite(magnitude) || magnitude <= 0) return null;

  return { x, y, dx: dx / magnitude, dy: dy / magnitude, intensity };
}

function clampFinite(deltaTime: number, min: number, max: number): number {
  if (!Number.isFinite(deltaTime)) return min;
  return Math.min(Math.max(deltaTime, min), max);
}

function clampFiniteNumber(
  value: number | string | undefined,
  min: number,
  max: number,
  fallback: number,
): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(value, min), max);
}

function finiteOrDefault(value: number | string | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function positiveFinite(value: number | string | undefined, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? value : fallback;
}
