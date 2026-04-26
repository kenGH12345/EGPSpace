/**
 * Geography: Plate Tectonics Engine
 *
 * Implements IExperimentEngine for plate boundary interactions.
 * Simulates convergent, divergent, and transform boundaries.
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

export class PlateTectonicsEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'geography/plate-tectonics',
    subject: 'geography',
    displayName: 'Plate Tectonics',
    description: 'Simulate plate collisions: convergent, divergent and transform boundaries forming trenches, mountains and rifts',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['rect', 'line', 'arrow', 'text'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const plateSpeed = params.plate_speed ?? 5;

    if (plateSpeed < 0) errors.push({ field: 'plate_speed', message: 'Plate speed cannot be negative', severity: 'error' });
    if (plateSpeed > 20) errors.push({ field: 'plate_speed', message: 'Plate speed unrealistic (>20 cm/yr)', severity: 'warning' });

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const boundaryType = params.boundary_type ?? 0;
    const plateSpeed = params.plate_speed ?? 5;
    const density1 = params.plate_density_1 ?? 3.0;
    const density2 = params.plate_density_2 ?? 2.8;
    const oceanicAge = params.oceanic_age ?? 20;

    if (boundaryType === 0) {
      const isSubduction = density1 > density2;
      const trenchDepth = isSubduction ? Math.min(11, 2 + oceanicAge * 0.1 + plateSpeed * 0.3) : 0;
      const mountainHeight = density1 > density2
        ? Math.min(9, (density1 - density2) * 10 + plateSpeed * 0.5)
        : 0;

      const volcanicActivity = isSubduction
        ? Math.min(10, plateSpeed * 0.8 + oceanicAge * 0.05)
        : 0;

      const stressMagnitude = plateSpeed * (Math.abs(density1 - density2) + 0.1) * 10;

      let state: string;
      if (isSubduction && mountainHeight > 3) state = 'Convergent - Subduction Orogeny';
      else if (isSubduction) state = 'Convergent - Trench Subduction';
      else state = 'Convergent - Collision Orogeny';

      return {
        values: {
          boundaryType: 'Convergent',
          isSubduction,
          subductionAngle: 15 + oceanicAge * 0.3,
          trenchDepth,
          mountainHeight,
          volcanicActivity,
          stressMagnitude,
          plateSpeed,
          stateLabel: state,
        },
        state,
        explanation: `Convergent boundary: speed ${plateSpeed.toFixed(1)} cm/yr. ${isSubduction ? 'Denser plate subducts' : 'Plates collide'}. ${trenchDepth > 0 ? `Trench depth ${trenchDepth.toFixed(1)} km. ` : ''}${mountainHeight > 0 ? `Mountain height ${mountainHeight.toFixed(1)} km. ` : ''}${volcanicActivity > 0 ? `Volcanic index ${volcanicActivity.toFixed(1)}.` : ''}`,
        trace: {
          trenchDepth: { formula: '2 + age*0.1 + speed*0.3', inputs: { oceanicAge, plateSpeed }, result: trenchDepth },
        },
      };
    } else if (boundaryType === 1) {
      const riftWidth = plateSpeed * 2;
      const magmaUpwelling = plateSpeed * 1.5;
      const newCrustRate = plateSpeed;
      const heatFlow = 50 + plateSpeed * 15;
      const ridgeHeight = Math.max(0, 2.5 - plateSpeed * 0.08);

      let state: string;
      if (ridgeHeight < 1) state = 'Divergent - Mature Ridge';
      else if (ridgeHeight < 2) state = 'Divergent - Active Rift';
      else state = 'Divergent - Continental Rift';

      return {
        values: {
          boundaryType: 'Divergent',
          riftWidth,
          magmaUpwelling,
          newCrustRate,
          heatFlow,
          ridgeHeight,
          plateSpeed,
          stateLabel: state,
        },
        state,
        explanation: `Divergent boundary: plates separate at ${plateSpeed.toFixed(1)} cm/yr. Rift width ${riftWidth.toFixed(1)} km, heat flow ${heatFlow.toFixed(0)} mW/m^2, ridge height ${ridgeHeight.toFixed(2)} km.`,
      };
    } else {
      const shearStress = plateSpeed * 8;
      const earthquakeFrequency = Math.min(10, plateSpeed * 1.2);
      const faultOffset = plateSpeed * 10;

      return {
        values: {
          boundaryType: 'Transform',
          shearStress,
          earthquakeFrequency,
          faultOffset,
          plateSpeed,
          stateLabel: 'Strike-slip Fault',
        },
        state: 'Transform - Strike-slip Fault',
        explanation: `Transform boundary: plates slide horizontally at ${plateSpeed.toFixed(1)} cm/yr. Shear stress ${shearStress.toFixed(1)} MPa, earthquake frequency index ${earthquakeFrequency.toFixed(1)}.`,
      };
    }
  }
}

export default new PlateTectonicsEngine();
