/**
 * Math: Probability Distribution Engine
 *
 * Implements IExperimentEngine for probability statistics experiments.
 * Supports Normal distribution and Binomial distribution.
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

export class ProbabilityEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'math/probability',
    subject: 'math',
    displayName: 'Probability Distribution',
    description: 'Statistical probability: Normal and Binomial distributions',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['rect', 'line', 'point', 'text'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const distributionType = params.distribution_type ?? 0;

    if (distributionType === 0) {
      const sigma = params.sigma ?? params.standard_deviation ?? 1;
      if (sigma <= 0) errors.push({ field: 'sigma', message: 'Standard deviation must be > 0', severity: 'error' });
    } else if (distributionType === 1) {
      const n = params.n ?? params.trials ?? 10;
      const p = params.p ?? params.probability ?? 0.5;
      if (n < 0 || !Number.isInteger(n)) errors.push({ field: 'n', message: 'Trials n must be non-negative integer', severity: 'error' });
      if (p < 0 || p > 1) errors.push({ field: 'p', message: 'Probability p must be in [0,1]', severity: 'error' });
    }

    return { valid: errors.length === 0, errors };
  }

  private normalPDF(x: number, mu: number, sigma: number): number {
    const coeff = 1 / (sigma * Math.sqrt(2 * Math.PI));
    const exponent = -0.5 * Math.pow((x - mu) / sigma, 2);
    return coeff * Math.exp(exponent);
  }

  private normalCDF(x: number, mu: number, sigma: number): number {
    const z = (x - mu) / (sigma * Math.sqrt(2));
    const t = 1 / (1 + 0.3275911 * Math.abs(z));
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
    return 0.5 * (1 + Math.sign(z) * erf);
  }

  private binomialCoeff(n: number, k: number): number {
    if (k < 0 || k > n) return 0;
    if (k === 0 || k === n) return 1;
    let res = 1;
    for (let i = 0; i < k; i++) {
      res = res * (n - i) / (i + 1);
    }
    return res;
  }

  private binomialPMF(k: number, n: number, p: number): number {
    if (k < 0 || k > n) return 0;
    return this.binomialCoeff(n, k) * Math.pow(p, k) * Math.pow(1 - p, n - k);
  }

  private binomialCDF(k: number, n: number, p: number): number {
    let sum = 0;
    for (let i = 0; i <= k; i++) {
      sum += this.binomialPMF(i, n, p);
    }
    return sum;
  }

  compute(params: Record<string, number>): ComputationResult {
    const distributionType = params.distribution_type ?? 0;

    if (distributionType === 0) {
      const x = params.x ?? 0;
      const mu = params.mu ?? params.mean ?? 0;
      const sigma = params.sigma ?? params.standard_deviation ?? 1;

      const pdf = this.normalPDF(x, mu, sigma);
      const cdf = this.normalCDF(x, mu, sigma);
      const zScore = (x - mu) / sigma;

      const standardPDF = this.normalPDF(zScore, 0, 1);

      const ci95Low = mu - 1.96 * sigma;
      const ci95High = mu + 1.96 * sigma;
      const ci99Low = mu - 2.576 * sigma;
      const ci99High = mu + 2.576 * sigma;

      const isWithin95 = x >= ci95Low && x <= ci95High;
      const isWithin99 = x >= ci99Low && x <= ci99High;

      let state: string;
      const absZ = Math.abs(zScore);
      if (absZ < 1) state = 'Common (|z|<1)';
      else if (absZ < 2) state = 'Fairly common (|z|<2)';
      else if (absZ < 3) state = 'Rare (2<=|z|<3)';
      else state = 'Extreme (|z|>=3)';

      return {
        values: {
          x,
          mu,
          sigma,
          pdf,
          cdf,
          zScore,
          standardPDF,
          ci95Low,
          ci95High,
          ci99Low,
          ci99High,
          isWithin95,
          isWithin99,
          stateLabel: state,
        },
        state,
        explanation: `N(${mu.toFixed(2)}, ${sigma.toFixed(2)}^2): at x=${x.toFixed(2)}, pdf=${pdf.toFixed(6)}, P(X<=${x.toFixed(2)})=${(cdf * 100).toFixed(2)}%. Z=${zScore.toFixed(3)}, ${state}.`,
        trace: {
          pdf: { formula: '(1/(sigma sqrt(2pi))) * exp(-(x-mu)^2/(2sigma^2))', inputs: { x, mu, sigma }, result: pdf },
        },
      };
    } else {
      const n = params.n ?? params.trials ?? 10;
      const p = params.p ?? params.probability ?? 0.5;
      const k = params.k ?? params.successes ?? Math.floor(n * p);

      const pmf = this.binomialPMF(k, n, p);
      const cdf = this.binomialCDF(k, n, p);
      const mean = n * p;
      const variance = n * p * (1 - p);
      const stdDev = Math.sqrt(variance);

      const mode = Math.floor((n + 1) * p);
      const skewness = (1 - 2 * p) / Math.sqrt(n * p * (1 - p));
      const kurtosis = (1 - 6 * p * (1 - p)) / (n * p * (1 - p));

      return {
        values: {
          n,
          p,
          k,
          pmf,
          cdf,
          mean,
          variance,
          stdDev,
          mode,
          skewness,
          kurtosis,
          stateLabel: 'Binomial',
        },
        state: 'Binomial Calculation',
        explanation: `B(n=${n}, p=${p.toFixed(2)}): P(X=${k})=${(pmf * 100).toFixed(4)}%, P(X<=${k})=${(cdf * 100).toFixed(2)}%. Mean=${mean.toFixed(2)}, variance=${variance.toFixed(2)}.`,
        trace: {
          pmf: { formula: 'C(n,k) * p^k * (1-p)^(n-k)', inputs: { n, k, p }, result: pmf },
        },
      };
    }
  }
}

export default new ProbabilityEngine();
