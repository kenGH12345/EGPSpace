/**
 * Chemistry: Acid-Base Titration Engine
 *
 * Implements IExperimentEngine for acid-base titration experiments.
 * Uses Henderson-Hasselbalch equation and standard titration formulas.
 *
 * Molecules/ions tracked: H⁺, OH⁻, H₂O, indicator species
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

/* ─── Constants ─── */

// Common indicator color change ranges
const INDICATORS = {
  phenolphthalein: { low: 8.2, high: 10.0, acid: [255, 255, 255], base: [255, 105, 180] },
  methylOrange:    { low: 3.1, high: 4.4, acid: [255, 0, 0],     base: [255, 215, 0] },
  bromothymolBlue: { low: 6.0, high: 7.6, acid: [255, 255, 0],   base: [0, 0, 255] },
} as const;

/* ─── Engine ─── */

export class TitrationEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'chemistry/titration',
    subject: 'chemistry',
    displayName: '酸碱滴定',
    description: '酸碱中和滴定实验：观察 pH 变化和指示剂变色',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['beaker', 'text', 'line'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const acidConc = params.acid_concentration ?? 0.1;
    const baseConc = params.base_concentration ?? 0.1;
    const acidVol = params.acid_volume ?? 25;

    if (acidConc <= 0) errors.push({ field: 'acid_concentration', message: '酸浓度必须大于0', severity: 'error' });
    if (baseConc <= 0) errors.push({ field: 'base_concentration', message: '碱浓度必须大于0', severity: 'error' });
    if (acidVol <= 0)  errors.push({ field: 'acid_volume', message: '酸体积必须大于0', severity: 'error' });

    if (acidConc > 18) errors.push({ field: 'acid_concentration', message: '酸浓度过高（浓HCl≈12M）', severity: 'warning' });
    if (baseConc > 18) errors.push({ field: 'base_concentration', message: '碱浓度过高（浓NaOH≈19M）', severity: 'warning' });

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const acidConc = params.acid_concentration ?? 0.1;
    const baseConc = params.base_concentration ?? 0.1;
    const acidVol = params.acid_volume ?? 25;   // mL
    const baseVol = params.base_volume ?? 0;    // mL, this is the variable
    const indicator = params.indicator ?? 0;    // 0=phenolphthalein, 1=methylOrange, 2=bromothymolBlue

    const molesAcid = acidConc * (acidVol / 1000);
    const molesBase = baseConc * (baseVol / 1000);
    const totalVol = (acidVol + baseVol) / 1000;

    let pH: number;
    let state: string;
    let species: string;

    if (molesBase === 0) {
      // Pure acid
      pH = -Math.log10(acidConc);
      state = '初始（纯酸）';
      species = 'H⁺ 过量';
    } else if (molesBase < molesAcid) {
      // Acid excess
      const excessAcid = molesAcid - molesBase;
      pH = -Math.log10(excessAcid / totalVol);
      state = '酸过量';
      species = 'H⁺ 过量';
    } else if (Math.abs(molesBase - molesAcid) < 0.0001) {
      // Equivalence point — strong acid + strong base = pH 7
      pH = 7.0;
      state = '等当点';
      species = 'H⁺ = OH⁻';
    } else if (molesBase > molesAcid) {
      // Base excess
      const excessBase = molesBase - molesAcid;
      const pOH = -Math.log10(excessBase / totalVol);
      pH = 14 - pOH;
      state = '碱过量';
      species = 'OH⁻ 过量';
    } else {
      pH = 7;
      state = '中性';
      species = 'H⁺ = OH⁻';
    }

    // Clamp pH to [0, 14]
    pH = Math.max(0, Math.min(14, pH));

    const indicatorKey = Object.keys(INDICATORS)[indicator] ?? 'phenolphthalein';
    const ind = INDICATORS[indicatorKey as keyof typeof INDICATORS] ?? INDICATORS.phenolphthalein;

    // Blend color based on pH
    const t = Math.max(0, Math.min(1, (pH - ind.low) / (ind.high - ind.low)));
    const r = Math.round(ind.acid[0] + t * (ind.base[0] - ind.acid[0]));
    const g = Math.round(ind.acid[1] + t * (ind.base[1] - ind.acid[1]));
    const b = Math.round(ind.acid[2] + t * (ind.base[2] - ind.acid[2]));
    const indicatorColor = `rgb(${r}, ${g}, ${b})`;

    // Burette fill level (0-100%)
    const equivVol = (acidConc * acidVol) / baseConc;
    const buretteLevel = Math.min(100, (baseVol / equivVol) * 100);

    return {
      values: {
        pH,
        pOH: 14 - pH,
        molesAcid,
        molesBase,
        totalVolume: acidVol + baseVol,
        equivalenceVolume: equivVol,
        buretteLevel,
        indicatorColor,
        stateLabel: state,
        speciesLabel: species,
      },
      state,
      explanation: `${acidConc}M 酸 ${acidVol}mL + ${baseConc}M 碱 ${baseVol}mL → pH=${pH.toFixed(2)}。${state}。`,
      trace: {
        pH: { formula: '-log[H+]', inputs: { acidConc, baseConc, acidVol, baseVol }, result: pH },
      },
    };
  }
}

const titrationEngine = new TitrationEngine();
export default titrationEngine;
