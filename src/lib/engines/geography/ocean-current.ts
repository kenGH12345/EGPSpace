/**
 * Geography: Ocean Current Engine
 *
 * Implements IExperimentEngine for ocean current simulation.
 * Models Coriolis force and thermohaline circulation effects.
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

export class OceanCurrentEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'geography/ocean-current',
    subject: 'geography',
    displayName: 'Ocean Current',
    description: 'Calculate ocean current direction and velocity driven by Coriolis force and thermohaline circulation',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['arrow', 'line', 'text'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const latitude = params.latitude ?? 30;
    const temperature = params.temperature ?? 20;
    const salinity = params.salinity ?? 35;

    if (latitude < -90 || latitude > 90) errors.push({ field: 'latitude', message: 'Latitude must be between -90 and 90', severity: 'error' });
    if (salinity < 0 || salinity > 50) errors.push({ field: 'salinity', message: 'Salinity unusual (0-50 PSU)', severity: 'error' });
    if (temperature < -5 || temperature > 40) errors.push({ field: 'temperature', message: 'Temperature unusual (-5 to 40 C)', severity: 'error' });

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const latitude = params.latitude ?? 30;
    const windSpeed = params.wind_speed ?? 10;
    const windDirection = params.wind_direction ?? 0;
    const temperature = params.temperature ?? 20;
    const salinity = params.salinity ?? 35;
    const depth = params.depth ?? 0;
    const currentType = params.current_type ?? 0;

    const latRad = (latitude * Math.PI) / 180;
    const omega = 7.292e-5;
    const coriolisParam = 2 * omega * Math.sin(latRad);

    if (currentType === 0) {
      const isNorthernHemisphere = latitude >= 0;
      const ekmanAngle = isNorthernHemisphere ? 90 : -90;
      const currentAngle = windDirection + ekmanAngle;

      const ekmanDepth = 7.6 / Math.sqrt(Math.abs(coriolisParam)) || 100;
      const surfaceSpeed = windSpeed * 0.03;
      const decayFactor = Math.exp(-depth / ekmanDepth);
      const currentSpeed = surfaceSpeed * decayFactor;
      const transport = windSpeed * 0.0127 / (Math.abs(coriolisParam) + 1e-10);

      const avgOceanTemp = 17;
      const tempAnomaly = temperature - avgOceanTemp;

      let state: string;
      if (Math.abs(tempAnomaly) < 2) state = 'Neutral current';
      else if (tempAnomaly > 0) state = 'Warm current';
      else state = 'Cold current';

      return {
        values: {
          currentType: 'Surface',
          currentSpeed,
          currentAngle,
          ekmanDepth,
          surfaceSpeed,
          transport,
          coriolisParam,
          decayFactor,
          tempAnomaly,
          stateLabel: state,
        },
        state,
        explanation: `At ${Math.abs(latitude).toFixed(1)} deg ${isNorthernHemisphere ? 'N' : 'S'}, surface current: wind ${windSpeed.toFixed(1)} m/s -> speed ${(currentSpeed * 100).toFixed(1)} cm/s, direction ${currentAngle.toFixed(0)} deg. ${state}.`,
        trace: {
          currentSpeed: { formula: 'W*0.03*exp(-z/D)', inputs: { windSpeed, depth, ekmanDepth }, result: currentSpeed },
        },
      };
    } else if (currentType === 1) {
      const rho = 1028 - 0.15 * (temperature - 20) + 0.78 * (salinity - 35);
      const densityAnomaly = rho - 1025;

      const depthFactor = depth / 4000;
      const circulationSpeed = Math.max(0.001, densityAnomaly * 0.002 * (1 - depthFactor));

      let state: string;
      if (densityAnomaly > 0.5) state = 'Deep water sinking';
      else if (densityAnomaly < -0.5) state = 'Warm water upwelling';
      else state = 'Horizontal transport';

      return {
        values: {
          currentType: 'Thermohaline',
          density: rho,
          densityAnomaly,
          circulationSpeed,
          coriolisParam,
          stateLabel: state,
        },
        state,
        explanation: `Thermohaline: T=${temperature.toFixed(1)} C, S=${salinity.toFixed(1)} PSU -> density ${rho.toFixed(2)} kg/m^3. ${state}, circ speed ${(circulationSpeed * 100).toFixed(2)} cm/s.`,
        trace: {
          density: { formula: '1028 - 0.15*(T-20) + 0.78*(S-35)', inputs: { temperature, salinity }, result: rho },
        },
      };
    } else {
      const windParallelCoast = params.wind_parallel ?? 1;
      const alongshoreWind = windSpeed * windParallelCoast;

      const ekmanTransport = alongshoreWind / (Math.abs(coriolisParam) + 1e-10);
      const upwellingSpeed = Math.max(0, ekmanTransport * 0.0001);
      const nutrientFlux = upwellingSpeed * 1000;
      const surfaceTemp = temperature - upwellingSpeed * 500;

      let state: string;
      if (upwellingSpeed > 2) state = 'Strong upwelling';
      else if (upwellingSpeed > 0.5) state = 'Moderate upwelling';
      else state = 'Weak/no upwelling';

      return {
        values: {
          currentType: 'Coastal upwelling',
          upwellingSpeed,
          ekmanTransport,
          nutrientFlux,
          surfaceTemp,
          stateLabel: state,
        },
        state,
        explanation: `Coastal upwelling: alongshore wind ${alongshoreWind.toFixed(1)} m/s -> Ekman transport ${ekmanTransport.toFixed(1)} m^2/s, upwelling speed ${upwellingSpeed.toFixed(2)} m/day. Nutrient index ${nutrientFlux.toFixed(0)}.`,
      };
    }
  }
}

export default new OceanCurrentEngine();
