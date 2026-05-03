import { EventBus, type FrameworkEvents } from './EventBus';
import type { ITickSolver, TickContext } from '../contracts/solver';

export class TickEngine<TEvents extends FrameworkEvents = FrameworkEvents> {
  private solvers: Map<string, ITickSolver> = new Map();
  private isRunning: boolean = false;
  private lastTickTime: number = 0;
  private animationFrameId: number | null = null;
  private tickIndex: number = 0;
  private accumulator: number = 0;
  private lastSolverIndex: number = 0;
  private eventBus: EventBus<TEvents>;
  
  public maxBudgetMs: number = 16;
  public fixedDeltaTime: number = 1 / 60;
  public maxSubsteps: number = 5;
  public maxFrameDeltaTime: number = 0.25;

  constructor(eventBus: EventBus<TEvents>) {
    this.eventBus = eventBus;
  }

  private emitEngineEvent<K extends keyof FrameworkEvents>(
    event: K,
    ...args: undefined extends FrameworkEvents[K]
      ? [payload?: FrameworkEvents[K]]
      : [payload: FrameworkEvents[K]]
  ): void {
    const engineBus = this.eventBus as EventBus<FrameworkEvents>;
    engineBus.emit(event, ...args);
  }

  public registerSolver(solver: ITickSolver): void {
    if (this.solvers.has(solver.domain)) {
      console.warn(`[TickEngine] Solver for domain "${solver.domain}" is being overwritten.`);
    }
    this.solvers.set(solver.domain, solver);
  }

  public unregisterSolver(domain: string): void {
    this.solvers.delete(domain);
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTickTime = performance.now();
    this.accumulator = 0;
    this.loop(this.lastTickTime);
    this.emitEngineEvent('engine:started');
  }

  public stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.emitEngineEvent('engine:stopped');
  }

  private loop = (currentTime: number): void => {
    if (!this.isRunning) return;

    const frameDeltaTime = Math.min(
      Math.max((currentTime - this.lastTickTime) / 1000, 0),
      this.maxFrameDeltaTime,
    );
    this.lastTickTime = currentTime;
    this.accumulator += frameDeltaTime;

    let substepCount = 0;
    while (this.accumulator >= this.fixedDeltaTime && substepCount < this.maxSubsteps) {
      this.tick(this.fixedDeltaTime);
      this.accumulator -= this.fixedDeltaTime;
      substepCount += 1;
    }

    if (substepCount === this.maxSubsteps && this.accumulator >= this.fixedDeltaTime) {
      this.accumulator = 0;
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  public tick(deltaTime: number): void {
    const tickStartTime = performance.now();
    this.tickIndex += 1;
    const context: TickContext = {
      elapsedTime: deltaTime,
      tickIndex: this.tickIndex,
    };

    const solverEntries = Array.from(this.solvers.entries());
    const totalSolvers = solverEntries.length;
    if (totalSolvers === 0) return;

    let solversExecuted = 0;

    while (solversExecuted < totalSolvers) {
      const currentIdx = (this.lastSolverIndex + solversExecuted) % totalSolvers;
      const [domain, solver] = solverEntries[currentIdx];

      if (performance.now() - tickStartTime > this.maxBudgetMs) {
        console.warn(`[TickEngine] Time budget exceeded! Skipping remaining solvers this tick (failed at ${domain}).`);
        this.emitEngineEvent('engine:budget_exceeded', { domain, deltaTime });
        // 记录下次从这个没跑完的开始
        this.lastSolverIndex = currentIdx;
        break;
      }

      try {
        solver.update(deltaTime, context);
      } catch (err) {
        console.error(`[TickEngine] Error executing solver for domain "${domain}":`, err);
        this.emitEngineEvent('engine:error', { domain, error: err });
      }

      solversExecuted += 1;
    }

    if (solversExecuted === totalSolvers) {
      this.lastSolverIndex = 0; // 一轮全部跑完，下一次从头开始
    }
  }
}
