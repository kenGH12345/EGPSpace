import { EventBus, type FrameworkEvents } from '../EventBus';

interface TestEvents extends FrameworkEvents {
  'test:value': { value: number };
}

describe('EventBus', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('invokes subscribers with typed payloads', () => {
    const bus = new EventBus<TestEvents>();
    const handler = jest.fn<void, [{ value: number }]>();

    bus.on('test:value', handler);
    bus.emit('test:value', { value: 42 });

    expect(handler).toHaveBeenCalledWith({ value: 42 });
  });

  it('removes a subscriber through unsubscribe', () => {
    const bus = new EventBus<TestEvents>();
    const handler = jest.fn();

    const unsubscribe = bus.on('test:value', handler);
    unsubscribe();
    bus.emit('test:value', { value: 1 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('keeps off compatible with explicit handler removal', () => {
    const bus = new EventBus<TestEvents>();
    const handler = jest.fn();

    bus.on('test:value', handler);
    bus.off('test:value', handler);
    bus.emit('test:value', { value: 1 });

    expect(handler).not.toHaveBeenCalled();
  });

  it('continues invoking later handlers when one handler throws', () => {
    const bus = new EventBus<TestEvents>();
    const failingHandler = jest.fn(() => {
      throw new Error('handler failed');
    });
    const healthyHandler = jest.fn();

    bus.on('test:value', failingHandler);
    bus.on('test:value', healthyHandler);
    bus.emit('test:value', { value: 7 });

    expect(failingHandler).toHaveBeenCalledTimes(1);
    expect(healthyHandler).toHaveBeenCalledWith({ value: 7 });
    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('emits framework events without payload when payload is undefined', () => {
    const bus = new EventBus();
    const handler = jest.fn();

    bus.on('engine:started', handler);
    bus.emit('engine:started');

    expect(handler).toHaveBeenCalledWith(undefined);
  });
});
