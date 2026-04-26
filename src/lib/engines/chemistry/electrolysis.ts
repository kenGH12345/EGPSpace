/**
 * Chemistry: Electrolysis of Water Engine (STUB)
 *
 * Simulates water electrolysis:
 * 2H₂O → 2H₂↑ + O₂↑
 * Cathode (-): 4H⁺ + 4e⁻ → 2H₂
 * Anode (+): 2H₂O → O₂ + 4H⁺ + 4e⁻
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

export class ElectrolysisEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'chemistry/electrolysis',
    subject: 'chemistry',
    displayName: '电解水实验',
    description: '电解水产生氢气和氧气，验证 H₂:O₂ = 2:1 体积比',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['beaker', 'text', 'line'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const current = params.current ?? 1;
    const time = params.time ?? 60;

    if (current <= 0) errors.push({ field: 'current', message: '电流必须大于0', severity: 'error' });
    if (current > 5) errors.push({ field: 'current', message: '电流过大（>5A），可能产生危险', severity: 'warning' });
    if (time < 0) errors.push({ field: 'time', message: '时间不能为负数', severity: 'error' });
    if (time > 3600) errors.push({ field: 'time', message: '通电时间过长（>1h），建议分段实验', severity: 'warning' });

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const current = params.current ?? 1; // A
    const time = params.time ?? 60;      // s
    const electrolyteConc = params.electrolyte_concentration ?? 0.5; // mol/L

    // Faraday's laws:
    // n = I·t / (z·F)
    // For H₂: z=2, F=96485 C/mol
    // For O₂: z=4
    const F = 96485;

    const molesElectrons = (current * time) / F;
    const molesH2 = molesElectrons / 2;
    const molesO2 = molesElectrons / 4;

    // At STP: 1 mol gas = 22.4 L = 22400 mL
    const volH2 = molesH2 * 22400;
    const volO2 = molesO2 * 22400;

    const ratio = volO2 > 0.001 ? volH2 / volO2 : 0;

    return {
      values: {
        h2Volume: volH2,
        o2Volume: volO2,
        molesH2,
        molesO2,
        molesElectrons,
        ratio,
        current,
        time,
        electrolyteConc,
      },
      state: volH2 > 10 ? '明显产气' : '刚开始反应',
      explanation: `[STUB] ${current}A 通电 ${time}s：产生 H₂ ${volH2.toFixed(2)} mL，O₂ ${volO2.toFixed(2)} mL，体积比 ≈ ${ratio.toFixed(2)}:1（理论值 2:1）。`,
      trace: {
        h2Volume: { formula: 'n(e⁻)/2 × 22400', inputs: { molesElectrons }, result: volH2 },
        o2Volume: { formula: 'n(e⁻)/4 × 22400', inputs: { molesElectrons }, result: volO2 },
      },
    };
  }
}

const electrolysisEngine = new ElectrolysisEngine();
export default electrolysisEngine;