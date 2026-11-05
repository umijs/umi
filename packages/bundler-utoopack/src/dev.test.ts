jest.mock('@umijs/bundler-webpack', () => ({
  getConfig: jest.fn(async (opts) => ({
    entry: opts.entry,
    output: {},
    plugins: [],
    resolve: {
      alias: {},
    },
  })),
  resolveStaticPathPrefix: ({
    staticPathPrefix,
    userConfig,
  }: {
    staticPathPrefix?: string;
    userConfig?: { staticPathPrefix?: string };
  }) => {
    if (staticPathPrefix !== undefined) return staticPathPrefix;
    if (userConfig?.staticPathPrefix !== undefined) {
      return userConfig.staticPathPrefix;
    }
    return 'static/';
  },
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
type DevServerClientBuildContext =
  import('@utoo/pack').DevServerClientBuildContext;
type CreateServer = typeof import('http')['createServer'];
type HttpServer = ReturnType<CreateServer>;
type Socket = import('net').Socket;
const serverSockets = new WeakMap<HttpServer, Set<Socket>>();
let cwd: string;

beforeEach(() => {
  cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'umi-utoo-dev-'));
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

function request(port: number, pathname = '/') {
  return new Promise<{ statusCode?: number; body: string }>(
    (resolve, reject) => {
      http
        .get(`http://127.0.0.1:${port}${pathname}`, (res) => {
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

test.each([false, true])(
  'publishes current assets for each client build (full stats: %s)',
  async (fullStats) => {
    const port = await getAvailablePortPair();
    const events: string[] = [];
    const onDevCompileDone = jest.fn(
      async ({ isFirstCompile }: { isFirstCompile: boolean; stats: any }) => {
        expect(await request(port, '/check-ready')).toEqual({
          statusCode: 200,
          body: 'backend-ready',
        });
        await new Promise<void>((resolve) => {
          setImmediate(resolve);
        });
        events.push(isFirstCompile ? 'first build' : 'rebuild');
      },
    );
    const backend = createBackend([], 'backend-ready');
    const packClose = jest.fn(() => close(backend));
    let onClientBuild!: (
      context: DevServerClientBuildContext,
    ) => void | Promise<void>;
    let closeDev: (() => Promise<void>) | undefined;
    const writeStats = (clientPaths: string[]) => {
      fs.writeFileSync(
        path.join(cwd, 'stats.json'),
        JSON.stringify({
          assets: clientPaths.map((name) => ({ name })),
          entrypoints: Object.fromEntries(
            ['umi', 'admin'].map((name) => [
              name,
              { assets: clientPaths.map((name) => ({ name })), chunks: [] },
            ]),
          ),
        }),
      );
    };
    mockedServe.mockImplementation(async (_config, _cwd, _rootDir, opts) => {
      onClientBuild = opts.onClientBuild;
      writeStats(['runtime.old.js', 'entry.old.css']);
      // Pack awaits the first callback before its HTTP server is listening.
      await onClientBuild({
        clientPaths: ['runtime.old.js', 'entry.old.css'],
        isRebuild: false,
      });
      expect(onDevCompileDone).not.toHaveBeenCalled();
      const actualPort = await listen(backend);
      events.push('ready');
      await opts.onReady?.({
        port: actualPort,
        clientPaths: ['runtime.old.js', 'entry.old.css'],
      });
      return { close: packClose };
    });

    try {
      const stats = await dev({
        cwd,
        rootDir: cwd,
        entry: { umi: './src/index.tsx', admin: './src/admin.tsx' },
        config: { utoopack: { stats: fullStats, output: { path: cwd } } },
        host: '127.0.0.1',
        port,
        onDevCompileDone,
        onDevServerReady: ({ close }) => {
          closeDev = close;
          events.push('server ready');
        },
      });

      expect(events).toEqual(['ready', 'server ready', 'first build']);
      expect(onDevCompileDone).toHaveBeenCalledTimes(1);
      expect(stats.assets).toEqual([
        { name: 'runtime.old.js' },
        { name: 'entry.old.css' },
      ]);

      writeStats(['runtime.new.js']);
      await onClientBuild({
        clientPaths: ['runtime.new.js', 'runtime.new.js'],
        isRebuild: true,
      });
      expect(events).toEqual([
        'ready',
        'server ready',
        'first build',
        'rebuild',
      ]);
      expect(onDevCompileDone).toHaveBeenCalledTimes(2);
      const rebuilt = onDevCompileDone.mock.calls[1][0];
      expect(rebuilt.isFirstCompile).toBe(false);
      expect(rebuilt.stats.assets).toEqual([{ name: 'runtime.new.js' }]);
      expect(rebuilt.stats.entrypoints.umi.assets).toEqual([
        { name: 'runtime.new.js' },
      ]);
      expect(rebuilt.stats.entrypoints.admin.assets).toEqual([
        { name: 'runtime.new.js' },
      ]);
      // A later compilation must not mutate the previous stats snapshot.
      expect(stats.assets).toEqual([
        { name: 'runtime.old.js' },
        { name: 'entry.old.css' },
      ]);
    } finally {
      await closeDev?.();
      await close(backend);
    }
    expect(packClose).toHaveBeenCalledTimes(1);
  },
);

test('serializes rebuild hooks after the initial hook and recovers after a hook error', async () => {
  const port = await getAvailablePortPair();
  const events: string[] = [];
  let releaseInitialHook!: () => void;
  const initialHookGate = new Promise<void>((resolve) => {
    releaseInitialHook = resolve;
  });
  let markInitialHookStarted!: () => void;
  const initialHookStarted = new Promise<void>((resolve) => {
    markInitialHookStarted = resolve;
  });
  const onDevCompileDone = jest.fn(
    async ({ isFirstCompile }: { isFirstCompile: boolean; stats: any }) => {
      if (isFirstCompile) {
        markInitialHookStarted();
        await initialHookGate;
      }
      events.push(isFirstCompile ? 'first build' : 'rebuild');
    },
  );
  let onClientBuild!: (
    context: DevServerClientBuildContext,
  ) => void | Promise<void>;
  let closeDev: (() => Promise<void>) | undefined;
  mockedServe.mockImplementation(async (_config, _cwd, _rootDir, opts) => {
    onClientBuild = opts.onClientBuild;
    await onClientBuild({ clientPaths: ['initial.js'], isRebuild: false });
    await onClientBuild({
      clientPaths: ['latest-before-ready.js'],
      isRebuild: true,
    });
    await opts.onReady?.({ port: port + 1, clientPaths: ['initial.js'] });
    return { close: async () => {} };
  });

  const devPromise = dev({
    cwd,
    rootDir: cwd,
    entry: { umi: './src/index.tsx' },
    config: { utoopack: {} },
    host: '127.0.0.1',
    port,
    onDevCompileDone,
    onDevServerReady: ({ close }) => {
      closeDev = close;
    },
  });

  try {
    await initialHookStarted;
    expect(onDevCompileDone.mock.calls[0][0].stats.assets).toEqual([
      { name: 'latest-before-ready.js' },
    ]);
    const rebuild = onClientBuild({
      clientPaths: ['rebuilt.js'],
      isRebuild: true,
    });
    await new Promise<void>((resolve) => {
      setImmediate(resolve);
    });
    expect(onDevCompileDone).toHaveBeenCalledTimes(1);
    expect(events).toEqual([]);

    releaseInitialHook();
    await Promise.all([devPromise, rebuild]);
    expect(events).toEqual(['first build', 'rebuild']);
    expect(onDevCompileDone).toHaveBeenCalledTimes(2);
    expect(
      onDevCompileDone.mock.calls.map(([args]) => args.isFirstCompile),
    ).toEqual([true, false]);

    onDevCompileDone.mockRejectedValueOnce(new Error('plugin failed'));
    await expect(
      onClientBuild({ clientPaths: ['failed.js'], isRebuild: true }),
    ).rejects.toThrow('plugin failed');
    await onClientBuild({ clientPaths: ['recovered.js'], isRebuild: true });
    expect(onDevCompileDone).toHaveBeenCalledTimes(4);
    expect(events).toEqual(['first build', 'rebuild', 'rebuild']);
  } finally {
    releaseInitialHook();
    await devPromise;
    await closeDev?.();
  }
});

test('publishes the initial build once for pack versions with only onReady', async () => {
  const port = await getAvailablePortPair();
  const onDevCompileDone = jest.fn();
  let closeDev: (() => Promise<void>) | undefined;
  mockedServe.mockImplementation(async (_config, _cwd, _rootDir, opts) => {
    await opts.onReady?.({
      port: port + 1,
      clientPaths: ['legacy-runtime.js', 'legacy.css'],
    });
    return { close: async () => {} };
  });

  try {
    const stats = await dev({
      cwd,
      rootDir: cwd,
      entry: { umi: './src/index.tsx' },
      config: { utoopack: {} },
      host: '127.0.0.1',
      port,
      onDevCompileDone,
      onDevServerReady: ({ close }) => {
        closeDev = close;
      },
    });

    expect(onDevCompileDone).toHaveBeenCalledTimes(1);
    expect(onDevCompileDone).toHaveBeenCalledWith({
      stats,
      time: expect.any(Number),
      isFirstCompile: true,
    });
    expect(stats.assets).toEqual([
      { name: 'legacy-runtime.js' },
      { name: 'legacy.css' },
    ]);
  } finally {
    await closeDev?.();
  }
});

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

  let markReady!: () => void;
  const ready = new Promise<void>((resolve) => (markReady = resolve));
  let markStarted!: () => void;
  const started = new Promise<void>((resolve) => (markStarted = resolve));
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
