/**
 * Math: Geometry Engine
 *
 * Implements IExperimentEngine for coordinate geometry experiments.
 * Supports lines, circles, intersections, and relationship proofs.
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

export class GeometryEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'math/geometry',
    subject: 'math',
    displayName: 'Geometry Proof',
    description: 'Coordinate geometry: lines, circles, intersections and relationships',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['line', 'circle', 'point', 'text'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const geometryType = params.geometry_type ?? 0;

    if (geometryType === 0) {
      if (params.x1 === params.x2 && params.y1 === params.y2) {
        errors.push({ field: 'x1,y1', message: 'Two points cannot coincide', severity: 'error' });
      }
    } else if (geometryType === 1) {
      const radius = params.r ?? params.radius ?? 1;
      if (radius <= 0) errors.push({ field: 'r', message: 'Radius must be > 0', severity: 'error' });
    }

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const geometryType = params.geometry_type ?? 0;

    if (geometryType === 0) {
      const x1 = params.x1 ?? 0;
      const y1 = params.y1 ?? 0;
      const x2 = params.x2 ?? 4;
      const y2 = params.y2 ?? 3;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const slope = dx !== 0 ? dy / dx : Infinity;
      const angle = Math.atan2(dy, dx);

      return {
        values: {
          length,
          midpointX: midX,
          midpointY: midY,
          slope: dx !== 0 ? slope : 'Infinity',
          angle,
          angleDegrees: (angle * 180) / Math.PI,
          dx,
          dy,
          stateLabel: 'Segment',
        },
        state: 'Segment Calculation',
        explanation: `Segment from (${x1.toFixed(2)}, ${y1.toFixed(2)}) to (${x2.toFixed(2)}, ${y2.toFixed(2)}). Length ${length.toFixed(4)}, midpoint (${midX.toFixed(2)}, ${midY.toFixed(2)}), angle ${((angle * 180) / Math.PI).toFixed(1)} deg.`,
      };
    } else if (geometryType === 1) {
      const h = params.h ?? 0;
      const k = params.k ?? 0;
      const r = params.r ?? params.radius ?? 5;

      const area = Math.PI * r * r;
      const circumference = 2 * Math.PI * r;

      return {
        values: {
          centerX: h,
          centerY: k,
          radius: r,
          area,
          circumference,
          diameter: 2 * r,
          stateLabel: 'Circle',
        },
        state: 'Circle Calculation',
        explanation: `Center (${h.toFixed(2)}, ${k.toFixed(2)}), radius ${r.toFixed(2)}. Area ${area.toFixed(2)}, circumference ${circumference.toFixed(2)}.`,
      };
    } else if (geometryType === 2) {
      const x1 = params.x1 ?? -5;
      const y1 = params.y1 ?? 0;
      const x2 = params.x2 ?? 5;
      const y2 = params.y2 ?? 0;
      const h = params.h ?? 0;
      const k = params.k ?? 0;
      const r = params.r ?? 3;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const fx = x1 - h;
      const fy = y1 - k;

      const a = dx * dx + dy * dy;
      const b = 2 * (fx * dx + fy * dy);
      const c = fx * fx + fy * fy - r * r;

      const discriminant = b * b - 4 * a * c;

      const intersections: { x: number; y: number }[] = [];
      let state: string;

      if (discriminant < 0) {
        state = 'No intersection (separate)';
      } else if (Math.abs(discriminant) < 0.0001) {
        const t = -b / (2 * a);
        intersections.push({ x: x1 + t * dx, y: y1 + t * dy });
        state = 'One intersection (tangent)';
      } else {
        const sqrtD = Math.sqrt(discriminant);
        const t1 = (-b + sqrtD) / (2 * a);
        const t2 = (-b - sqrtD) / (2 * a);
        intersections.push(
          { x: x1 + t1 * dx, y: y1 + t1 * dy },
          { x: x1 + t2 * dx, y: y1 + t2 * dy }
        );
        state = 'Two intersections (crossing)';
      }

      return {
        values: {
          discriminant,
          intersections,
          intersectionCount: intersections.length,
          stateLabel: state,
        },
        state,
        explanation: `Line from (${x1}, ${y1}) to (${x2}, ${y2}), circle center (${h}, ${k}), radius ${r}. ${state}.`,
      };
    }

    return {
      values: { stateLabel: 'Unknown geometry type' },
      state: 'Unknown',
      explanation: 'Unrecognized geometry type',
    };
  }
}

export default new GeometryEngine();
