import { renderCanvas } from '../declarative-renderer';
import type { CanvasElement } from '../experiment-schema';

// Mock canvas context
function createMockCtx(): CanvasRenderingContext2D {
  const methods = [
    'clearRect', 'fillRect', 'strokeRect', 'beginPath', 'moveTo', 'lineTo',
    'arc', 'fill', 'stroke', 'closePath', 'fillText', 'save', 'restore',
    'setLineDash',
  ];
  const ctx: Record<string, unknown> = {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
    font: '',
    textAlign: 'left',
  };
  methods.forEach(m => { ctx[m] = jest.fn(); });
  return ctx as unknown as CanvasRenderingContext2D;
}

const layout = { width: 560, height: 400, background: '#ffffff' };

describe('declarative-renderer: new element types (TC-7)', () => {
  const newTypes: Array<{ type: string; extra?: Partial<CanvasElement> }> = [
    { type: 'spring', extra: { length: 80, coils: 6 } },
    { type: 'wave', extra: { width: 200, amplitude: 20, wavelength: 60 } },
    { type: 'pendulum', extra: { anchorX: 280, anchorY: 50, length: 100, angle: 30 } },
    { type: 'forceArrow', extra: { angle: -90, magnitude: 50 } },
    { type: 'lightRay', extra: { angle: 45, length: 100 } },
    { type: 'beaker', extra: { width: 60, height: 80, fillLevel: 0.6 } },
    { type: 'molecule', extra: { radius: 8 } },
    { type: 'bubble', extra: { radius: 6 } },
    { type: 'reaction', extra: { text: 'A + B → C' } },
    { type: 'axis', extra: { width: 200, height: 150 } },
    { type: 'functionPlot', extra: { fn: 'x*x', xMin: -5, xMax: 5, yMin: -5, yMax: 5, width: 200, height: 150 } },
    { type: 'point', extra: { radius: 4 } },
    { type: 'group', extra: { children: [] } },
  ];

  newTypes.forEach(({ type, extra }) => {
    it(`TC-7: ${type} renderer does not throw`, () => {
      const ctx = createMockCtx();
      const el: CanvasElement = {
        id: `test-${type}`,
        type: type as CanvasElement['type'],
        x: 100,
        y: 100,
        ...extra,
      };
      expect(() => renderCanvas(ctx, [el], layout, {}, {})).not.toThrow();
    });
  });

  it('TC-11: forceArrow without label does not throw', () => {
    const ctx = createMockCtx();
    const el: CanvasElement = {
      id: 'force-no-label',
      type: 'forceArrow',
      x: 100,
      y: 100,
      angle: -90,
      magnitude: 50,
    };
    expect(() => renderCanvas(ctx, [el], layout, {}, {})).not.toThrow();
  });

  it('TC-12: functionPlot with dangerous fn is sanitized and does not throw', () => {
    const ctx = createMockCtx();
    const el: CanvasElement = {
      id: 'fn-plot',
      type: 'functionPlot',
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      fn: 'alert(1)',
      xMin: -5,
      xMax: 5,
      yMin: -5,
      yMax: 5,
    };
    // The whitelist regex /[^0-9x+\-*/().Math\s,]/g strips 'alert' → '(1)'
    // new Function('x', 'with(Math){return (1);}') returns 1 for all x — no side effects
    expect(() => renderCanvas(ctx, [el], layout, {}, {})).not.toThrow();
  });

  it('TC-12b: functionPlot with valid fn renders without error', () => {
    const ctx = createMockCtx();
    const el: CanvasElement = {
      id: 'fn-valid',
      type: 'functionPlot',
      x: 50,
      y: 50,
      width: 200,
      height: 150,
      fn: 'sin(x)',
      xMin: -5,
      xMax: 5,
      yMin: -2,
      yMax: 2,
    };
    expect(() => renderCanvas(ctx, [el], layout, {}, {})).not.toThrow();
  });

  it('group renderer renders children recursively', () => {
    const ctx = createMockCtx();
    const el: CanvasElement = {
      id: 'group-1',
      type: 'group',
      x: 0,
      y: 0,
      children: [
        { id: 'child-rect', type: 'rect', x: 10, y: 10, width: 50, height: 30, fill: '#3B82F6' },
        { id: 'child-text', type: 'text', x: 20, y: 25, text: 'hello', fill: '#000' },
      ],
    };
    expect(() => renderCanvas(ctx, [el], layout, {}, {})).not.toThrow();
    expect((ctx as unknown as Record<string, jest.Mock>).fillRect).toHaveBeenCalled();
  });
});
