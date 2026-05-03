export interface FrameworkEvents {
  'engine:started': undefined;
  'engine:stopped': undefined;
  'engine:budget_exceeded': { domain: string; deltaTime: number };
  'engine:error': { domain: string; error: unknown };
}

export type EventMap = object;
export type EventHandler<TPayload> = (payload: TPayload) => void;
export type Unsubscribe = () => void;
export type EmitArgs<TPayload> = undefined extends TPayload
  ? [payload?: TPayload]
  : [payload: TPayload];

type ListenerMap<TEvents extends EventMap> = {
  [K in keyof TEvents]?: Set<EventHandler<TEvents[K]>>;
};

export class EventBus<TEvents extends EventMap = FrameworkEvents> {
  private listeners: ListenerMap<TEvents> = {};

  public on<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): Unsubscribe {
    this.listeners[event] ??= new Set<EventHandler<TEvents[K]>>();
    this.listeners[event]!.add(handler);

    return () => this.off(event, handler);
  }

  public off<K extends keyof TEvents>(event: K, handler: EventHandler<TEvents[K]>): void {
    const handlers = this.listeners[event];
    if (!handlers) return;

    handlers.delete(handler);
    if (handlers.size === 0) {
      delete this.listeners[event];
    }
  }

  public emit<K extends keyof TEvents>(event: K, ...args: EmitArgs<TEvents[K]>): void {
    const handlers = this.listeners[event];
    if (!handlers) return;

    const payload = args[0] as TEvents[K];
    for (const handler of handlers) {
      try {
        handler(payload);
      } catch (err) {
        console.error(`[EventBus] Error executing handler for event "${String(event)}":`, err);
      }
    }
  }

  public clear<K extends keyof TEvents>(event?: K): void {
    if (event !== undefined) {
      delete this.listeners[event];
      return;
    }

    this.listeners = {};
  }
}

export const globalEventBus = new EventBus();
