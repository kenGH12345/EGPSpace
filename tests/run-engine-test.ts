import { EventBus } from '../src/lib/framework/core/EventBus';
import { TickEngine } from '../src/lib/framework/core/TickEngine';
import { AbstractSolver } from '../src/lib/framework/core/AbstractSolver';
import { MechanicsSolver } from '../src/lib/framework/domains/mechanics/solver';
import { OpticsSolver } from '../src/lib/framework/domains/optics/solver';
import { BiologySolver } from '../src/lib/framework/domains/biology/solver';

// Mock implementations for testing
class SlowSolver extends AbstractSolver {
  readonly domain = 'slow';
  protected performUpdate(): void {
    const start = performance.now();
    while(performance.now() - start < 20) {
      // block for 20ms
    }
    console.log(`[SlowSolver] Ticked`);
  }
}

async function runTests() {
  console.log('--- Starting Engine Integration Tests ---');
  let passed = 0;
  let failed = 0;

  try {
    const eventBus = new EventBus();
    const engine = new TickEngine(eventBus);
    
    // Inject real solvers
    const mechanics = new MechanicsSolver(eventBus);
    const optics = new OpticsSolver(eventBus);
    const biology = new BiologySolver(eventBus);
    
    // Feed mock components to the solvers
    mechanics.addStamp({
      componentId: 'mass_1',
      entries: [{
        kind: 'mass-block',
        nodes: ['center'],
        parameters: { mass: 10 }
      }]
    });
    
    optics.addStamp({
      componentId: 'lens_1',
      entries: [{
        kind: 'convex-lens',
        nodes: ['in', 'out'],
        parameters: { focalLength: 10 }
      }]
    });
    
    engine.registerSolver(mechanics);
    engine.registerSolver(optics);
    engine.registerSolver(biology);

    console.log('Test 1: Normal Tick');
    engine.tick(0.1);
    
    // Verify results were populated by the real solvers
    if (mechanics.lastResults['mass_1']?.status === 'simulating' && 
        optics.lastResults['lens_1']?.illuminated === true) {
      console.log('✅ Test 1 Passed (Real Solvers executed)');
      passed++;
    } else {
      console.error('❌ Test 1 Failed');
      failed++;
    }

    console.log('Test 2: Time Budget');
    const strictEngine = new TickEngine(eventBus);
    strictEngine.maxBudgetMs = 10;
    const slowSolver = new SlowSolver(eventBus);
    strictEngine.registerSolver(slowSolver);
    strictEngine.registerSolver(optics);

    let budgetExceeded = false;
    eventBus.on('engine:budget_exceeded', () => {
      budgetExceeded = true;
    });

    optics.clear();
    strictEngine.tick(0.1);

    if (budgetExceeded) {
       console.log('✅ Test 2 Passed');
       passed++;
    } else {
       console.error('❌ Test 2 Failed');
       failed++;
    }
  } catch (err) {
    console.error('Test threw an exception:', err);
    failed++;
  }

  console.log(`\n--- Test Summary: ${passed} Passed, ${failed} Failed ---`);
  if (failed > 0) process.exit(1);
}

runTests();
