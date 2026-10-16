import { portfinder } from '@umijs/utils';
import { ChildProcess, fork } from 'child_process';
import { dev as startDev } from './dev';
import start, { createDevProcess } from './fork';

jest.mock('child_process', () => ({
  ...jest.requireActual('child_process'),
  fork: jest.fn(),
}));

jest.mock('@umijs/utils', () => ({
  logger: { error: jest.fn() },
  portfinder: { getPort: jest.fn() },
}));

class FakeChild extends ChildProcess {
  killed = false;
  exitCode: number | null = null;
  signalCode: NodeJS.Signals | null = null;

  kill = jest.fn((_signal?: NodeJS.Signals | number) => {
    this.killed = true;
    return true;
  });

  exit(code: number | null = 0, signal: NodeJS.Signals | null = null) {
    this.exitCode = code;
    this.signalCode = signal;
    this.emit('exit', code, signal);
  }

  restart(port?: number) {
    this.emit('message', { type: 'RESTART', payload: { port } });
  }
}

type PortCallback = (error: Error | null, port?: number) => void;

const forkMock = fork as jest.Mock;
const getPortMock = portfinder.getPort as jest.Mock;
const scriptPath = '/project/node_modules/umi/bin/forkedDev.js';
const originalArgv = process.argv;
const originalExecArgv = process.execArgv;
const originalSend = process.send;
const originalPort = process.env.PORT;
const originalMock = process.env.MOCK;
const signals = ['SIGINT', 'SIGTERM'] as const;
const originalListeners = signals.map((signal) => process.listeners(signal));
let children: FakeChild[];

beforeEach(() => {
  jest.useFakeTimers();
  jest.resetAllMocks();
  jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  children = [];
  process.argv = ['node', '/project/node_modules/.bin/umi', 'dev'];
  process.execArgv = [];
  process.send = jest.fn() as typeof process.send;
  delete process.env.PORT;
  forkMock.mockImplementation(() => {
    const child = new FakeChild();
    children.push(child);
    return child;
  });
  getPortMock.mockImplementation(
    ({ port }: { port: number }, callback: PortCallback) => {
      callback(null, port);
    },
  );
});

afterEach(() => {
  signals.forEach((signal, index) =>
    process
      .listeners(signal)
      .filter((listener) => !originalListeners[index].includes(listener))
      .forEach((listener) => process.removeListener(signal, listener)),
  );
  jest.restoreAllMocks();
  jest.clearAllTimers();
  jest.useRealTimers();
  process.argv = originalArgv;
  process.execArgv = originalExecArgv;
  process.send = originalSend;
  for (const [key, value] of [
    ['PORT', originalPort],
    ['MOCK', originalMock],
  ]) {
    if (value === undefined) delete process.env[key!];
    else process.env[key!] = value;
  }
});

test('default start preserves the ChildProcess return and fork arguments', () => {
  process.argv.push('--port', '8000');
  process.execArgv = ['--max-old-space-size=4096'];
  process.env.MOCK = 'none';

  const child = start({ scriptPath });

  expect(child).toBe(children[0]);
  expect(child).toBeInstanceOf(ChildProcess);
  expect(forkMock).toHaveBeenCalledWith(scriptPath, ['dev', '--port', '8000'], {
    execArgv: ['--max-old-space-size=4096'],
  });
  const options = forkMock.mock.calls[0][2]!;
  expect(options.execArgv).not.toBe(process.execArgv);
  // Omitting env preserves Node's inheritance of the original launch environment.
  expect(options.env).toBeUndefined();
  expect(process.env.MOCK).toBe('none');
});

test('default start preserves message forwarding', () => {
  const child = start({ scriptPath });
  const message = { type: 'READY', payload: { port: 8000 } };

  child.emit('message', message);

  expect(process.send).toHaveBeenCalledWith(message);
});

test('onChild receives the initial worker and each replacement', async () => {
  const onChild = jest.fn();
  const child = start({ scriptPath, onChild });

  expect(onChild).toHaveBeenCalledTimes(1);
  expect(onChild).toHaveBeenNthCalledWith(1, child);
  for (let index = 0; index < 2; index++) {
    children[index].restart();
    expect(onChild).toHaveBeenCalledTimes(index + 1);
    children[index].exit();
    await jest.advanceTimersByTimeAsync(0);

    expect(onChild).toHaveBeenCalledTimes(index + 2);
    expect(onChild).toHaveBeenNthCalledWith(index + 2, children[index + 1]);
  }
});

test.each([
  ['SIGINT', 0],
  ['SIGTERM', 1],
] as const)(
  'dev waits for the latest worker to exit before exiting with %s status %s',
  async (signal, exitCode) => {
    startDev();
    for (let index = 0; index < 2; index++) {
      children[index].restart();
      children[index].exit();
      await jest.advanceTimersByTimeAsync(0);
    }
    const current = children[2];
    const listener = process
      .listeners(signal)
      .find(
        (candidate) =>
          !originalListeners[signals.indexOf(signal)].includes(candidate),
      )!;

    listener(signal);
    listener(signal);
    await jest.advanceTimersByTimeAsync(0);

    expect(current.kill).toHaveBeenCalledTimes(1);
    expect(current.kill).toHaveBeenCalledWith(signal);
    expect(process.exit).not.toHaveBeenCalled();

    current.exit(null, signal);
    await jest.advanceTimersByTimeAsync(0);

    expect(process.exit).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledWith(exitCode);
    expect(children).toHaveLength(3);
  },
);

test('preserves debugger port increments without changing parent execArgv', async () => {
  process.execArgv = ['--inspect-brk=9229', '--trace-warnings'];
  const child = start({ scriptPath });

  expect(forkMock.mock.calls[0][2].execArgv).toEqual([
    '--inspect-brk=9230',
    '--trace-warnings',
  ]);
  child.emit('message', { type: 'RESTART' });
  children[0].exit();
  await jest.advanceTimersByTimeAsync(0);

  expect(forkMock.mock.calls[1][2].execArgv).toEqual([
    '--inspect-brk=9231',
    '--trace-warnings',
  ]);
  expect(process.execArgv).toEqual(['--inspect-brk=9229', '--trace-warnings']);
});

test('waits for the old worker to exit before restarting', async () => {
  const dev = createDevProcess({ scriptPath });
  const first = children[0];

  first.restart(8000);
  await jest.advanceTimersByTimeAsync(0);
  expect(first.kill).toHaveBeenCalledTimes(1);
  expect(children).toHaveLength(1);

  first.exit();
  await jest.advanceTimersByTimeAsync(0);

  expect(children).toHaveLength(2);
  expect(dev.child).toBe(children[1]);
  expect(getPortMock).toHaveBeenCalledWith(
    { port: 8000 },
    expect.any(Function),
  );
  expect(process.env.PORT).toBe('8000');
});

test('coalesces repeated restart messages from the same worker', async () => {
  const dev = createDevProcess({ scriptPath });
  const first = children[0];

  first.restart();
  first.restart();
  first.exit();
  await jest.advanceTimersByTimeAsync(0);
  first.restart();
  await jest.advanceTimersByTimeAsync(0);

  expect(first.kill).toHaveBeenCalledTimes(1);
  expect(children).toHaveLength(2);
  expect(dev.child).toBe(children[1]);
});

test('stops the current worker after multiple restarts', async () => {
  const dev = createDevProcess({ scriptPath });
  for (let index = 0; index < 2; index++) {
    children[index].restart();
    children[index].exit();
    await jest.advanceTimersByTimeAsync(0);
  }
  const current = children[2];

  const stopped = dev.stop('SIGINT');
  expect(current.kill).toHaveBeenCalledWith('SIGINT');
  current.exit(null, 'SIGINT');
  await stopped;

  expect(children).toHaveLength(3);
  expect(children[0].kill).toHaveBeenCalledTimes(1);
  expect(children[1].kill).toHaveBeenCalledTimes(1);
});

test('stopping while the old worker exits cancels its pending restart', async () => {
  const dev = createDevProcess({ scriptPath });
  const first = children[0];
  first.restart(8000);

  const stopped = dev.stop();
  first.exit();
  await stopped;
  await jest.advanceTimersByTimeAsync(10000);

  expect(children).toHaveLength(1);
  expect(getPortMock).not.toHaveBeenCalled();
});

test('stopping during port polling cancels the next retry', async () => {
  getPortMock.mockImplementation(
    ({ port }: { port: number }, callback: PortCallback) => {
      callback(null, port + 1);
    },
  );
  const dev = createDevProcess({ scriptPath });
  children[0].restart(8000);
  children[0].exit();
  await jest.advanceTimersByTimeAsync(0);
  expect(getPortMock).toHaveBeenCalledTimes(1);

  await dev.stop();
  await jest.advanceTimersByTimeAsync(10000);

  expect(getPortMock).toHaveBeenCalledTimes(1);
  expect(children).toHaveLength(1);
  expect(process.env.PORT).toBeUndefined();
});

test.each(['success', 'error'])(
  'an in-flight port callback cannot restart after stop (%s)',
  async (result) => {
    let completePortCheck!: PortCallback;
    getPortMock.mockImplementation(
      (_options: unknown, callback: PortCallback) => {
        completePortCheck = callback;
      },
    );
    const dev = createDevProcess({ scriptPath });
    children[0].restart(8000);
    children[0].exit();
    await jest.advanceTimersByTimeAsync(0);

    await dev.stop();
    completePortCheck(
      result === 'error' ? new Error('Port check failed') : null,
      8000,
    );
    await jest.advanceTimersByTimeAsync(10000);

    expect(children).toHaveLength(1);
    expect(process.env.PORT).toBeUndefined();
  },
);

test('stop is idempotent and waits for actual worker exit', async () => {
  const dev = createDevProcess({ scriptPath });
  let settled = false;
  const firstStop = dev.stop('SIGTERM').then(() => {
    settled = true;
  });
  const secondStop = dev.stop('SIGINT');
  children[0].restart();
  await jest.advanceTimersByTimeAsync(0);

  expect(children[0].kill).toHaveBeenCalledTimes(1);
  expect(children[0].kill).toHaveBeenCalledWith('SIGTERM');
  expect(settled).toBe(false);

  children[0].exit(null, 'SIGTERM');
  await Promise.all([firstStop, secondStop]);
  await dev.stop();

  expect(settled).toBe(true);
  expect(children[0].kill).toHaveBeenCalledTimes(1);
  expect(children).toHaveLength(1);
});

test('stop escalates after five seconds but still waits for worker exit', async () => {
  const dev = createDevProcess({ scriptPath });
  let settled = false;
  const stopped = dev.stop().then(() => {
    settled = true;
  });
  await jest.advanceTimersByTimeAsync(4999);
  expect(children[0].kill).toHaveBeenCalledTimes(1);
  expect(settled).toBe(false);

  await jest.advanceTimersByTimeAsync(1);
  expect(children[0].kill).toHaveBeenNthCalledWith(2, 'SIGKILL');
  expect(settled).toBe(false);

  children[0].exit(null, 'SIGKILL');
  await stopped;
  expect(settled).toBe(true);
});

test('does not restart a worker that exits without a restart request', async () => {
  const dev = createDevProcess({ scriptPath });
  children[0].exit(1);

  await jest.advanceTimersByTimeAsync(10000);
  await dev.stop();

  expect(children).toHaveLength(1);
  expect(children[0].kill).not.toHaveBeenCalled();
});

test('preserves restart behavior when a port check fails', async () => {
  const error = new Error('Cannot inspect listening ports');
  getPortMock.mockImplementation((_options: unknown, callback: PortCallback) =>
    callback(error),
  );
  createDevProcess({ scriptPath });
  children[0].restart(8000);
  children[0].exit();

  await jest.advanceTimersByTimeAsync(10000);
  expect(children).toHaveLength(2);
  expect(process.env.PORT).toBe('8000');
  expect(getPortMock).toHaveBeenCalledTimes(1);
  expect(process.exit).not.toHaveBeenCalled();
});

test('preserves restart behavior when port retries are exhausted', async () => {
  getPortMock.mockImplementation(
    ({ port }: { port: number }, callback: PortCallback) => {
      callback(null, port + 1);
    },
  );
  createDevProcess({ scriptPath });
  children[0].restart(8000);
  children[0].exit();

  await jest.advanceTimersByTimeAsync(10000);
  expect(children).toHaveLength(2);
  expect(process.env.PORT).toBe('8000');
  expect(getPortMock).toHaveBeenCalledTimes(21);
  expect(process.exit).not.toHaveBeenCalled();
  expect(jest.getTimerCount()).toBe(0);
});
