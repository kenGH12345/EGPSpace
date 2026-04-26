/**
 * Biology: Enzyme Catalysis Engine
 *
 * Implements IExperimentEngine for enzyme kinetics experiments.
 * Uses Michaelis-Menten equation: v = (Vmax x [S]) / (Km + [S])
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

export class EnzymeEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'biology/enzyme',
    subject: 'biology',
    displayName: 'Enzyme Catalysis',
    description: 'Explore enzyme reaction kinetics using Michaelis-Menten equation',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['rect', 'circle', 'line', 'text'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const substrate = params.substrate_concentration ?? 10;
    const vmax = params.vmax ?? 100;
    const km = params.km ?? 50;
    const enzyme = params.enzyme_concentration ?? 1;

    if (substrate < 0) errors.push({ field: 'substrate_concentration', message: 'Substrate concentration cannot be negative', severity: 'error' });
    if (vmax <= 0) errors.push({ field: 'vmax', message: 'Vmax must be > 0', severity: 'error' });
    if (km <= 0) errors.push({ field: 'km', message: 'Km must be > 0', severity: 'error' });
    if (enzyme <= 0) errors.push({ field: 'enzyme_concentration', message: 'Enzyme concentration must be > 0', severity: 'error' });

    if (substrate > 5000) errors.push({ field: 'substrate_concentration', message: 'Substrate concentration unusually high (>5000 mM)', severity: 'warning' });

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const substrate = params.substrate_concentration ?? 10;
    const vmax = params.vmax ?? 100;
    const km = params.km ?? 50;
    const enzyme = params.enzyme_concentration ?? 1;
    const temp = params.temperature ?? 37;
    const ph = params.ph ?? 7.0;

    const tempFactor = Math.pow(2, (temp - 37) / 10);

    const phOptimal = 7.0;
    const phFactor = Math.exp(-Math.pow(ph - phOptimal, 2) / 2);

    const baseRate = (vmax * substrate) / (km + substrate);
    const reactionRate = baseRate * tempFactor * phFactor * enzyme;

    const kcat = vmax / enzyme;
    const catalyticEfficiency = kcat / km;

    const saturation = substrate / (km + substrate);

    let state: string;
    if (saturation < 0.1) {
      state = 'First-order (substrate-limited)';
    } else if (saturation < 0.9) {
      state = 'Mixed-order';
    } else {
      state = 'Zero-order (enzyme-saturated)';
    }

    const saturationColor = saturation > 0.8
      ? '#22c55e'
      : saturation > 0.3
        ? '#f59e0b'
        : '#ef4444';

    return {
      values: {
        reactionRate,
        baseRate,
        kcat,
        catalyticEfficiency,
        saturation,
        tempFactor,
        phFactor,
        stateLabel: state,
        saturationColor,
      },
      state,
      explanation: `Substrate ${substrate.toFixed(1)} mM, Vmax=${vmax.toFixed(1)} uM/s, Km=${km.toFixed(1)} mM. Rate ${reactionRate.toFixed(2)} uM/s. Saturation ${(saturation * 100).toFixed(1)}%. ${state}.`,
      trace: {
        reactionRate: { formula: 'Vmax x [S] / (Km + [S]) x Tfactor x pHfactor x [E]', inputs: { vmax, substrate, km, temp, ph, enzyme }, result: reactionRate },
      },
    };
  }
}

export default new EnzymeEngine();
