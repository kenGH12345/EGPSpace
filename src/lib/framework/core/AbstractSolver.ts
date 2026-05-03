import type { ITickSolver, TickContext } from '../contracts/solver';
import { EventBus, type EventMap, type FrameworkEvents } from './EventBus';

export abstract class AbstractSolver<TEvents extends EventMap = FrameworkEvents>
  implements ITickSolver<void>
{
  public abstract readonly domain: string;
  protected eventBus: EventBus<TEvents>;
  
  public lastExecutionTimeMs: number = 0;

  constructor(eventBus: EventBus<TEvents>) {
    this.eventBus = eventBus;
  }

  public update(deltaTime: number, context?: TickContext): void {
    const start = performance.now();
    
    this.performUpdate(deltaTime, context);
    
    this.lastExecutionTimeMs = performance.now() - start;
  }

  protected abstract performUpdate(deltaTime: number, context?: TickContext): void;
}
