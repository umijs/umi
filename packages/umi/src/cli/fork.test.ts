import { logger, portfinder } from '@umijs/utils';
import { ChildProcess as ChildProcessConstructor, fork } from 'child_process';
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
let originalPort: string | undefined;
let originalSend: typeof process.send;
let originalListeners: Record<'SIGINT' | 'SIGTERM', Function[]>;

function exit(child: Child) {
  Object.defineProperty(child, 'exitCode', { value: 0 });
  child.emit('exit', 0, null);
}

function restart(child: Child, port?: number) {
  child.emit('message', { type: 'RESTART', payload: { port } });
}

function signal(name: 'SIGINT' | 'SIGTERM') {
  const listener = process
    .listeners(name)
    .find((listener) => !originalListeners[name].includes(listener));
  expect(listener).toBeDefined();
  listener!(name);
}

beforeEach(() => {
  jest.useFakeTimers();
  children = [];
  originalPort = process.env.PORT;
  process.env.PORT = 'initial';
  originalSend = process.send;
  process.send = jest.fn();
  originalListeners = {
    SIGINT: process.listeners('SIGINT'),
    SIGTERM: process.listeners('SIGTERM'),
  };
  jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  jest.mocked(fork).mockImplementation(() => {
    const child = new ChildProcessConstructor();
    jest.spyOn(child, 'kill').mockReturnValue(true);
    children.push(child);
    return child;
  });
  jest.mocked(portfinder.getPort).mockImplementation((options, callback) => {
    callback!(null!, options.port!);
  });
});

afterEach(() => {
  for (const name of ['SIGINT', 'SIGTERM'] as const) {
    for (const listener of process.listeners(name)) {
      if (!originalListeners[name].includes(listener)) {
        process.removeListener(name, listener);
      }
    }
  }
  if (originalPort === undefined) delete process.env.PORT;
  else process.env.PORT = originalPort;
  process.send = originalSend;
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.useRealTimers();
});

test.each([
  ['SIGINT', 0],
  ['SIGTERM', 1],
] as const)(
  'signals the current child after two restarts on %s',
  (name, code) => {
    dev();
    restart(children[0], 8000);
    exit(children[0]);
    restart(children[1], 8000);
    exit(children[1]);
    expect(children).toHaveLength(3);

    signal(name);

    expect(children[2].kill).toHaveBeenCalledWith(name);
    expect(children[0].kill).toHaveBeenCalledTimes(1);
    expect(children[1].kill).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledWith(code);
  },
);

test.each([undefined, 8000])(
  'waits for the old child to exit before restarting with port %s',
  (port) => {
    const onChild = jest.fn();
    const child = start({ scriptPath: 'dev.js', onChild });
    expect(child).toBe(children[0]);
    restart(child, port);
    expect(children).toHaveLength(1);
    expect(portfinder.getPort).not.toHaveBeenCalled();

    exit(child);

    expect(children).toHaveLength(2);
    expect(onChild.mock.calls.map(([child]) => child)).toEqual(children);
    if (port) expect(process.env.PORT).toBe(String(port));
  },
);

test('ignores duplicate and stale restart requests and forwards IPC messages', () => {
  const child = start({ scriptPath: 'dev.js' });
  restart(child, 8000);
  restart(child, 8000);
  expect(child.kill).toHaveBeenCalledTimes(1);
  exit(child);
  restart(child, 8000);
  expect(children).toHaveLength(2);
  expect(portfinder.getPort).toHaveBeenCalledTimes(1);
  const data = { type: 'READY', payload: { port: 8000 } };
  children[1].emit('message', data);
  expect(process.send).toHaveBeenLastCalledWith(data);
});

test('does not restart when a child exits without a restart request', () => {
  const child = start({ scriptPath: 'dev.js' });
  exit(child);
  jest.runAllTimers();
  expect(children).toHaveLength(1);
  expect(portfinder.getPort).not.toHaveBeenCalled();
});

test('probes the requested restart port rather than the portfinder default', () => {
  const child = start({ scriptPath: 'dev.js' });
  restart(child, 8004);
  exit(child);
  expect(portfinder.getPort).toHaveBeenCalledWith(
    { port: 8004 },
    expect.any(Function),
  );
  expect(process.env.PORT).toBe('8004');
  expect(children).toHaveLength(2);
});

test('does not restart if shutdown happens while waiting for the old child exit', () => {
  dev();
  restart(children[0], 8000);
  signal('SIGTERM');
  exit(children[0]);
  expect(children).toHaveLength(1);
  expect(children[0].kill).toHaveBeenLastCalledWith('SIGTERM');
  expect(portfinder.getPort).not.toHaveBeenCalled();
});

test('ignores a pending port result after shutdown', () => {
  let validate: (err: Error, port: number) => void;
  jest.mocked(portfinder.getPort).mockImplementation((_options, callback) => {
    validate = callback!;
  });
  dev();
  restart(children[0], 8000);
  exit(children[0]);
  signal('SIGTERM');

  validate!(null!, 8000);

  expect(children).toHaveLength(1);
  expect(process.env.PORT).toBe('initial');
});

test('stops scheduled port retries after shutdown', () => {
  jest.mocked(portfinder.getPort).mockImplementation((_options, callback) => {
    callback!(null!, 8001);
  });
  dev();
  restart(children[0], 8000);
  exit(children[0]);
  signal('SIGTERM');
  jest.runAllTimers();
  expect(portfinder.getPort).toHaveBeenCalledTimes(1);
  expect(children).toHaveLength(1);
  expect(logger.error).not.toHaveBeenCalled();
});

test('reports a portfinder error without starting a replacement', () => {
  const error = new Error('port lookup failed');
  jest.mocked(portfinder.getPort).mockImplementation((_options, callback) => {
    callback!(error, 0);
  });
  const child = start({ scriptPath: 'dev.js' });
  restart(child, 8000);
  exit(child);
  expect(logger.error).toHaveBeenCalledWith(error);
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(children).toHaveLength(1);
  expect(process.env.PORT).toBe('initial');
});

test('fails after retrying an occupied restart port instead of spawning', () => {
  jest.mocked(portfinder.getPort).mockImplementation((_options, callback) => {
    callback!(null!, 8001);
  });
  const child = start({ scriptPath: 'dev.js' });
  restart(child, 8000);
  exit(child);
  jest.runAllTimers();
  expect(portfinder.getPort).toHaveBeenCalledTimes(21);
  expect(logger.error).toHaveBeenCalledWith(new Error('Port 8000 is occupied'));
  expect(process.exit).toHaveBeenCalledWith(1);
  expect(children).toHaveLength(1);
  expect(process.env.PORT).toBe('initial');
});
