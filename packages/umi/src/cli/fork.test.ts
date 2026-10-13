import { portfinder } from '@umijs/utils';
import { ChildProcess as ChildProcessCtor, fork } from 'child_process';
import { dev } from './dev';
import start from './fork';

jest.mock('@umijs/utils', () => ({
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

const restart = (child: Child, port?: number) =>
  child.emit('message', { type: 'RESTART', payload: { port } });

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
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

test('waits for the old child to exit before restarting', () => {
  const child = start({ scriptPath: 'dev.js' });
  restart(child, 8004);
  restart(child, 8004);
  expect(child.kill).toHaveBeenCalledTimes(1);
  expect(children).toHaveLength(1);

  child.emit('exit', 0, null);

  expect(portfinder.getPort).toHaveBeenCalledWith(
    { port: 8004 },
    expect.any(Function),
  );
  expect(process.env.PORT).toBe('8004');
  expect(children).toHaveLength(2);
});

test('signals the latest child after restarts', () => {
  dev();
  restart(children[0]);
  children[0].emit('exit', 0, null);
  process.emit('SIGTERM');
  expect(children[1].kill).toHaveBeenCalledWith('SIGTERM');
  expect(process.exit).toHaveBeenCalledWith(1);
});

test('preserves restart fallback when the preferred port stays occupied', () => {
  jest.useFakeTimers();
  try {
    jest.mocked(portfinder.getPort).mockImplementation((_opts, cb) => {
      cb!(null!, 8001);
    });
    const child = start({ scriptPath: 'dev.js' });
    restart(child, 8000);
    child.emit('exit', 0, null);
    jest.runAllTimers();

    expect(portfinder.getPort).toHaveBeenCalledTimes(21);
    expect(process.exit).not.toHaveBeenCalled();
    expect(process.env.PORT).toBe('8000');
    expect(children).toHaveLength(2);
  } finally {
    jest.useRealTimers();
  }
});

test('preserves restart fallback when the port lookup fails', () => {
  jest.mocked(portfinder.getPort).mockImplementation((_opts, cb) => {
    cb!(new Error('lookup failed'), 0);
  });
  const child = start({ scriptPath: 'dev.js' });
  restart(child, 8000);
  child.emit('exit', 0, null);

  expect(process.exit).not.toHaveBeenCalled();
  expect(process.env.PORT).toBe('8000');
  expect(children).toHaveLength(2);
});
