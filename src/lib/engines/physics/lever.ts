/**
 * Physics: Lever Engine (Capability)
 *
 * Implements IExperimentEngine for the classic lever/lifting beam experiment.
 * Extracted from physics-engine.ts as part of capability atomization (T-1).
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

export class LeverEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'physics/lever',
    subject: 'physics',
    displayName: '杠杆原理',
    description: '探索力矩平衡：F₁×L₁ = F₂×L₂',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['rect'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const leftArm = params.leftArm ?? params.left_arm ?? 20;
    const rightArm = params.rightArm ?? params.right_arm ?? 20;

    if (leftArm <= 0) errors.push({ field: 'leftArm', message: '左力臂必须大于0', severity: 'error' });
    if (rightArm <= 0) errors.push({ field: 'rightArm', message: '右力臂必须大于0', severity: 'error' });

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const leftArm = params.leftArm ?? params.left_arm ?? 20;
    const rightArm = params.rightArm ?? params.right_arm ?? 20;
    const leftMass = params.leftMass ?? params.left_mass ?? 2;
    const rightMass = params.rightMass ?? params.right_mass ?? 2;
    const g = params.g ?? 9.8;

    const leftTorque = leftMass * g * leftArm;
    const rightTorque = rightMass * g * rightArm;
    const isBalanced = Math.abs(leftTorque - rightTorque) < 0.01;

    const state = isBalanced ? 'balanced' : 'unbalanced';

    let explanation = '';
    if (isBalanced) {
      explanation = `左力矩(${leftTorque.toFixed(2)}N·cm) = 右力矩(${rightTorque.toFixed(2)}N·cm)，杠杆平衡。`;
    } else {
      const heavier = leftTorque > rightTorque ? '左' : '右';
      explanation = `左力矩(${leftTorque.toFixed(2)}N·cm) ≠ 右力矩(${rightTorque.toFixed(2)}N·cm)，${heavier}侧更重，杠杆${heavier}倾。`;
    }

    return {
      values: {
        leftTorque,
        rightTorque,
        torqueDifference: Math.abs(leftTorque - rightTorque),
        leftArm,
        rightArm,
        leftMass,
        rightMass,
      },
      state,
      explanation,
    };
  }
}

const leverEngine = new LeverEngine();
export default leverEngine;
