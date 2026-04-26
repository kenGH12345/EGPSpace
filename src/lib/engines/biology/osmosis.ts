/**
 * Biology: Osmosis Engine
 *
 * Implements IExperimentEngine for osmosis experiments.
 * Uses Van't Hoff equation for osmotic pressure calculation.
 *
 * Cell states: isotonic (normal), hypertonic (plasmolysis), hypotonic (lysis)
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

export class OsmosisEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'biology/osmosis',
    subject: 'biology',
    displayName: 'Osmosis',
    description: 'Observe osmotic water movement: understand isotonic, hypertonic and hypotonic effects on cells',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['rect', 'circle', 'arrow', 'text'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const extConc = params.external_concentration ?? 0.3;
    const cellConc = params.cell_concentration ?? 0.3;
    const permeability = params.permeability ?? 0.5;

    if (extConc < 0) errors.push({ field: 'external_concentration', message: 'External concentration cannot be negative', severity: 'error' });
    if (cellConc < 0) errors.push({ field: 'cell_concentration', message: 'Cell concentration cannot be negative', severity: 'error' });
    if (permeability <= 0 || permeability > 1) errors.push({ field: 'permeability', message: 'Permeability should be between 0 and 1', severity: 'error' });

    if (extConc > 2) errors.push({ field: 'external_concentration', message: 'External concentration too high (physiological saline ~0.9%)', severity: 'warning' });

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const extConc = params.external_concentration ?? 0.3;
    const cellConc = params.cell_concentration ?? 0.3;
    const permeability = params.permeability ?? 0.5;
    const tempK = params.temperature ?? 298;

    const R = 0.0821;
    const osmoticPressure = Math.abs(cellConc - extConc) * R * tempK * permeability;

    const concDiff = cellConc - extConc;
    let waterFlow: number;
    let state: string;
    let cellStateLabel: string;
    let cellColor: string;

    if (Math.abs(concDiff) < 0.01) {
      waterFlow = 0;
      state = 'isotonic';
      cellStateLabel = 'Normal (Isotonic)';
      cellColor = '#4ade80';
    } else if (concDiff < 0) {
      waterFlow = -osmoticPressure * 10;
      state = 'hypertonic';
      cellStateLabel = 'Plasmolysis';
      cellColor = '#f87171';
    } else {
      waterFlow = osmoticPressure * 10;
      state = 'hypotonic';
      cellStateLabel = 'Cell Swelling';
      cellColor = '#60a5fa';
    }

    const baseVolume = 1.0;
    const volumeChange = waterFlow * 0.02;
    const cellVolume = Math.max(0.5, Math.min(1.5, baseVolume + volumeChange));

    const flowRate = Math.abs(waterFlow);

    return {
      values: {
        osmoticPressure,
        waterFlow,
        flowRate,
        cellVolume,
        concentrationDiff: concDiff,
        stateLabel: state,
        cellStateLabel,
        cellColor,
      },
      state,
      explanation: `External ${extConc.toFixed(2)}M, cell ${cellConc.toFixed(2)}M. ${state === 'isotonic' ? 'Water in balance' : state === 'hypertonic' ? 'Water leaving cell' : 'Water entering cell'}. Osmotic pressure ${osmoticPressure.toFixed(3)} atm.`,
      trace: {
        osmoticPressure: { formula: '|Ccell - Cext| x R x T x P', inputs: { cellConc, extConc, tempK, permeability }, result: osmoticPressure },
      },
    };
  }
}

export default new OsmosisEngine();
