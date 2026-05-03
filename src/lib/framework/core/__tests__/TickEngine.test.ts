import { EventBus } from '../EventBus';
import { TickEngine } from '../TickEngine';
import type { ITickSolver, TickContext } from '../../contracts/solver';

class RecordingSolver implements ITickSolver<void> {
  public calls: Array<{ deltaTime: number; context?: TickContext }> = [];

  constructor(public readonly domain: string) {}

  update(deltaTime: number, context?: TickContext): void {
    this.calls.push({ deltaTime, context });
  }
}

function installAnimationFrameMock() {
  const callbacks: FrameRequestCallback[] = [];
  const requestAnimationFrameSpy = jest.fn((callback: FrameRequestCallback) => {
    callbacks.push(callback);
    return callbacks.length;
  });
  const cancelAnimationFrameSpy = jest.fn();

  Object.defineProperty(globalThis, 'requestAnimationFrame', {
    configurable: true,
    value: requestAnimationFrameSpy,
  });
  Object.defineProperty(globalThis, 'cancelAnimationFrame', {
    configurable: true,
    value: cancelAnimationFrameSpy,
  });

  return { callbacks, requestAnimationFrameSpy, cancelAnimationFrameSpy };
}

describe('TickEngine', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('emits started and stopped events', () => {
    const { requestAnimationFrameSpy, cancelAnimationFrameSpy } = installAnimationFrameMock();
    const bus = new EventBus();
    const engine = new TickEngine(bus);
    const started = jest.fn();
    const stopped = jest.fn();

    bus.on('engine:started', started);
    bus.on('engine:stopped', stopped);

    engine.start();
    engine.stop();

    expect(started).toHaveBeenCalledWith(undefined);
    expect(stopped).toHaveBeenCalledWith(undefined);
    expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1);
    expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(1);
  });

  it('runs automatic ticks with a fixed timestep instead of raw frame delta', () => {
    const { callbacks } = installAnimationFrameMock();
    jest.spyOn(performance, 'now').mockReturnValue(0);
    const bus = new EventBus();
    const engine = new TickEngine(bus);
    const solver = new RecordingSolver('mechanics');

    engine.registerSolver(solver);
    engine.start();
    callbacks[0](1000 / 60);

    expect(solver.calls).toHaveLength(1);
    expect(solver.calls[0]).toEqual({
      deltaTime: 1 / 60,
      context: {
        elapsedTime: 1 / 60,
        tickIndex: 1,
      },
    });
    engine.stop();
  });

  it('limits automatic catch-up work to maxSubsteps per animation frame', () => {
    const { callbacks } = installAnimationFrameMock();
    jest.spyOn(performance, 'now').mockReturnValue(0);
    const bus = new EventBus();
    const engine = new TickEngine(bus);
    const solver = new RecordingSolver('mechanics');

    engine.registerSolver(solver);
    engine.start();
    callbacks[0](1000);

    expect(solver.calls).toHaveLength(5);
    expect(solver.calls.every((call) => call.deltaTime === 1 / 60)).toBe(true);
    engine.stop();
  });

  it('discards excessive backlog after maxSubsteps to avoid death spiral catch-up', () => {
    const { callbacks } = installAnimationFrameMock();
    jest.spyOn(performance, 'now').mockReturnValue(0);
    const bus = new EventBus();
    const engine = new TickEngine(bus);
    const solver = new RecordingSolver('mechanics');

    engine.registerSolver(solver);
    engine.start();
    callbacks[0](1000);
    callbacks[1](1020);

    expect(solver.calls).toHaveLength(6);
    expect(solver.calls.map((call) => call.deltaTime)).toEqual([
      1 / 60,
      1 / 60,
      1 / 60,
      1 / 60,
      1 / 60,
      1 / 60,
    ]);
    engine.stop();
  });

  it('passes TickContext to registered solvers during manual ticks', () => {
    const bus = new EventBus();
    const engine = new TickEngine(bus);
    const solver = new RecordingSolver('mechanics');

    engine.registerSolver(solver);
    engine.tick(0.25);

    expect(solver.calls).toEqual([
      {
        deltaTime: 0.25,
        context: {
          elapsedTime: 0.25,
          tickIndex: 1,
        },
      },
    ]);
  });

  it('emits engine:error when a solver throws and continues with later solvers', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const bus = new EventBus();
    const engine = new TickEngine(bus);
    const thrown = new Error('boom');
    const failingSolver: ITickSolver<void> = {
      domain: 'failing',
      update: () => {
        throw thrown;
      },
    };
    const nextSolver = new RecordingSolver('next');
    const errors: Array<{ domain: string; error: unknown }> = [];

    bus.on('engine:error', (payload) => errors.push(payload));
    engine.registerSolver(failingSolver);
    engine.registerSolver(nextSolver);
    engine.tick(0.1);

    expect(errors).toEqual([{ domain: 'failing', error: thrown }]);
    expect(nextSolver.calls).toHaveLength(1);
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('emits budget_exceeded and skips remaining solvers when the tick budget is exhausted', () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const performanceSpy = jest
      .spyOn(performance, 'now')
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(20);
    const bus = new EventBus();
    const engine = new TickEngine(bus);
    const firstSolver = new RecordingSolver('first');
    const skippedSolver = new RecordingSolver('skipped');
    const budgetEvents: Array<{ domain: string; deltaTime: number }> = [];

    engine.maxBudgetMs = 10;
    bus.on('engine:budget_exceeded', (payload) => budgetEvents.push(payload));
    engine.registerSolver(firstSolver);
    engine.registerSolver(skippedSolver);
    engine.tick(0.5);

    expect(firstSolver.calls).toHaveLength(1);
    expect(skippedSolver.calls).toHaveLength(0);
    expect(budgetEvents).toEqual([{ domain: 'skipped', deltaTime: 0.5 }]);
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
    expect(performanceSpy).toHaveBeenCalled();
  });
});
