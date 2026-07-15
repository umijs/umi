import { createHttpsServer, createProxy } from '@umijs/bundler-utils';
import express from '@umijs/bundler-utils/compiled/express';
import { createProxyMiddleware } from '@umijs/bundler-utils/compiled/http-proxy-middleware';
import { lodash } from '@umijs/utils';
import type { DevServerReadyContext } from '@utoo/pack';
import fs from 'fs';
import http from 'http';
import path from 'path';
import {
  getDevUtooPackConfig,
  getProdUtooPackConfig,
  getSSRUtooPackConfig,
  IDevOpts,
  normalizeUtoopackPath,
} from './config';
import type { IOpts } from './types';
import { getBuildBanner, getDevBanner } from './util';
export { findRootDir } from '@utoo/pack';
export * from './config';
export type { IUtoopackUserConfig } from './types';

export function isUtoopackProxyStartupError(error: any, utooServePort: number) {
  return (
    error?.code === 'ECONNREFUSED' &&
    Number(error?.port) === utooServePort &&
    (!error?.address || error.address === '127.0.0.1')
  );
}

function addStatsCompatibility(stats: any) {
  stats.hasErrors = () => false;
  stats.toJson = () => stats;
  stats.toString = () => {};
  stats.compilation = {
    ...stats,
    assets: (stats.assets || []).reduce(
      (acc: Record<string, any>, cur: any) =>
        Object.assign(acc, { [cur.name]: cur }),
      {} as Record<string, any>,
    ),
  };
  return stats;
}

export function createDevStatsFromClientPaths(
  clientPaths: string[] | undefined,
  entryNames: string[],
) {
  const assets = Array.from(new Set(clientPaths ?? [])).map((name) => ({
    name,
  }));
  return addStatsCompatibility({
    assets,
    chunks: [],
    modules: [],
    entrypoints: Object.fromEntries(
      entryNames.map((entryName) => [entryName, { assets, chunks: [] }]),
    ),
  });
}

function getUtoopackRootDir(
  cwd: string,
  utoopackConfig: Record<string, any> | undefined,
  findRootDir: (cwd: string) => string,
) {
  const normalizedCwd = normalizeUtoopackPath(cwd);

  if (typeof utoopackConfig?.root === 'string') {
    return normalizeUtoopackPath(
      path.resolve(normalizedCwd, utoopackConfig.root),
    );
  }

  return normalizeUtoopackPath(findRootDir(normalizedCwd));
}

export async function build(opts: IOpts) {
  const { cwd, onBuildComplete } = opts;
  const normalizedCwd = normalizeUtoopackPath(cwd);
  const buildStartTime = Date.now();
  const { build: utooPackBuild, findRootDir } = require('@utoo/pack');
  const rootDir = getUtoopackRootDir(
    normalizedCwd,
    opts.config.utoopack,
    findRootDir,
  );

  // 添加一个 checkConfig 对于 utoopack 不支持的配置警告一下
  const utooPackConfig = await getProdUtooPackConfig({
    ...opts,
    cwd: normalizedCwd,
    rootDir,
  });

  try {
    await utooPackBuild(utooPackConfig, normalizedCwd, rootDir);
  } catch (e: any) {
    console.error(e.message);
    const err = new Error('Build with utoopack failed.');
    // @ts-ignore
    err.stack = null;
    throw err;
  }

  const statsPath = path.join(
    utooPackConfig.config.output?.path || 'dist',
    'stats.json',
  );

  const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
  stats.hasErrors = () => false;
  stats.toJson = () => stats;
  stats.toString = () => {};
  stats.compilation = {
    ...stats,
    assets: stats.assets.reduce(
      (acc: Record<string, any>, cur: any) =>
        Object.assign(acc, { [cur.name]: cur }),
      {} as Record<string, any>,
    ),
  };

  const time = Date.now() - buildStartTime;
  await onBuildComplete?.({
    stats,
    time,
    isFirstCompile: true,
  });
  const absOutputPath = path.resolve(
    normalizedCwd,
    utooPackConfig.config.output?.path || 'dist',
  );
  console.log(
    getBuildBanner({
      packVersion: process.env.UTOOPACK_VERSION,
      duration: time,
      outputPath: path.relative(normalizedCwd, absOutputPath) || '.',
      assetCount: stats.assets?.length,
    }),
  );
  return stats;
}

export async function buildSSR(
  opts: IOpts & {
    serverBuildPath: string;
    useHash?: boolean;
    isDev?: boolean;
  },
) {
  const { cwd } = opts;
  const normalizedCwd = normalizeUtoopackPath(cwd);
  const buildStartTime = Date.now();
  const { build: utooPackBuild, findRootDir } = require('@utoo/pack');
  const rootDir = getUtoopackRootDir(
    normalizedCwd,
    opts.config.utoopack,
    findRootDir,
  );
  const utooPackConfig = await getSSRUtooPackConfig({
    ...opts,
    cwd: normalizedCwd,
    rootDir,
  });

  try {
    await utooPackBuild(utooPackConfig, normalizedCwd, rootDir);
  } catch (e: any) {
    console.error(e.message);
    const err = new Error('Build SSR with utoopack failed.');
    // @ts-ignore
    err.stack = null;
    throw err;
  }

  const statsPath = path.join(
    utooPackConfig.config.output?.path || 'server',
    'stats.json',
  );
  const stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
  stats.hasErrors = () => false;
  stats.toJson = () => stats;
  stats.toString = () => {};
  stats.compilation = {
    ...stats,
    assets: stats.assets.reduce(
      (acc: Record<string, any>, cur: any) =>
        Object.assign(acc, { [cur.name]: cur }),
      {} as Record<string, any>,
    ),
  };

  const time = Date.now() - buildStartTime;
  stats.time = time;

  return stats;
}

export async function dev(opts: IDevOpts) {
  const { cwd, onDevCompileDone } = opts;
  const normalizedCwd = normalizeUtoopackPath(cwd);

  if (!opts) {
    throw new Error('opts should be supplied');
  }

  const devStartTime = Date.now();
  const protocol = opts.config.https ? 'https:' : 'http:';

  const { findRootDir, serve: utooPackServe } = require('@utoo/pack');

  const rootDir = getUtoopackRootDir(
    normalizedCwd,
    opts.config.utoopack,
    findRootDir,
  );

  const utooPackConfig = await getDevUtooPackConfig({
    ...opts,
    cwd: normalizedCwd,
    rootDir,
  });

  const app = express();
  const cors = require('cors');
  const proxy = require('express-http-proxy');
  const port = opts.port || 8000;
  const utooServePort = port + 1;

  // CORS support
  app.use(
    cors({
      origin: true,
      methods: ['GET', 'HEAD', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  );

  app.use(require('compression')());

  if (opts.onBeforeMiddleware) {
    opts.onBeforeMiddleware(app);
  }

  // before middlewares
  (opts.beforeMiddlewares || []).forEach((m) => app.use(m));

  // proxy ws to utoopack server
  const wsProxy = createProxyMiddleware({
    target: `http://127.0.0.1:${utooServePort}`,
    ws: true,
    logLevel: 'silent',
  });
  app.use('/turbopack-hmr', wsProxy);

  if (opts.config.proxy) {
    createProxy(opts.config.proxy, app);
  }

  const publicPathPrefix = (() => {
    const p = opts.config.publicPath;
    if (!p || p === '/' || p === 'auto') return null;
    return p.startsWith('/') ? p : '/' + p;
  })();

  app.use(
    proxy(`http://127.0.0.1:${utooServePort}`, {
      proxyReqPathResolver: function (req: any) {
        if (publicPathPrefix && req.url.startsWith(publicPathPrefix)) {
          const stripped = req.url.slice(publicPathPrefix.length - 1);
          return stripped || '/';
        }
        return req.url;
      },
      proxyReqOptDecorator: function (proxyReqOpts: any) {
        // keep alive is on by default https://nodejs.org/docs/latest/api/http.html#httpglobalagent
        // 禁用 keep-alive
        proxyReqOpts.agent = false;
        return proxyReqOpts;
      },
      filter: function (req: any, _res: any) {
        return req.method == 'GET' || req.method == 'HEAD';
      },
      skipToNextHandlerFilter: function (proxyRes: any) {
        return proxyRes.statusCode !== 200 && proxyRes.statusCode !== 304;
      },
      proxyErrorHandler: function (err: any, res: any, next: any) {
        if (isUtoopackProxyStartupError(err, utooServePort)) {
          if (!res.headersSent) {
            res.writeHead(503, { 'Content-Type': 'text/plain' });
          }
          return res.end('Utoopack dev server is starting.');
        }

        if (err?.code === 'ECONNRESET') {
          res.setHeader(
            'X-Timeout-Reason',
            'express-http-proxy reset the request.',
          );
          res.writeHead(504, { 'Content-Type': 'text/plain' });
          return res.end();
        }

        return next(err);
      },
    }),
  );

  (opts.afterMiddlewares || []).forEach((m) => {
    if (m.toString().includes('{ compiler }')) {
      app.use(m({}));
    } else {
      app.use(m);
    }
  });
  // history fallback
  app.use(
    require('connect-history-api-fallback')({
      index: '/',
    }),
  );

  let server: http.Server | Awaited<ReturnType<typeof createHttpsServer>>;
  const httpsOpts = opts.config.https;
  if (httpsOpts) {
    httpsOpts.hosts ||= lodash.uniq(
      [
        ...(httpsOpts.hosts || []),
        // always add localhost, 127.0.0.1, ip and host
        '127.0.0.1',
        'localhost',
        opts.ip,
        opts.host !== '0.0.0.0' && opts.host,
      ].filter(Boolean),
    );
    server = await createHttpsServer(app, httpsOpts);
  } else {
    server = http.createServer(app);
  }

  const serverReady = new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, () => {
      server.off('error', reject);
      resolve();
    });
  });

  // prevent first websocket auto disconnected
  // ref https://github.com/chimurai/http-proxy-middleware#external-websocket-upgrade
  if (wsProxy.upgrade) {
    server.on('upgrade', wsProxy.upgrade);
  }

  const createStatsObject = () => {
    let stats: any;
    const statsPath = path.join(
      utooPackConfig.config.output?.path || 'dist',
      'stats.json',
    );
    try {
      stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
    } catch (e: any) {
      throw new Error(
        `File stats.json not found by utoopack dev at ${statsPath}: ${e.message}`,
      );
    }

    return addStatsCompatibility(stats);
  };

  let clientPaths: string[] = [];
  const shouldReadFullStats =
    Boolean(process.env.ANALYZE) || Boolean(utooPackConfig.config.stats);

  try {
    await Promise.all([
      serverReady,
      utooPackServe(utooPackConfig, normalizedCwd, rootDir, {
        port: utooServePort,
        hostname: '127.0.0.1',
        logServerInfo: false,
        onReady(context: DevServerReadyContext) {
          clientPaths = context.clientPaths ?? [];
        },
      }),
    ]);

    const time = Date.now() - devStartTime;
    const stats = shouldReadFullStats
      ? createStatsObject()
      : createDevStatsFromClientPaths(clientPaths, Object.keys(opts.entry));
    await onDevCompileDone?.({
      stats,
      time,
      isFirstCompile: true,
    });
    console.log(
      getDevBanner({
        protocol,
        host: opts.host,
        port,
        ip: opts.ip,
        packVersion: process.env.UTOOPACK_VERSION,
        duration: time,
      }),
    );

    return stats;
  } catch (e: any) {
    console.error(e.message);
  }
}
