import { buildPresetElements } from '../preset-templates';

const layout = { width: 560, height: 400, background: '#ffffff' };

describe('buildPresetElements', () => {
  describe('TC-1: buoyancy preset', () => {
    it('returns non-empty elements array', () => {
      const els = buildPresetElements('buoyancy', layout, {}, {});
      expect(els.length).toBeGreaterThanOrEqual(5);
    });

    it('contains liquid-bg and object-body elements', () => {
      const els = buildPresetElements('buoyancy', layout, {}, {});
      const ids = els.map(e => e.id);
      expect(ids).toContain('liquid-bg');
      expect(ids).toContain('object-body');
    });

    it('uses stateNum=1 (floating) for green color', () => {
      const els = buildPresetElements('buoyancy', layout, {}, { state: 1 });
      const body = els.find(e => e.id === 'object-body');
      expect(body?.fill).toBe('#10B981');
    });

    it('uses stateNum=-1 (sinking) for red color', () => {
      const els = buildPresetElements('buoyancy', layout, {}, { state: -1 });
      const body = els.find(e => e.id === 'object-body');
      expect(body?.fill).toBe('#EF4444');
    });

    it('includes buoyancy-arrow when buoyantForce > 0', () => {
      const els = buildPresetElements('buoyancy', layout, {}, { buoyantForce: 50, gravity: 20 });
      const ids = els.map(e => e.id);
      expect(ids).toContain('buoyancy-arrow');
    });
  });

  describe('TC-2: lever preset', () => {
    it('returns non-empty elements array', () => {
      const params = { leftArm: 20, rightArm: 20, leftMass: 2, rightMass: 2 };
      const els = buildPresetElements('lever', layout, params, {});
      expect(els.length).toBeGreaterThanOrEqual(8);
    });

    it('contains fulcrum and lever-beam', () => {
      const els = buildPresetElements('lever', layout, {}, {});
      const ids = els.map(e => e.id);
      expect(ids).toContain('fulcrum');
      expect(ids).toContain('lever-beam');
    });

    it('shows balanced state label when isBalanced=1', () => {
      const els = buildPresetElements('lever', layout, {}, { isBalanced: 1 });
      const label = els.find(e => e.id === 'state-label');
      expect(label?.text).toContain('平衡');
    });
  });

  describe('TC-3: refraction preset', () => {
    it('returns non-empty elements array', () => {
      const els = buildPresetElements('refraction', layout, { incidentAngle: 30 }, { refractionAngle: 20 });
      expect(els.length).toBeGreaterThanOrEqual(9);
    });

    it('contains air-region and medium-region', () => {
      const els = buildPresetElements('refraction', layout, {}, {});
      const ids = els.map(e => e.id);
      expect(ids).toContain('air-region');
      expect(ids).toContain('medium-region');
    });

    it('TC-10: shows total-reflection-ray when isTotalReflection=1', () => {
      const els = buildPresetElements('refraction', layout, { incidentAngle: 45 }, { isTotalReflection: 1 });
      const ids = els.map(e => e.id);
      expect(ids).toContain('total-reflection-ray');
      expect(ids).not.toContain('refraction-ray');
    });

    it('shows refraction-ray when isTotalReflection=0', () => {
      const els = buildPresetElements('refraction', layout, { incidentAngle: 30 }, { refractionAngle: 20, isTotalReflection: 0 });
      const ids = els.map(e => e.id);
      expect(ids).toContain('refraction-ray');
      expect(ids).not.toContain('total-reflection-ray');
    });
  });

  describe('TC-4: circuit preset', () => {
    it('returns non-empty elements array', () => {
      const els = buildPresetElements('circuit', layout, { resistance: 10 }, { voltage: 12, current: 1.2 });
      expect(els.length).toBeGreaterThanOrEqual(10);
    });

    it('contains battery and resistor', () => {
      const els = buildPresetElements('circuit', layout, {}, {});
      const ids = els.map(e => e.id);
      expect(ids).toContain('battery');
      expect(ids).toContain('resistor');
    });

    it('displays correct voltage label', () => {
      const els = buildPresetElements('circuit', layout, {}, { voltage: 9 });
      const label = els.find(e => e.id === 'voltage-label');
      expect(label?.text).toContain('9.0V');
    });
  });

  describe('TC-5: unknown type', () => {
    it('returns empty array for unknown type', () => {
      const els = buildPresetElements('unknown_type', layout, {}, {});
      expect(els).toEqual([]);
    });

    it('returns empty array for empty string type', () => {
      const els = buildPresetElements('', layout, {}, {});
      expect(els).toEqual([]);
    });
  });

  describe('TC-13: empty params/computed (boundary values)', () => {
    it('buoyancy does not throw with empty params', () => {
      expect(() => buildPresetElements('buoyancy', layout, {}, {})).not.toThrow();
    });

    it('lever does not throw with empty params', () => {
      expect(() => buildPresetElements('lever', layout, {}, {})).not.toThrow();
    });

    it('refraction does not throw with empty params', () => {
      expect(() => buildPresetElements('refraction', layout, {}, {})).not.toThrow();
    });

    it('circuit does not throw with empty params', () => {
      expect(() => buildPresetElements('circuit', layout, {}, {})).not.toThrow();
    });

    it('all elements have required id and type fields', () => {
      ['buoyancy', 'lever', 'refraction', 'circuit'].forEach(type => {
        const els = buildPresetElements(type, layout, {}, {});
        els.forEach(el => {
          expect(el.id).toBeTruthy();
          expect(el.type).toBeTruthy();
        });
      });
    });
  });
});
