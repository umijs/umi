const mockRun2 = jest.fn();
const mockApplyPlugins = jest.fn();
const mockFatal = jest.fn();

jest.mock('@umijs/utils', () => ({
  logger: { fatal: mockFatal },
  printHelp: { exit: jest.fn() },
  setNoDeprecation: jest.fn(),
  setNodeTitle: jest.fn(),
  yParser: jest.fn(() => ({})),
}));
jest.mock('../service/service', () => ({
  Service: jest.fn().mockImplementation(() => ({
    run2: mockRun2,
    applyPlugins: mockApplyPlugins,
  })),
}));

const events = [
  'SIGINT',
  'SIGQUIT',
  'SIGTERM',
  'message',
  'disconnect',
] as const;
let originalListeners: ReturnType<typeof process.listeners>[];
let connectedDescriptor: PropertyDescriptor | undefined;

const flush = () =>
  new Promise((resolve) => {
    jest.requireActual('timers').setImmediate(resolve);
  });

function deferred() {
  let resolve!: () => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function start() {
  jest.isolateModules(() => require('./forkedDev'));
}

function disconnect() {
  Object.defineProperty(process, 'connected', { value: false });
  process.emit('disconnect');
}

beforeEach(() => {
  originalListeners = events.map((event) => process.listeners(event));
  connectedDescriptor = Object.getOwnPropertyDescriptor(process, 'connected');
  Object.defineProperty(process, 'connected', {
    configurable: true,
    value: true,
  });
  jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  mockRun2.mockResolvedValue(undefined);
  mockApplyPlugins.mockResolvedValue(undefined);
});

afterEach(() => {
  events.forEach((event, i) => {
    process
      .listeners(event)
      .filter((listener) => !originalListeners[i].includes(listener))
      .forEach((listener) => process.removeListener(event, listener));
  });
  if (connectedDescriptor) {
    Object.defineProperty(process, 'connected', connectedDescriptor);
  } else {
    Reflect.deleteProperty(process, 'connected');
  }
  jest.useRealTimers();
  jest.restoreAllMocks();
  jest.resetAllMocks();
});

test.each(['SIGINT', 'SIGQUIT', 'SIGTERM'] as const)(
  'waits for asynchronous cleanup before exiting on %s',
  async (signal) => {
    const cleanup = deferred();
    mockApplyPlugins.mockReturnValue(cleanup.promise);
    start();
    await flush();

    process.emit(signal);
    await flush();
    expect(mockApplyPlugins).toHaveBeenCalledWith({
      key: 'onExit',
      args: { signal },
    });
    expect(process.exit).not.toHaveBeenCalled();

    cleanup.resolve();
    await flush();
    expect(process.exit).toHaveBeenCalledWith(0);
  },
);

test('waits for startup before cleanup when the parent disconnects', async () => {
  const startup = deferred();
  const cleanup = deferred();
  mockRun2.mockReturnValue(startup.promise);
  mockApplyPlugins.mockReturnValue(cleanup.promise);
  start();

  disconnect();
  await flush();
  expect(mockApplyPlugins).not.toHaveBeenCalled();
  expect(process.exit).not.toHaveBeenCalled();

  startup.resolve();
  await flush();
  expect(mockApplyPlugins).toHaveBeenCalledWith({
    key: 'onExit',
    args: { signal: 'SIGTERM' },
  });
  expect(process.exit).not.toHaveBeenCalled();

  cleanup.resolve();
  await flush();
  expect(process.exit).toHaveBeenCalledWith(0);
});

test('handles an explicit shutdown request over IPC', async () => {
  start();
  await flush();

  process.emit('message', {
    type: 'SHUTDOWN',
    payload: { signal: 'SIGINT' },
  });
  await flush();

  expect(mockApplyPlugins).toHaveBeenCalledWith({
    key: 'onExit',
    args: { signal: 'SIGINT' },
  });
  expect(process.exit).toHaveBeenCalledWith(0);
});

test.each(['shutdown', 'disconnect', 'disconnected'] as const)(
  'waits for startup and existing async signal cleanup on %s',
  async (event) => {
    const startup = deferred();
    const cleanup = deferred();
    const listener = jest.fn(() => cleanup.promise);
    mockRun2.mockImplementation(async () => {
      await startup.promise;
      process.on('SIGTERM', listener);
    });
    if (event === 'disconnected') {
      Object.defineProperty(process, 'connected', { value: false });
    }
    start();
    if (event === 'shutdown') {
      process.emit('message', {
        type: 'SHUTDOWN',
        payload: { signal: 'SIGTERM' },
      });
    } else if (event === 'disconnect') {
      disconnect();
    }
    await flush();
    expect(listener).not.toHaveBeenCalled();

    startup.resolve();
    await flush();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(mockApplyPlugins).toHaveBeenCalledWith({
      key: 'onExit',
      args: { signal: 'SIGTERM' },
    });
    expect(process.exit).not.toHaveBeenCalled();

    cleanup.resolve();
    await flush();
    expect(process.exit).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledWith(0);
  },
);

test('preserves signal listener order, receiver, argument and once semantics', async () => {
  const calls: string[] = [];
  const first = jest.fn(function (this: typeof process, signal) {
    expect(this).toBe(process);
    expect(signal).toBe('SIGINT');
    calls.push('first');
  });
  const once = jest.fn(function (this: typeof process, signal) {
    expect(this).toBe(process);
    expect(signal).toBe('SIGINT');
    calls.push('once');
  });
  process.on('SIGINT', first);
  start();
  process.once('SIGINT', once);
  await flush();

  process.emit('message', {
    type: 'SHUTDOWN',
    payload: { signal: 'SIGINT' },
  });
  await flush();
  expect(calls).toEqual(['first', 'once']);
  expect(process.listeners('SIGINT')).toContain(first);
  expect(process.listeners('SIGINT')).not.toContain(once);
  expect(process.exit).toHaveBeenCalledWith(0);
});

test.each(['before IPC', 'while IPC waits for startup'] as const)(
  'does not dispatch signal listeners twice when a real signal arrives %s',
  async (timing) => {
    const startup = deferred();
    const listener = jest.fn();
    mockRun2.mockReturnValue(startup.promise);
    start();
    process.on('SIGTERM', listener);
    const shutdown = () =>
      process.emit('message', {
        type: 'SHUTDOWN',
        payload: { signal: 'SIGTERM' },
      });

    if (timing === 'before IPC') {
      process.emit('SIGTERM', 'SIGTERM');
      shutdown();
    } else {
      shutdown();
      process.emit('SIGTERM', 'SIGTERM');
    }
    startup.resolve();
    await flush();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(mockApplyPlugins).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledWith(0);
  },
);

test('attempts and waits for all cleanup when signal listeners or onExit fail', async () => {
  const thrownError = new Error('signal listener threw');
  const rejectedError = new Error('signal listener rejected');
  const hookError = new Error('onExit rejected');
  const cleanup = deferred();
  const calls: string[] = [];
  mockApplyPlugins.mockImplementation(() => {
    calls.push('onExit');
    return Promise.reject(hookError);
  });
  start();
  process.on('SIGTERM', () => {
    calls.push('throw');
    throw thrownError;
  });
  process.on('SIGTERM', () => {
    calls.push('reject');
    return Promise.reject(rejectedError);
  });
  process.on('SIGTERM', () => {
    calls.push('pending');
    return cleanup.promise;
  });
  await flush();

  disconnect();
  await flush();
  expect(calls).toEqual(['throw', 'reject', 'pending', 'onExit']);
  expect(process.exit).not.toHaveBeenCalled();

  cleanup.resolve();
  await flush();
  expect(mockFatal).toHaveBeenCalledWith(thrownError);
  expect(mockFatal).toHaveBeenCalledWith(rejectedError);
  expect(mockFatal).toHaveBeenCalledWith(hookError);
  expect(process.exit).toHaveBeenCalledTimes(1);
  expect(process.exit).toHaveBeenCalledWith(1);
});

test('cleans up if the IPC channel was disconnected before startup', async () => {
  Object.defineProperty(process, 'connected', { value: false });
  start();
  await flush();

  expect(mockApplyPlugins).toHaveBeenCalledWith({
    key: 'onExit',
    args: { signal: 'SIGTERM' },
  });
  expect(process.exit).toHaveBeenCalledWith(0);
});

test('still cleans up when startup fails during shutdown', async () => {
  const startup = deferred();
  const error = new Error('startup failed');
  mockRun2.mockReturnValue(startup.promise);
  start();
  disconnect();

  startup.reject(error);
  await flush();
  expect(mockApplyPlugins).toHaveBeenCalledTimes(1);
  expect(mockFatal).toHaveBeenCalledWith(error);
  expect(process.exit).toHaveBeenCalledTimes(1);
  expect(process.exit).toHaveBeenCalledWith(1);
});

test('cleans up only once for repeated shutdown events', async () => {
  const cleanup = deferred();
  mockApplyPlugins.mockReturnValue(cleanup.promise);
  start();
  await flush();

  process.emit('message', {
    type: 'SHUTDOWN',
    payload: { signal: 'SIGTERM' },
  });
  process.emit('SIGINT');
  disconnect();
  await flush();
  expect(mockApplyPlugins).toHaveBeenCalledTimes(1);
  expect(mockApplyPlugins).toHaveBeenCalledWith({
    key: 'onExit',
    args: { signal: 'SIGTERM' },
  });

  cleanup.resolve();
  await flush();
  expect(process.exit).toHaveBeenCalledTimes(1);
  expect(process.exit).toHaveBeenCalledWith(0);
});

test('reports cleanup failures and exits with an error', async () => {
  const error = new Error('cleanup failed');
  mockApplyPlugins.mockRejectedValue(error);
  start();
  await flush();

  disconnect();
  await flush();
  expect(mockFatal).toHaveBeenCalledWith(error);
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(process.exit).not.toHaveBeenCalledWith(0);
});

test('preserves a failure status set by an exit hook that continues cleanup', async () => {
  const originalExitCode = process.exitCode;
  mockApplyPlugins.mockImplementation(async () => {
    process.exitCode = 1;
  });
  try {
    start();
    await flush();
    disconnect();
    await flush();
    expect(process.exit).toHaveBeenCalledWith(1);
  } finally {
    process.exitCode = originalExitCode;
  }
});

test.each(['startup', 'cleanup'] as const)(
  'exits after the parent disconnects even if %s never finishes',
  async (phase) => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] });
    const pending = deferred();
    if (phase === 'startup') {
      mockRun2.mockReturnValue(pending.promise);
    } else {
      mockApplyPlugins.mockReturnValue(pending.promise);
    }
    start();
    await flush();

    disconnect();
    await flush();
    jest.advanceTimersByTime(4999);
    expect(process.exit).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1);
    expect(process.exit).toHaveBeenCalledWith(1);

    pending.resolve();
    await flush();
  },
);
