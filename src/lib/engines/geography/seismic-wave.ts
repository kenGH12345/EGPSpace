/**
 * Geography: Seismic Wave Engine
 *
 * Implements IExperimentEngine for seismic wave propagation.
 * Calculates P-wave / S-wave velocity differences and epicenter triangulation.
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

export class SeismicWaveEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'geography/seismic-wave',
    subject: 'geography',
    displayName: 'Seismic Wave',
    description: 'P-wave and S-wave velocity difference analysis, earthquake epicenter location',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['circle', 'line', 'point', 'text'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const epicenterDistance = params.epicenter_distance ?? 100;
    const magnitude = params.magnitude ?? 5.0;

    if (epicenterDistance < 0) errors.push({ field: 'epicenter_distance', message: 'Epicenter distance cannot be negative', severity: 'error' });
    if (magnitude < 0) errors.push({ field: 'magnitude', message: 'Magnitude cannot be negative', severity: 'error' });
    if (magnitude > 10) errors.push({ field: 'magnitude', message: 'Magnitude unrealistic (>10 theoretical limit)', severity: 'warning' });

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const epicenterDistance = params.epicenter_distance ?? 100;
    const magnitude = params.magnitude ?? 5.0;
    const focalDepth = params.focal_depth ?? 10;
    const earthLayer = params.earth_layer ?? 0;

    const layerProperties = [
      { name: 'Crust', vp: 6.5, vs: 3.7, density: 2.7 },
      { name: 'Upper Mantle', vp: 8.1, vs: 4.5, density: 3.3 },
      { name: 'Lower Mantle', vp: 13.7, vs: 7.2, density: 5.5 },
    ];

    const layer = layerProperties[earthLayer] ?? layerProperties[0];

    const pWaveTravelTime = epicenterDistance / layer.vp;
    const sWaveTravelTime = epicenterDistance / layer.vs;
    const sMinusPDelay = sWaveTravelTime - pWaveTravelTime;
    const estimatedDistance = sMinusPDelay * 8;

    const pWaveAmplitude = Math.pow(10, magnitude - 3 * Math.log10(epicenterDistance) + 2.92);
    const sWaveAmplitude = pWaveAmplitude * (layer.vp / layer.vs);

    const mmi = Math.min(12, Math.max(1, 1.5 * magnitude - 3.0 * Math.log10(epicenterDistance) + 3.0));

    const intensityDescriptions = [
      'Instrumental', 'Very weak', 'Weak', 'Light', 'Moderate', 'Strong',
      'Very strong', 'Severe', 'Violent', 'Extreme', 'Catastrophic', 'Maximum damage',
    ];
    const intensityDescription = intensityDescriptions[Math.floor(mmi) - 1] ?? 'Unknown';

    const energyJoules = Math.pow(10, 1.5 * magnitude + 4.8);
    const energyTnt = energyJoules / 4.184e9;

    let state: string;
    if (magnitude < 2) state = 'Micro';
    else if (magnitude < 4) state = 'Minor';
    else if (magnitude < 5) state = 'Light';
    else if (magnitude < 7) state = 'Strong';
    else state = 'Major';

    return {
      values: {
        pWaveVelocity: layer.vp,
        sWaveVelocity: layer.vs,
        pWaveTravelTime,
        sWaveTravelTime,
        sMinusPDelay,
        estimatedDistance,
        pWaveAmplitude,
        sWaveAmplitude,
        mmi,
        intensityDescription,
        energyJoules,
        energyTnt,
        stateLabel: state,
      },
      state,
      explanation: `M${magnitude.toFixed(1)} earthquake, epicenter ${epicenterDistance.toFixed(0)} km away, depth ${focalDepth.toFixed(0)} km (${layer.name}). P-wave arrives in ${pWaveTravelTime.toFixed(2)}s, S-wave in ${sWaveTravelTime.toFixed(2)}s, S-P delay ${sMinusPDelay.toFixed(2)}s. Intensity ${mmi.toFixed(1)} (${intensityDescription}), energy ~${energyTnt.toFixed(1)} tons TNT.`,
      trace: {
        sMinusPDelay: { formula: 'D/vs - D/vp', inputs: { epicenterDistance, vp: layer.vp, vs: layer.vs }, result: sMinusPDelay },
      },
    };
  }
}

export default new SeismicWaveEngine();
