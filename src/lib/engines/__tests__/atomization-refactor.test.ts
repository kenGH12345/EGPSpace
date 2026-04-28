/**
 * Tests for L2/L4 atomization refactor:
 *  - BuoyancyEngine extended display-layer fields (T-8)
 *  - TitrationEngine extended display-layer fields (T-9)
 *  - CircuitEngine series/parallel (T-10)
 *  - experiment-message-schema compute_request validation (T-1)
 */

import buoyancyEngine from '../physics/buoyancy';
import circuitEngine from '../physics/circuit';
import titrationEngine from '../chemistry/titration';
import { validateIncomingMessage, MESSAGE_SOURCE } from '../../experiment-message-schema';

describe('L2/L4 Atomization Refactor', () => {
  describe('T-8 BuoyancyEngine display fields', () => {
    it('returns materialName/liquidName/hue/badgeKind for floating object', () => {
      const r = buoyancyEngine.compute({ objectDensity: 800, liquidDensity: 1000, volume: 0.01, g: 9.8 });
      expect(r.values.materialName).toBe('塑料');
      expect(r.values.liquidName).toBe('水');
      expect(r.values.badgeKind).toBe('success');
      expect(r.values.badgeText).toContain('上浮');
      expect(typeof r.values.hue).toBe('number');
      expect(r.values.hue as number).toBeGreaterThan(0);
      expect(r.values.hue as number).toBeLessThan(120);
    });

    it('marks dense object as 铜 with danger badge', () => {
      const r = buoyancyEngine.compute({ objectDensity: 8900, liquidDensity: 1000, volume: 0.01 });
      expect(r.values.materialName).toBe('铜');
      expect(r.values.badgeKind).toBe('danger');
      expect(r.values.badgeText).toContain('下沉');
    });

    it('preserves all original v1 fields (backward compat)', () => {
      const r = buoyancyEngine.compute({ objectDensity: 800, liquidDensity: 1000, volume: 0.01, g: 9.8 });
      expect(r.values.immersionRatio).toBeCloseTo(0.8);
      expect(r.values.buoyantForce).toBeCloseTo(78.4, 1);
      expect(r.values.gravity).toBeCloseTo(78.4, 1);
      expect(r.values.mass).toBeCloseTo(8);
      expect(r.values.floatState).toBe('上浮');
    });
  });

  describe('T-9 TitrationEngine display fields', () => {
    it('returns badgeKind/colorName at equivalence point (phenolphthalein)', () => {
      const r = titrationEngine.compute({
        acid_concentration: 0.1, base_concentration: 0.1,
        acid_volume: 25, base_volume: 25, indicator: 0,
      });
      expect(r.values.stateLabel).toBe('等当点');
      expect(r.values.badgeKind).toBe('success');
      expect(r.values.pH).toBeCloseTo(7, 1);
    });

    it('returns colorName based on indicator + pH (methyl orange acidic)', () => {
      const r = titrationEngine.compute({
        acid_concentration: 0.1, base_concentration: 0.1,
        acid_volume: 25, base_volume: 0, indicator: 1,
      });
      // pH ≈ 1, methyl orange: red
      expect(r.values.colorName).toBe('红');
    });
  });

  describe('T-10 CircuitEngine series/parallel', () => {
    it('series: R1=10 + R2=10 → rEq=20, I=0.6 at U=12', () => {
      const r = circuitEngine.compute({ voltage: 12, r1: 10, r2: 10, topology: 0 });
      expect(r.values.rEq).toBe(20);
      expect(r.values.current).toBeCloseTo(0.6, 3);
      expect(r.values.topology).toBe('series');
      expect(r.values.voltageR1).toBeCloseTo(6, 3);
      expect(r.values.voltageR2).toBeCloseTo(6, 3);
    });

    it('parallel: R1=10 // R2=10 → rEq=5, I=2.4 at U=12', () => {
      const r = circuitEngine.compute({ voltage: 12, r1: 10, r2: 10, topology: 1 });
      expect(r.values.rEq).toBe(5);
      expect(r.values.current).toBeCloseTo(2.4, 3);
      expect(r.values.topology).toBe('parallel');
      expect(r.values.currentR1).toBeCloseTo(1.2, 3);
      expect(r.values.currentR2).toBeCloseTo(1.2, 3);
    });

    it('legacy single-resistor call still works (backward compat)', () => {
      const r = circuitEngine.compute({ voltage: 12, resistance: 10 });
      expect(r.values.current).toBeCloseTo(1.2, 3);
      expect(r.values.topology).toBe('single');
    });

    it('returns badgeKind and bulbGlow for display layer', () => {
      const r = circuitEngine.compute({ voltage: 12, r1: 10, r2: 10, topology: 0 });
      expect(['success', 'info', 'warning']).toContain(r.values.badgeKind);
      expect(typeof r.values.bulbGlow).toBe('number');
      expect(r.values.bulbGlow as number).toBeGreaterThanOrEqual(0);
      expect(r.values.bulbGlow as number).toBeLessThanOrEqual(1);
    });
  });

  describe('T-1 Message schema: compute_request validation', () => {
    const validRequest = {
      source: MESSAGE_SOURCE,
      type: 'compute_request',
      templateId: 'physics/buoyancy',
      requestId: '42',
      engineId: 'physics/buoyancy',
      params: { objectDensity: 800, liquidDensity: 1000 },
    };

    it('accepts a valid compute_request', () => {
      const r = validateIncomingMessage(validRequest);
      expect(r).not.toBeNull();
      expect(r?.type).toBe('compute_request');
    });

    it('rejects missing requestId', () => {
      const bad = { ...validRequest, requestId: undefined };
      expect(validateIncomingMessage(bad)).toBeNull();
    });

    it('rejects empty engineId', () => {
      const bad = { ...validRequest, engineId: '' };
      expect(validateIncomingMessage(bad)).toBeNull();
    });

    it('rejects NaN/Infinity param values (security)', () => {
      const badNaN = { ...validRequest, params: { x: NaN } };
      expect(validateIncomingMessage(badNaN)).toBeNull();
      const badInf = { ...validRequest, params: { x: Infinity } };
      expect(validateIncomingMessage(badInf)).toBeNull();
      // After framework upgrade (component graph DTOs), string/boolean/null leaves
      // ARE allowed in params. NaN/Infinity/functions/symbols remain rejected.
      const badFn = { ...validRequest, params: { x: (() => 1) as unknown as number } };
      expect(validateIncomingMessage(badFn)).toBeNull();
      const badSym = { ...validRequest, params: { x: Symbol('s') as unknown as number } };
      expect(validateIncomingMessage(badSym)).toBeNull();
    });

    it('rejects non-object params', () => {
      const bad = { ...validRequest, params: null };
      expect(validateIncomingMessage(bad)).toBeNull();
    });

    it('does not affect legacy message types', () => {
      const ready = {
        source: MESSAGE_SOURCE,
        type: 'ready',
        templateId: 'physics/buoyancy',
        supportedParams: ['volume'],
      };
      expect(validateIncomingMessage(ready)).not.toBeNull();

      const paramChange = {
        source: MESSAGE_SOURCE,
        type: 'param_change',
        templateId: 'physics/buoyancy',
        param: 'volume',
        value: 50,
      };
      expect(validateIncomingMessage(paramChange)).not.toBeNull();
    });
  });
});
