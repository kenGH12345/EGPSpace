import { EventBus, type FrameworkEvents } from '../src/lib/framework/core/EventBus';
import { TickEngine } from '../src/lib/framework/core/TickEngine';
import { AbstractSolver } from '../src/lib/framework/core/AbstractSolver';

interface EngineIntegrationEvents extends FrameworkEvents {
  'mechanics:updated': { deltaTime: number };
}

// Mock implementations for testing
class MockMechanicsSolver extends AbstractSolver<EngineIntegrationEvents> {
  readonly domain = 'mechanics';
  public callCount = 0;
  
  protected performUpdate(deltaTime: number): void {
    this.callCount++;
    this.eventBus.emit('mechanics:updated', { deltaTime });
  }
}

class MockOpticsSolver extends AbstractSolver<EngineIntegrationEvents> {
  readonly domain = 'optics';
  public callCount = 0;
  
  protected performUpdate(): void {
    this.callCount++;
    // Simulate some work
    for(let i=0; i<10000; i++) {} 
  }
}

describe('Core Engine Integration', () => {
  let eventBus: EventBus<EngineIntegrationEvents>;
  let engine: TickEngine<EngineIntegrationEvents>;
  let mechanics: MockMechanicsSolver;
  let optics: MockOpticsSolver;

  beforeEach(() => {
    eventBus = new EventBus<EngineIntegrationEvents>();
    engine = new TickEngine<EngineIntegrationEvents>(eventBus);
    mechanics = new MockMechanicsSolver(eventBus);
    optics = new MockOpticsSolver(eventBus);
    
    engine.registerSolver(mechanics);
    engine.registerSolver(optics);
  });

  afterEach(() => {
    engine.stop();
  });

  it('should successfully register solvers and execute a manual tick', () => {
    let mechanicUpdateCalled = false;
    eventBus.on('mechanics:updated', () => {
      mechanicUpdateCalled = true;
    });

    // Run a manual tick of 0.1 seconds
    engine.tick(0.1);

    expect(mechanics.callCount).toBe(1);
    expect(optics.callCount).toBe(1);
    expect(mechanicUpdateCalled).toBe(true);
    expect(optics.lastExecutionTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('should enforce time budgeting on slow solvers', () => {
    // Create a very slow solver
    class SlowSolver extends AbstractSolver<EngineIntegrationEvents> {
      readonly domain = 'slow';
      protected performUpdate(): void {
        const start = performance.now();
        while(performance.now() - start < 20) {
          // block for 20ms
        }
      }
    }
    
    const slowSolver = new SlowSolver(eventBus);
    // Register it BEFORE optics so optics might be skipped if budget is blown
    // Using a new engine and precise order to guarantee budget exhaustion
    const strictEngine = new TickEngine<EngineIntegrationEvents>(eventBus);
    strictEngine.maxBudgetMs = 10; // Only allow 10ms total
    strictEngine.registerSolver(slowSolver);
    strictEngine.registerSolver(optics);
    
    let budgetExceeded = false;
    eventBus.on('engine:budget_exceeded', () => {
      budgetExceeded = true;
    });

    optics.callCount = 0;
    strictEngine.tick(0.1);
    
    // Slow solver took 20ms, which is > maxBudgetMs (10ms).
    // Therefore, OpticsSolver (which is next in line depending on map iteration order, 
    // but definitely registered after) should be skipped.
    expect(budgetExceeded).toBe(true);
  });
});
