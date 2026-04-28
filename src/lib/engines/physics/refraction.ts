/**
 * Physics: Refraction Engine (Capability)
 *
 * Implements IExperimentEngine for the light refraction experiment.
 * Extracted from physics-engine.ts as part of capability atomization (T-1).
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

export class RefractionEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'physics/refraction',
    subject: 'physics',
    displayName: '光的折射',
    description: '探索斯涅尔定律：n₁sinθ₁ = n₂sinθ₂，包含全反射临界条件',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['line', 'arc'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const incidentAngle = params.incidentAngle ?? params.incident_angle ?? 30;
    const n1 = params.n1 ?? 1.0;
    const n2 = params.n2 ?? 1.5;

    if (incidentAngle < 0 || incidentAngle > 90) errors.push({ field: 'incidentAngle', message: '入射角必须在0-90度范围内', severity: 'error' });
    if (n1 <= 0) errors.push({ field: 'n1', message: '折射率n1必须大于0', severity: 'error' });
    if (n2 <= 0) errors.push({ field: 'n2', message: '折射率n2必须大于0', severity: 'error' });

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const incidentAngle = params.incidentAngle ?? params.incident_angle ?? 30;
    const n1 = params.n1 ?? 1.0;
    const n2 = params.n2 ?? 1.5;

    const incidentRad = (incidentAngle * Math.PI) / 180;
    const sinRefracted = (n1 / n2) * Math.sin(incidentRad);

    const isTotalReflection = sinRefracted > 1;
    let refractionAngle: number;
    let state = 'normal';

    if (isTotalReflection) {
      refractionAngle = incidentAngle;
      state = 'totalReflection';
    } else {
      refractionAngle = (Math.asin(Math.min(1, sinRefracted)) * 180) / Math.PI;
    }

    const criticalAngle = n1 > n2 ? (Math.asin(n2 / n1) * 180) / Math.PI : 90;

    let explanation = '';
    if (isTotalReflection) {
      explanation = `入射角(${incidentAngle.toFixed(1)}°) > 临界角(${criticalAngle.toFixed(1)}°)，发生全反射。`;
    } else {
      explanation = `n₁×sin(θ₁) = n₂×sin(θ₂)，${n1.toFixed(2)}×sin(${incidentAngle.toFixed(1)}°) = ${n2.toFixed(2)}×sin(${refractionAngle.toFixed(1)}°)。`;
      if (n2 > n1) {
        explanation += ' 光从光疏介质进入光密介质，折射角 < 入射角。';
      } else {
        explanation += ' 光从光密介质进入光疏介质，折射角 > 入射角。';
      }
    }

    return {
      values: {
        refractionAngle,
        incidentAngle,
        criticalAngle,
        isTotalReflection: isTotalReflection ? 1 : 0,
        n1,
        n2,
      },
      state,
      explanation,
    };
  }
}

const refractionEngine = new RefractionEngine();
export default refractionEngine;
