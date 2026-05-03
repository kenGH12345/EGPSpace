/**
 * Physics: Pressure Engine
 * Supports both solid pressure and liquid pressure modes.
 */
import type { IExperimentEngine, ComputationResult, ValidationResult, EngineMetadata } from '../interface';

export class PressureEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'physics/pressure',
    subject: 'physics',
    displayName: '压强实验引擎',
    description: '计算固体压强和液体压强',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['block', 'liquid-container', 'force-arrow'],
  };

  validate(params: Record<string, number>): ValidationResult {
    return { valid: true, errors: [] };
  }

  compute(params: Record<string, number | string | any>): ComputationResult {
    const values: Record<string, any> = { components: [], perComponent: {} };
    let pressure = 0;
    
    // Check mode from graph or params
    const mode = params.mode || 'solid';
    
    if (mode === 'solid') {
      const force = Number(params.force) || 50;
      const area = Number(params.area) || 100; // cm^2
      const areaM2 = area / 10000;
      pressure = areaM2 > 0 ? force / areaM2 : 0;
      
      values.pressure = pressure;
      values.components = [
        { id: 'Table1', kind: 'block', props: { isTable: true } },
        { id: 'Block1', kind: 'block', props: { area, force, pressure } },
        { id: 'F1', kind: 'force-arrow', props: { magnitude: force, direction: 'down' } }
      ];
      values.perComponent['Block1'] = { pressure, force, area };
    } else {
      const rho = Number(params.rho) || 1000;
      const depth = Number(params.depth) || 0.5;
      const g = Number(params.g) || 9.8;
      pressure = rho * g * depth;
      
      values.pressure = pressure;
      values.components = [
        { id: 'Container1', kind: 'liquid-container', props: { liquidDensity: rho, depth, pressure } }
      ];
      values.perComponent['Container1'] = { pressure, liquidDensity: rho, depth };
    }

    return {
      values,
      state: 'normal',
      explanation: `压强计算完成：${pressure.toFixed(1)} Pa`,
      trace: {}
    };
  }
}

const engine = new PressureEngine();
export default engine;
