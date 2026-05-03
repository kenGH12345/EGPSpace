import { BiologySolver } from './biology/solver';
import { MechanicsSolver } from './mechanics/solver';
import { OpticsSolver } from './optics/solver';
import { EventBus } from '../core/EventBus';

describe('framework domain solver MVPs', () => {
  test('MechanicsSolver advances a finite mass-block state', () => {
    const solver = new MechanicsSolver(new EventBus());

    solver.addStamp({
      componentId: 'mass-1',
      entries: [
        {
          kind: 'mass-block',
          nodes: ['mass-1#center'],
          parameters: { mass: 2, gravity: 9.81 },
        },
      ],
    });

    solver.update(1 / 60);

    expect(solver.lastResults['mass-1'].status).toBe('simulating');
    expect(Number.isFinite(solver.lastResults['mass-1'].y as number)).toBe(true);
    expect(Number.isFinite(solver.lastResults['mass-1'].vy as number)).toBe(true);
  });

  test('MechanicsSolver resets stamps and solved values on clear', () => {
    const solver = new MechanicsSolver(new EventBus());

    solver.addStamp({
      componentId: 'mass-1',
      entries: [{ kind: 'mass-block', nodes: ['mass-1#center'], parameters: {} }],
    });
    solver.update(1 / 60);
    solver.clear();

    expect(solver.lastResults).toEqual({});
  });

  test('OpticsSolver returns bounded ray segments for a light source', () => {
    const solver = new OpticsSolver(new EventBus());

    solver.addStamp({
      componentId: 'light-1',
      entries: [
        {
          kind: 'light-source',
          nodes: ['light-1#emitter'],
          parameters: { intensity: 1, beamAngle: 0, reflectivity: 1, rayLength: 2 },
        },
      ],
    });

    solver.update(1 / 60);

    expect(solver.lastResults['light-1'].illuminated).toBe(true);
    expect(solver.lastResults['light-1'].segmentCount).toBe(5);
    expect(solver.lastResults['light-1'].terminatedBy).toBe('max_bounces');
    expect(Array.isArray(solver.lastResults['light-1'].raySegments)).toBe(true);
  });

  test('BiologySolver grows a plant-cell population within capacity', () => {
    const solver = new BiologySolver(new EventBus());

    solver.addStamp({
      componentId: 'cell-1',
      entries: [
        {
          kind: 'plant-cell',
          nodes: ['cell-1#surface'],
          parameters: {
            isAlive: true,
            population: 10,
            carryingCapacity: 100,
            growthRate: 1,
            hydration: 1,
            sunlight: 1,
            nutrition: 10,
            health: 1,
          },
        },
      ],
    });

    solver.update(1);

    expect(solver.lastResults['cell-1'].status).toBe('simulating');
    expect(solver.lastResults['cell-1'].population as number).toBeGreaterThan(10);
    expect(solver.lastResults['cell-1'].population as number).toBeLessThanOrEqual(100);
  });
});
