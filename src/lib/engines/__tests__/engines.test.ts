/**
 * Engine System Tests
 *
 * Covers IExperimentEngine compliance, EngineRegistry behavior,
 * GraphLayoutEngine convergence, and CanvasRenderer.
 */

import { registry } from '../registry';
import { BuoyancyEngine } from '../physics/buoyancy';
import { TitrationEngine } from '../chemistry/titration';
import { GraphLayoutEngine } from '../knowledge-graph/engine';
import { INITIAL_NODES, INITIAL_EDGES } from '../knowledge-graph/data';

describe('Engine Interface Compliance', () => {
  describe('BuoyancyEngine', () => {
    const engine = new BuoyancyEngine();

    test('metadata', () => {
      expect(engine.metadata.id).toBe('physics/buoyancy');
      expect(engine.metadata.subject).toBe('physics');
      expect(engine.metadata.capabilities).toContain('compute');
      expect(engine.metadata.capabilities).toContain('validate');
    });

    test('validate OK', () => {
      expect(engine.validate({ rho_object: 800, rho_liquid: 1000, vol: 0.01 }).valid).toBe(true);
    });

    test('validate negative density', () => {
      const r = engine.validate({ rho_object: -1, rho_liquid: 1000, vol: 0.01 });
      expect(r.valid).toBe(false);
      expect(r.errors[0].field).toBe('rho_object');
    });

    test('compute floating', () => {
      const r = engine.compute({ rho_object: 800, rho_liquid: 1000, vol: 0.01 });
      expect(r.values.immersionRatio).toBeLessThan(1);
      expect(r.state).toBe('上浮');
      expect(r.values.buoyantForce).toBeGreaterThan(0);
    });

    test('compute sinking', () => {
      const r = engine.compute({ rho_object: 1500, rho_liquid: 1000, vol: 0.01 });
      expect(r.values.immersionRatio).toBe(1);
      expect(r.state).toBe('下沉');
    });
  });

  describe('TitrationEngine', () => {
    const engine = new TitrationEngine();

    test('metadata', () => {
      expect(engine.metadata.id).toBe('chemistry/titration');
      expect(engine.metadata.subject).toBe('chemistry');
    });

    test('validate OK', () => {
      expect(engine.validate({ acid_concentration: 0.1, base_concentration: 0.1, acid_volume: 25 }).valid).toBe(true);
    });

    test('compute pure acid', () => {
      const r = engine.compute({ acid_concentration: 0.1, base_concentration: 0.1, acid_volume: 25, base_volume: 0 });
      expect(r.values.pH).toBeCloseTo(1, 0.1);
      expect(r.state).toBe('初始（纯酸）');
    });

    test('compute equivalence', () => {
      const r = engine.compute({ acid_concentration: 0.1, base_concentration: 0.1, acid_volume: 25, base_volume: 25 });
      expect(r.values.pH).toBeCloseTo(7, 0.1);
    });

    test('compute base excess', () => {
      const r = engine.compute({ acid_concentration: 0.1, base_concentration: 0.1, acid_volume: 25, base_volume: 50 });
      expect(r.values.pH).toBeGreaterThan(7);
    });

    test('indicator phenolphthalein', () => {
      const r = engine.compute({
        acid_concentration: 0.1,
        base_concentration: 0.1,
        acid_volume: 25,
        base_volume: 25,
        indicator: 0,
      });
      expect(r.values.indicatorColor).toMatch(/^rgb\(/);
    });
  });
});


describe('EngineRegistry', () => {
  beforeEach(() => registry.clear());

  test('register and get', async () => {
    const e = new BuoyancyEngine();
    registry.register(e);
    expect(registry.list()).toContain('physics/buoyancy');
    const got = await registry.get('physics/buoyancy');
    expect(got).toBe(e);
  });

  test('has', () => {
    registry.register(new BuoyancyEngine());
    expect(registry.has('physics/buoyancy')).toBe(true);
    expect(registry.has('chemistry/titration')).toBe(false);
  });

  test('getMetadata', () => {
    registry.register(new BuoyancyEngine());
    const m = registry.getMetadata('physics/buoyancy');
    expect(m?.subject).toBe('physics');
  });

  test('duplicate registration warns', () => {
    registry.register(new BuoyancyEngine());
    registry.register(new BuoyancyEngine()); // should not throw
    expect(registry.list().length).toBe(1);
  });
});


describe('GraphLayoutEngine', () => {
  test('converges within maxIterations', () => {
    const layout = new GraphLayoutEngine();
    layout.setGraph({ nodes: INITIAL_NODES, edges: INITIAL_EDGES, zoom: 1, panX: 0, panY: 0 });
    layout.run();
    expect(layout.isConverged()).toBe(true);
    const nodes = layout.getNodes();
    expect(nodes.length).toBe(INITIAL_NODES.length);
    // Positions should no longer be the seed values
    expect(nodes.every(n => n.x !== 0 || n.y !== 0)).toBe(true);
  });

  test('tick reduces alpha', () => {
    const layout = new GraphLayoutEngine();
    layout.setGraph({ nodes: INITIAL_NODES, edges: INITIAL_EDGES, zoom: 1, panX: 0, panY: 0 });
    const a0 = layout.tick();
    const a1 = layout.tick();
    expect(a1).toBeLessThan(a0);
  });

  test('restart resets alpha', () => {
    const layout = new GraphLayoutEngine();
    layout.setGraph({ nodes: INITIAL_NODES, edges: INITIAL_EDGES, zoom: 1, panX: 0, panY: 0 });
    layout.run();
    expect(layout.isConverged()).toBe(true);
    layout.restart();
    expect(layout.isConverged()).toBe(false);
  });
});
