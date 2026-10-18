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
  new Promise((r) => jest.requireActual('timers').setImmediate(r));

const restart = (child: Child, port?: number) =>
  child.emit('message', { type: 'RESTART', payload: { port } });
const exit = (child: Child) => {
  Object.defineProperty(child, 'exitCode', { value: 0 });
  child.emit('exit', 0, null);
};

beforeEach(() => {
  children = [];
  jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  jest.mocked(fork).mockImplementation(() => {
    const child = new ChildProcessCtor();
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
  expect(child.kill).toHaveBeenCalledTimes(1);
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
  expect(children[1].kill).toHaveBeenCalledWith('SIGTERM');
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
  expect(process.exit).toHaveBeenCalledWith(0);
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
