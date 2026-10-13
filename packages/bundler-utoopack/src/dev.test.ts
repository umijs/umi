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
    await listen(server, opts.port);
    opts.onReady?.({ port: opts.port, clientPaths: [] });
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
