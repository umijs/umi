import { portfinder } from '@umijs/utils';
import { ChildProcess as ChildProcessCtor, fork } from 'child_process';
import { dev } from './dev';
import start from './fork';

jest.mock('@umijs/utils', () => ({
  logger: { error: jest.fn() },
  portfinder: { getPort: jest.fn() },
}));
jest.mock('child_process', () => ({
  ...jest.requireActual('child_process'),
  fork: jest.fn(),
}));

type Child = import('child_process').ChildProcess;

let children: Child[];
const originalPort = process.env.PORT;
const signals = ['SIGINT', 'SIGTERM'] as const;
const originalListeners = signals.map((s) => process.listeners(s));
const flush = () =>
  new Promise((r) => {
    jest.requireActual('timers').setImmediate(r);
  });

const restart = (child: Child, port?: number) =>
  child.emit('message', { type: 'RESTART', payload: { port } });
const exit = (child: Child, code = 0) => {
  Object.defineProperty(child, 'exitCode', { value: code });
  child.emit('exit', code, null);
};

beforeEach(() => {
  children = [];
  jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  jest.mocked(fork).mockImplementation(() => {
    const child = new ChildProcessCtor();
    Object.defineProperty(child, 'connected', {
      value: true,
      configurable: true,
    });
    child.send = jest.fn(() => true);
    jest.spyOn(child, 'kill').mockReturnValue(true);
    children.push(child);
    return child;
  });
  jest.mocked(portfinder.getPort).mockImplementation((opts, cb) => {
    cb!(null!, opts.port!);
  });
});

afterEach(() => {
  process.env.PORT = originalPort;
  signals.forEach((s, i) =>
    process
      .listeners(s)
      .filter((l) => !originalListeners[i].includes(l))
      .forEach((l) => process.removeListener(s, l)),
  );
  jest.useRealTimers();
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

test('waits for the old worker to exit before restarting', async () => {
  const { child } = start({ scriptPath: 'dev.js' });
  restart(child, 8004);
  restart(child, 8004);
  await flush();
  expect(child.send).toHaveBeenCalledTimes(1);
  expect(child.send).toHaveBeenCalledWith(
    { type: 'SHUTDOWN', payload: { signal: 'SIGTERM' } },
    expect.any(Function),
  );
  expect(child.kill).not.toHaveBeenCalled();
  expect(children).toHaveLength(1);

  exit(child);
  await flush();
  expect(portfinder.getPort).toHaveBeenCalledWith(
    { port: 8004 },
    expect.any(Function),
  );
  expect(process.env.PORT).toBe('8004');
  expect(children).toHaveLength(2);
});

test('stops the latest worker and exits after it exits', async () => {
  dev();
  restart(children[0]);
  exit(children[0]);
  await flush();

  process.emit('SIGTERM');
  expect(children[1].send).toHaveBeenCalledWith(
    { type: 'SHUTDOWN', payload: { signal: 'SIGTERM' } },
    expect.any(Function),
  );
  expect(children[1].kill).not.toHaveBeenCalled();
  expect(process.exit).not.toHaveBeenCalled();
  exit(children[1]);
  await flush();
  expect(process.exit).toHaveBeenCalledWith(1);
});

test('does not restart once shutdown has started', async () => {
  dev();
  restart(children[0]);
  process.emit('SIGINT');
  exit(children[0]);
  await flush();
  expect(children).toHaveLength(1);
  expect(children[0].send).toHaveBeenCalledTimes(1);
  expect(process.exit).toHaveBeenCalledWith(0);
});

test('preserves a worker cleanup failure when stopping on SIGINT', async () => {
  dev();
  process.emit('SIGINT');
  exit(children[0], 1);
  await flush();
  expect(process.exit).toHaveBeenCalledWith(1);
});

test('stopping a worker twice shares the same pending termination', async () => {
  const worker = start({ scriptPath: 'dev.js' });
  const first = worker.stop('SIGINT');
  const second = worker.stop('SIGTERM');
  expect(first).toBe(second);
  expect(worker.child.send).toHaveBeenCalledTimes(1);
  expect(worker.child.send).toHaveBeenCalledWith(
    { type: 'SHUTDOWN', payload: { signal: 'SIGINT' } },
    expect.any(Function),
  );
  exit(worker.child);
  await first;
});

test('falls back to a signal if the IPC channel is disconnected', async () => {
  const worker = start({ scriptPath: 'dev.js' });
  Object.defineProperty(worker.child, 'connected', { value: false });
  const stopped = worker.stop('SIGTERM');
  expect(worker.child.send).not.toHaveBeenCalled();
  expect(worker.child.kill).toHaveBeenCalledWith('SIGTERM');
  exit(worker.child);
  await stopped;
});

test.each(['callback', 'throw'])(
  'falls back when sending IPC fails: %s',
  async (failure) => {
    const worker = start({ scriptPath: 'dev.js' });
    jest.mocked(worker.child.send).mockImplementation((...args: any[]) => {
      const error = new Error('IPC channel closed');
      if (failure === 'throw') throw error;
      args[1](error);
      return false;
    });
    const stopped = worker.stop('SIGTERM');
    expect(worker.child.kill).toHaveBeenCalledWith('SIGTERM');
    exit(worker.child);
    await stopped;
  },
);

test('does not kill a worker for IPC backpressure or an error after exit', async () => {
  const worker = start({ scriptPath: 'dev.js' });
  let callback!: (error: Error) => void;
  jest.mocked(worker.child.send).mockImplementation((...args: any[]) => {
    callback = args[1];
    return false;
  });
  const stopped = worker.stop('SIGTERM');
  expect(worker.child.kill).not.toHaveBeenCalled();
  exit(worker.child);
  await stopped;
  callback(new Error('IPC channel closed'));
  expect(worker.child.kill).not.toHaveBeenCalled();
});

test('force kills a worker that does not exit and keeps the port fallback', async () => {
  jest.useFakeTimers({ doNotFake: ['setImmediate'] });
  jest.mocked(portfinder.getPort).mockImplementation((_opts, cb) => {
    cb!(null!, 8001);
  });
  const { child } = start({ scriptPath: 'dev.js' });
  restart(child, 8000);
  jest.advanceTimersByTime(5000);
  expect(child.kill).toHaveBeenLastCalledWith('SIGKILL');

  exit(child);
  for (let i = 0; i < 25; i++) {
    await flush();
    jest.advanceTimersByTime(100);
  }
  expect(portfinder.getPort).toHaveBeenCalledTimes(21);
  expect(process.env.PORT).toBe('8000');
  expect(children).toHaveLength(2);
});
