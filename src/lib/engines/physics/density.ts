/**
 * Physics: Density Engine
 */
import type { IExperimentEngine, ComputationResult, ValidationResult, EngineMetadata } from '../interface';

export class DensityEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'physics/density',
    subject: 'physics',
    displayName: '密度实验引擎',
    description: '计算物体密度',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['block'],
  };

  validate(params: Record<string, number>): ValidationResult {
    return { valid: true, errors: [] };
  }

  compute(params: Record<string, number | string | any>): ComputationResult {
    const values: Record<string, any> = { components: [], perComponent: {} };
    
    const mass = Number(params.mass) || 100;
    const volume = Number(params.volume) || 1;
    const density = volume > 0 ? mass / volume : 0;
    
    values.density = density;
    values.components = [
      { id: 'Block1', kind: 'block', props: { mass, volume, density } }
    ];
    values.perComponent['Block1'] = { mass, volume, density };

    return {
      values,
      state: 'normal',
      explanation: `密度计算完成：${density.toFixed(2)} kg/m³`,
      trace: {}
    };
  }
}

const engine = new DensityEngine();
export default engine;
