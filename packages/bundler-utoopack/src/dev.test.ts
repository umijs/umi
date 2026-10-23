jest.mock('@umijs/bundler-webpack', () => ({
  getConfig: jest.fn(async (opts) => ({
    entry: opts.entry,
    output: {},
    plugins: [],
    resolve: {
      alias: {},
    },
  })),
}));

jest.mock('@utoo/pack', () => ({
  compatOptionsFromWebpack: jest.fn((webpackConfig) => ({
    config: {
      entry: webpackConfig.entry,
      output: {},
      resolve: {
        alias: webpackConfig.resolve?.alias || {},
      },
    },
  })),
  findRootDir: jest.fn((cwd) => cwd),
  serve: jest.fn(),
}));

import { serve } from '@utoo/pack';
import fs from 'fs';
import http from 'http';
import net from 'net';
import os from 'os';
import path from 'path';
import { dev } from './index';

const mockedServe = serve as jest.Mock;
type CreateServer = typeof import('http')['createServer'];
type HttpServer = ReturnType<CreateServer>;
type HttpAgent = import('http').Agent;
type DevOpts = import('./index').IDevOpts;
type Socket = import('net').Socket;
const serverSockets = new WeakMap<HttpServer, Set<Socket>>();
let cwd: string;

beforeEach(() => {
  cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'umi-utoo-dev-'));
  mockedServe.mockReset();
});

afterEach(() => {
  fs.rmSync(cwd, { recursive: true, force: true });
});

function trackSockets(server: HttpServer) {
  if (serverSockets.has(server)) return server;

  const sockets = new Set<Socket>();
  serverSockets.set(server, sockets);
  server.on('connection', (socket) => {
    sockets.add(socket);
    socket.on('close', () => sockets.delete(socket));
  });
  return server;
}

function listen(server: HttpServer, port = 0) {
  return new Promise<number>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, '127.0.0.1', () => {
      server.off('error', reject);
      resolve((server.address() as { port: number }).port);
    });
  });
}

function close(server: HttpServer) {
  return new Promise<void>((resolve, reject) => {
    if (!server.listening) {
      resolve();
      return;
    }

    serverSockets.get(server)?.forEach((socket) => socket.destroy());
    server.closeAllConnections?.();
    server.close((error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

async function getAvailablePortPair(): Promise<number> {
  const first = http.createServer();
  const firstPort = await listen(first);
  const second = http.createServer();

  try {
    await listen(second, firstPort + 1);
  } catch {
    await close(first);
    return getAvailablePortPair();
  }

  await Promise.all([close(first), close(second)]);
  return firstPort;
}

function createBackend(upgrades: string[], body = 'ok', requests?: string[]) {
  const server = trackSockets(
    http.createServer((req, res) => {
      requests?.push(req.url || '');
      res.end(body);
    }),
  );

  server.on('upgrade', (req, socket) => {
    upgrades.push(req.url || '');
    socket.end(
      'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n\r\n',
    );
  });

  return server;
}

function request(port: number, pathname = '/', agent?: HttpAgent) {
  return new Promise<{ statusCode?: number; body: string }>(
    (resolve, reject) => {
      http
        .get(`http://127.0.0.1:${port}${pathname}`, { agent }, (res) => {
          let body = '';
          res.on('data', (chunk) => (body += chunk));
          res.on('end', () => resolve({ statusCode: res.statusCode, body }));
        })
        .on('error', reject);
    },
  );
}

function upgrade(port: number, pathname: string) {
  return new Promise<string>((resolve, reject) => {
    const socket = net.connect(port, '127.0.0.1');
    const timeout = setTimeout(() => {
      socket.destroy();
      reject(new Error(`Timed out upgrading ${pathname}`));
    }, 1000);

    socket.on('connect', () => {
      socket.write(
        `GET ${pathname} HTTP/1.1\r\n` +
          `Host: 127.0.0.1:${port}\r\n` +
          'Connection: Upgrade\r\n' +
          'Upgrade: websocket\r\n' +
          'Sec-WebSocket-Version: 13\r\n' +
          'Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==\r\n\r\n',
      );
    });
    socket.on('data', (data) => {
      clearTimeout(timeout);
      socket.destroy();
      resolve(data.toString());
    });
    socket.on('error', (error) => {
      clearTimeout(timeout);
      reject(error);
    });
  });
}

function deferred() {
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

function devOptions(port: number, extra: Partial<DevOpts> = {}): DevOpts {
  return {
    cwd,
    rootDir: cwd,
    entry: { umi: './src/index.tsx' },
    config: { utoopack: {} },
    host: '127.0.0.1',
    ip: '127.0.0.1',
    port,
    ...extra,
  };
}

async function expectPortReleased(port: number) {
  const probe = http.createServer();
  try {
    await listen(probe, port);
  } finally {
    await close(probe);
  }
}

test('routes WebSocket upgrades to the matching proxy only', async () => {
  const businessUpgrades: string[] = [];
  const utooUpgrades: string[] = [];
  const businessServer = createBackend(businessUpgrades);
  const businessPort = await listen(businessServer);
  const port = await getAvailablePortPair();
  const createdServers: HttpServer[] = [];
  const createServer = http.createServer.bind(http);
  const createServerSpy = jest.spyOn(http, 'createServer').mockImplementation(((
    ...args: Parameters<CreateServer>
  ) => {
    const server = trackSockets(createServer(...args));
    createdServers.push(server);
    return server;
  }) as CreateServer);

  mockedServe.mockImplementation(async (_config, _cwd, _rootDir, opts) => {
    const server = createBackend(utooUpgrades);
    // Report the bound port directly instead of racing to reclaim a probed port.
    const actualPort = await listen(server);
    opts.onReady?.({ port: actualPort, clientPaths: [] });
    return { close: () => close(server) };
  });

  try {
    await dev({
      cwd,
      rootDir: cwd,
      entry: {
        umi: './src/index.tsx',
      },
      config: {
        publicPath: '/',
        utoopack: {},
        proxy: {
          '/ws': {
            target: `ws://127.0.0.1:${businessPort}`,
            ws: true,
          },
        },
      },
      host: '127.0.0.1',
      ip: '127.0.0.1',
      port,
    });

    // http-proxy-middleware subscribes user WebSocket proxies while handling
    // the first regular HTTP request.
    await request(port);
    await upgrade(port, '/ws');
    await upgrade(port, '/turbopack-hmr');

    expect(businessUpgrades).toEqual(['/ws']);
    expect(utooUpgrades).toEqual(['/turbopack-hmr']);
    expect(mockedServe.mock.calls[0][3]).toMatchObject({ returnHandle: true });
    expect(mockedServe.mock.calls[0][3].handleSignals).toBeUndefined();
  } finally {
    createServerSpy.mockRestore();
    await Promise.all([
      close(businessServer),
      ...createdServers.map((server) => close(server)),
    ]);
  }
});

test('waits for readiness and routes to the actual internal port', async () => {
  const port = await getAvailablePortPair();
  const occupiedRequests: string[] = [];
  const occupiedServer = createBackend([], 'unrelated', occupiedRequests);
  await listen(occupiedServer, port + 1);
  const businessServer = createBackend([], 'business');
  const businessPort = await listen(businessServer);
  const utooUpgrades: string[] = [];
  const createdServers: HttpServer[] = [];
  const createServer = http.createServer.bind(http);
  const createServerSpy = jest.spyOn(http, 'createServer').mockImplementation(((
    ...args: Parameters<CreateServer>
  ) => {
    const server = trackSockets(createServer(...args));
    createdServers.push(server);
    return server;
  }) as CreateServer);

  const { promise: ready, resolve: markReady } = deferred();
  const { promise: started, resolve: markStarted } = deferred();
  mockedServe.mockImplementation(async (_config, _cwd, _rootDir, opts) => {
    const server = createBackend(utooUpgrades, 'utoo');
    const actualPort = await listen(server);
    markStarted();
    await ready;
    opts.onReady?.({ port: actualPort, clientPaths: [] });
    return { close: () => close(server) };
  });

  const devPromise = dev({
    cwd,
    rootDir: cwd,
    entry: { umi: './src/index.tsx' },
    config: {
      utoopack: {},
      proxy: { '/api': { target: `http://127.0.0.1:${businessPort}` } },
    },
    host: '127.0.0.1',
    ip: '127.0.0.1',
    port,
  });

  try {
    await started;
    expect((await request(port, '/umi.js')).statusCode).toBe(503);
    expect(await upgrade(port, '/turbopack-hmr')).toContain('503');
    expect((await request(port, '/api/status')).body).toBe('business');

    markReady();
    await devPromise;
    expect((await request(port, '/umi.js')).body).toBe('utoo');
    expect(await upgrade(port, '/turbopack-hmr')).toContain('101');
    expect(utooUpgrades).toEqual(['/turbopack-hmr']);
    expect(occupiedRequests).toEqual([]);
  } finally {
    markReady();
    await devPromise;
    createServerSpy.mockRestore();
    await Promise.all([
      close(occupiedServer),
      close(businessServer),
      ...createdServers.map((server) => close(server)),
    ]);
  }
});

test('closes keepalive and upgraded sockets and waits for asynchronous utoo cleanup once', async () => {
  const port = await getAvailablePortPair();
  const backend = createBackend([], 'utoo');
  backend.removeAllListeners('upgrade');
  backend.on('upgrade', (_req, socket) => {
    socket.write(
      'HTTP/1.1 101 Switching Protocols\r\n' +
        'Upgrade: websocket\r\nConnection: Upgrade\r\n\r\n',
    );
  });
  const backendPort = await listen(backend);
  const finishClose = deferred();
  const closeStarted = deferred();
  const closeUtoo = jest.fn(async () => {
    closeStarted.resolve();
    await finishClose.promise;
    await close(backend);
  });
  mockedServe.mockImplementation(async (_config, _cwd, _rootDir, opts) => {
    opts.onReady({ port: backendPort, clientPaths: ['/umi.js'] });
    return { close: closeUtoo };
  });
  let closeDev!: () => Promise<void>;
  const agent = new http.Agent({ keepAlive: true });
  const socket = new net.Socket();

  try {
    const stats = await dev(
      devOptions(port, {
        onDevServerReady: ({ close }) => (closeDev = close),
      }),
    );
    expect(stats.assets).toEqual([{ name: '/umi.js' }]);
    expect(mockedServe.mock.calls[0][3]).toMatchObject({
      returnHandle: true,
      handleSignals: false,
    });
    await request(port, '/', agent);
    const upgraded = new Promise<void>((resolve, reject) => {
      socket.once('error', reject);
      socket.once('data', () => resolve());
      socket.connect(port, '127.0.0.1', () => {
        socket.write(
          'GET /turbopack-hmr HTTP/1.1\r\n' +
            `Host: 127.0.0.1:${port}\r\n` +
            'Connection: Upgrade\r\nUpgrade: websocket\r\n\r\n',
        );
      });
    });
    await upgraded;
    const socketClosed = new Promise<void>((resolve) => {
      socket.once('close', () => resolve());
    });
    const closing = closeDev();
    expect(closeDev()).toBe(closing);
    let closed = false;
    void closing.then(() => (closed = true));
    await closeStarted.promise;
    await socketClosed;
    await expectPortReleased(port);
    expect(closed).toBe(false);
    expect(closeUtoo).toHaveBeenCalledTimes(1);

    finishClose.resolve();
    await closing;
    expect(closed).toBe(true);
    await expectPortReleased(backendPort);
    expect(closeDev()).toBe(closing);
  } finally {
    finishClose.resolve();
    socket.destroy();
    agent.destroy();
    await closeDev?.();
    await close(backend);
  }
});

test.each(['utoo', 'http', 'both'])(
  'closes all resources even when %s cleanup fails',
  async (failure) => {
    const port = await getAvailablePortPair();
    const backend = createBackend([]);
    const backendPort = await listen(backend);
    const utooError = new Error('utoo cleanup failed');
    const httpError = new Error('http cleanup failed');
    const closeUtoo = jest.fn(async () => {
      await close(backend);
      if (failure !== 'http') throw utooError;
    });
    mockedServe.mockImplementation(async (_config, _cwd, _rootDir, opts) => {
      opts.onReady({ port: backendPort, clientPaths: [] });
      return { close: closeUtoo };
    });
    let closeDev!: () => Promise<void>;
    const createServer = http.createServer.bind(http);
    let outerServer!: HttpServer;
    const createServerSpy = jest
      .spyOn(http, 'createServer')
      .mockImplementation(((...args: Parameters<CreateServer>) => {
        outerServer = createServer(...args);
        return outerServer;
      }) as CreateServer);

    try {
      await dev(
        devOptions(port, {
          onDevServerReady: ({ close }) => (closeDev = close),
        }),
      );
      if (failure !== 'utoo') {
        const closeHttp = outerServer.close.bind(outerServer);
        jest
          .spyOn(outerServer, 'close')
          .mockImplementation((callback) =>
            closeHttp(() => callback?.(httpError)),
          );
      }
      const closing = closeDev();
      if (failure === 'both') {
        await expect(closing).rejects.toMatchObject({
          errors: [httpError, utooError],
        });
      } else {
        await expect(closing).rejects.toBe(
          failure === 'http' ? httpError : utooError,
        );
      }
      expect(closeDev()).toBe(closing);
      expect(closeUtoo).toHaveBeenCalledTimes(1);
      createServerSpy.mockRestore();
      await expectPortReleased(port);
      await expectPortReleased(backendPort);
    } finally {
      createServerSpy.mockRestore();
      await closeDev?.().catch(() => {});
      await close(backend);
    }
  },
);

test('closes the outer server when utoo startup fails', async () => {
  const port = await getAvailablePortPair();
  const started = deferred();
  const failStartup = deferred();
  const startupError = new Error('utoo startup failed');
  mockedServe.mockImplementation(async () => {
    started.resolve();
    await failStartup.promise;
    throw startupError;
  });
  const consoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  let closeDev: (() => Promise<void>) | undefined;
  const onDevServerReady = jest.fn(({ close }) => {
    closeDev = close;
  });
  const devPromise = dev(devOptions(port, { onDevServerReady }));

  try {
    await started.promise;
    expect((await request(port)).statusCode).toBe(503);
    failStartup.resolve();
    await expect(devPromise).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalledWith(startupError.message);
    expect(onDevServerReady).not.toHaveBeenCalled();
    await expectPortReleased(port);
  } finally {
    failStartup.resolve();
    await devPromise;
    await closeDev?.();
    consoleError.mockRestore();
  }
});

test('retains utoo error handling and removes only its own listeners on close', async () => {
  const port = await getAvailablePortPair();
  const backend = createBackend([]);
  const backendPort = await listen(backend);
  mockedServe.mockImplementation(async (_config, _cwd, _rootDir, opts) => {
    opts.onReady({ port: backendPort, clientPaths: [] });
    return { close: () => close(backend) };
  });
  const events = [
    'uncaughtException',
    'unhandledRejection',
    'rejectionHandled',
  ] as const;
  const unrelatedListener = jest.fn();
  events.forEach((event) => process.on(event, unrelatedListener));
  const previousListeners = events.map((event) => process.listeners(event));
  let closeDev!: () => Promise<void>;
  const consoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});

  try {
    await dev(
      devOptions(port, {
        onDevServerReady: ({ close }) => (closeDev = close),
      }),
    );
    events.forEach((event, index) => {
      const listeners = process.listeners(event);
      expect(listeners).toHaveLength(previousListeners[index].length + 1);
      const added = listeners.find(
        (listener) => !previousListeners[index].includes(listener),
      )!;
      const error = new Error(event);
      added(error);
      if (event !== 'rejectionHandled') {
        expect(consoleError).toHaveBeenCalledWith(error);
      }
    });
    expect(unrelatedListener).not.toHaveBeenCalled();
    await closeDev();
    events.forEach((event, index) =>
      expect(process.listeners(event)).toEqual(previousListeners[index]),
    );
  } finally {
    await closeDev?.();
    events.forEach((event) => process.off(event, unrelatedListener));
    consoleError.mockRestore();
    await close(backend);
  }
});

test('waits for and closes a late utoo handle after the outer listen fails', async () => {
  const occupiedServer = http.createServer();
  // Match the outer server's default listen host, including IPv6 on macOS.
  const port = await new Promise<number>((resolve, reject) => {
    occupiedServer.once('error', reject);
    occupiedServer.listen(0, () => {
      occupiedServer.off('error', reject);
      resolve((occupiedServer.address() as { port: number }).port);
    });
  });
  const backend = createBackend([]);
  const backendPort = await listen(backend);
  const started = deferred();
  const finishStartup = deferred();
  const closeUtoo = jest.fn(async () => close(backend));
  mockedServe.mockImplementation(async (_config, _cwd, _rootDir, opts) => {
    started.resolve();
    await finishStartup.promise;
    opts.onReady({ port: backendPort, clientPaths: [] });
    return { close: closeUtoo };
  });
  const consoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  let closeDev: (() => Promise<void>) | undefined;
  const onDevServerReady = jest.fn(({ close }) => {
    closeDev = close;
  });
  const devPromise = dev(devOptions(port, { onDevServerReady }));
  let completed = false;
  void devPromise.then(() => (completed = true));

  try {
    await started.promise;
    await new Promise((resolve) => {
      setImmediate(resolve);
    });
    expect(completed).toBe(false);
    finishStartup.resolve();
    await expect(devPromise).resolves.toBeUndefined();
    expect(onDevServerReady).not.toHaveBeenCalled();
    expect(closeUtoo).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(
      expect.stringContaining('EADDRINUSE'),
    );
    await expectPortReleased(backendPort);
  } finally {
    finishStartup.resolve();
    await devPromise;
    await closeDev?.();
    consoleError.mockRestore();
    await Promise.all([close(occupiedServer), close(backend)]);
  }
});
