/**
 * type-guards 单测（E 阶段 · AC-E9）
 * 验证 5 个 discriminated union type predicate 正负样本各 1
 */

import { describe, test, expect } from '@jest/globals';
import {
  asFlask,
  asReagent,
  asBubble,
  asSolid,
  asThermometer,
} from '../type-guards';
import { Flask, Reagent, Bubble, Solid, Thermometer } from '../components';

describe('E · chemistry type-guards', () => {
  const flask = new Flask('f1', { volumeML: 100, shape: 'beaker' });
  const reagent = new Reagent('r1', { formula: 'HCl', moles: 1, concentration: 1, phase: 'aq' });
  const bubble = new Bubble('b1', { gas: 'H2', rateMolPerTick: 0.01 });
  const solid = new Solid('s1', { formula: 'Zn', massG: 10, state: 'intact' });
  const thermometer = new Thermometer('t1', { tempC: 25, range: [0, 100] });

  test('TG-1 · asFlask 正样本 · 负样本', () => {
    expect(asFlask(flask)).toBe(true);
    expect(asFlask(reagent)).toBe(false);
    expect(asFlask(solid)).toBe(false);
  });

  test('TG-2 · asReagent 正样本 · 负样本', () => {
    expect(asReagent(reagent)).toBe(true);
    expect(asReagent(flask)).toBe(false);
    expect(asReagent(bubble)).toBe(false);
  });

  test('TG-3 · asBubble 正样本 · 负样本', () => {
    expect(asBubble(bubble)).toBe(true);
    expect(asBubble(reagent)).toBe(false);
  });

  test('TG-4 · asSolid 正样本 · 负样本', () => {
    expect(asSolid(solid)).toBe(true);
    expect(asSolid(reagent)).toBe(false);
  });

  test('TG-5 · asThermometer 正样本 · 负样本', () => {
    expect(asThermometer(thermometer)).toBe(true);
    expect(asThermometer(flask)).toBe(false);
  });

  test('TG-6 · narrow 后可访问具名字段（类型级别）', () => {
    // 运行时验证 narrow 后的字段访问不炸
    if (asReagent(reagent)) {
      // 这些访问在 TS narrow 后静态已知
      expect(typeof reagent.props.formula).toBe('string');
      expect(typeof reagent.props.concentration).toBe('number');
      expect(typeof reagent.props.moles).toBe('number');
    }
    if (asFlask(flask)) {
      expect(typeof flask.props.volumeML).toBe('number');
    }
  });
});
