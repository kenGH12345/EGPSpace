/**
 * Math: Function Graph Engine
 *
 * Implements IExperimentEngine for mathematical function plotting.
 * Evaluates expressions and computes derivatives numerically.
 */

import type {
  IExperimentEngine,
  ComputationResult,
  ValidationResult,
  EngineMetadata,
} from '../interface';

export class FunctionGraphEngine implements IExperimentEngine {
  metadata: EngineMetadata = {
    id: 'math/function-graph',
    subject: 'math',
    displayName: 'Function Graph',
    description: 'Plot mathematical functions and compute derivatives and integrals',
    version: '1.0.0',
    capabilities: ['compute', 'validate'],
    supportedElementTypes: ['axis', 'functionPlot', 'point', 'line', 'text'],
  };

  validate(params: Record<string, number>): ValidationResult {
    const errors: { field: string; message: string; severity: 'error' | 'warning' }[] = [];

    const xMin = params.x_min ?? -10;
    const xMax = params.x_max ?? 10;
    const frequency = params.frequency ?? 1;

    if (xMin >= xMax) errors.push({ field: 'x_min', message: 'x_min must be less than x_max', severity: 'error' });
    if (frequency === 0) errors.push({ field: 'frequency', message: 'Frequency cannot be zero', severity: 'error' });

    return { valid: errors.length === 0, errors };
  }

  compute(params: Record<string, number>): ComputationResult {
    const x = params.x ?? 0;
    const amplitude = params.amplitude ?? 1;
    const frequency = params.frequency ?? 1;
    const phase = params.phase ?? 0;
    const functionType = params.function_type ?? 0;
    const xMin = params.x_min ?? -10;
    const xMax = params.x_max ?? 10;
    const samples = params.samples ?? 200;

    const points: { x: number; y: number }[] = [];
    const derivativePoints: { x: number; y: number }[] = [];
    const step = (xMax - xMin) / samples;

    const evaluateFunction = (xv: number): number => {
      switch (functionType) {
        case 0: return amplitude * Math.sin(frequency * xv + phase);
        case 1: return amplitude * Math.cos(frequency * xv + phase);
        case 2: return amplitude * Math.pow(xv, 2) + frequency * xv + phase;
        case 3: return amplitude * Math.exp(frequency * xv);
        default: return amplitude * Math.sin(frequency * xv + phase);
      }
    };

    for (let i = 0; i <= samples; i++) {
      const xv = xMin + i * step;
      const yv = evaluateFunction(xv);
      points.push({ x: xv, y: yv });

      const h = step * 0.01;
      const dy = (evaluateFunction(xv + h) - evaluateFunction(xv - h)) / (2 * h);
      derivativePoints.push({ x: xv, y: dy });
    }

    const currentY = evaluateFunction(x);
    const h = 0.001;
    const currentDerivative = (evaluateFunction(x + h) - evaluateFunction(x - h)) / (2 * h);
    const currentSecondDerivative = (evaluateFunction(x + h) - 2 * currentY + evaluateFunction(x - h)) / (h * h);

    let minY = Infinity;
    let maxY = -Infinity;
    let minX = 0;
    let maxX = 0;
    for (const p of points) {
      if (p.y < minY) { minY = p.y; minX = p.x; }
      if (p.y > maxY) { maxY = p.y; maxX = p.x; }
    }

    const period = functionType < 2 ? (2 * Math.PI / Math.abs(frequency)) : 0;

    const funcNames = ['Sine', 'Cosine', 'Quadratic', 'Exponential'];
    const state = funcNames[functionType] ?? 'Unknown';

    const concavity = currentSecondDerivative > 0.001 ? 'Concave up' : currentSecondDerivative < -0.001 ? 'Concave down' : 'Near inflection';

    return {
      values: {
        y: currentY,
        derivative: currentDerivative,
        secondDerivative: currentSecondDerivative,
        minY,
        maxY,
        minX,
        maxX,
        period,
        amplitude,
        frequency,
        phase,
        concavity,
        stateLabel: state,
      },
      state,
      explanation: `${state}: f(${x.toFixed(2)}) = ${currentY.toFixed(4)}, f' = ${currentDerivative.toFixed(4)}, ${concavity}.`,
      trace: {
        y: { formula: functionType < 2 ? 'A sin(wx+phi)' : 'ax^2+bx+c', inputs: { x, amplitude, frequency, phase }, result: currentY },
      },
    };
  }
}

export default new FunctionGraphEngine();
