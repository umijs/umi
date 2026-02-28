import { createHttpsServer, createProxy } from '@umijs/bundler-utils';
import express from '@umijs/bundler-utils/compiled/express';
import { createProxyMiddleware } from '@umijs/bundler-utils/compiled/http-proxy-middleware';
import { chalk, lodash } from '@umijs/utils';
import fs from 'fs';
import http from 'http';
import path from 'path';
import {
  getDevUtooPackConfig,
  getProdUtooPackConfig,
  IDevOpts,
} from './config';
import type { IOpts } from './types';

export async function build(opts: IOpts) {
  const { cwd, onBuildComplete } = opts;
  const { build: utooPackBuild, findRootDir } = require('@utoo/pack');
  const rootDir = findRootDir(cwd);

  // 添加一个 checkConfig 对于 utoopack 不支持的配置警告一下
  const utooPackConfig = await getProdUtooPackConfig({
    ...opts,
    rootDir,
  });

  // console.log('utooPackConfig: ', JSON.stringify(utooPackConfig, null, 2));

  try {
    await utooPackBuild(utooPackConfig, cwd, rootDir);
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

  await onBuildComplete?.({
    stats,
  });
  return stats;
}

export async function dev(opts: IDevOpts) {
  const { cwd, onDevCompileDone } = opts;

  if (!opts) {
    throw new Error('opts should be supplied');
  }

  const { findRootDir, serve: utooPackServe } = require('@utoo/pack');

  const rootDir = findRootDir(cwd);

  const utooPackConfig = await getDevUtooPackConfig({
    ...opts,
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

  let server;
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

  server.listen(port, () => {
    const protocol = opts.config.https ? 'https:' : 'http:';
    const banner = getDevBanner(
      protocol,
      opts.host,
      port,
      opts.ip ?? '0.0.0.0',
    );
    console.log(banner);
  });
  // prevent first websocket auto disconnected
  // ref https://github.com/chimurai/http-proxy-middleware#external-websocket-upgrade
  if (wsProxy.upgrade) {
    server.on('upgrade', wsProxy.upgrade);
  }

  const createStatsObject = () => {
    let stats: any;
    try {
      const statsPath = path.join(
        utooPackConfig.config.output?.path || 'dist',
        'stats.json',
      );
      stats = JSON.parse(fs.readFileSync(statsPath, 'utf-8'));
    } catch (e) {
      throw new Error('File stats.json not found by utoopack dev');
    }

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
    return stats;
  };

  try {
    await utooPackServe(utooPackConfig, cwd, rootDir, {
      port: utooServePort,
      hostname: '127.0.0.1',
      logServerInfo: false,
    });

    const stats = createStatsObject();
    await onDevCompileDone?.({
      stats,
    });

    return stats;
  } catch (e: any) {
    console.error(e.message);
  }
}

function getDevBanner(
  protocol: string,
  host?: string,
  port?: number,
  ip?: string,
) {
  const hostStr = host === '0.0.0.0' ? 'localhost' : host;
  const messages = [];
  messages.push('  App listening at:');
  messages.push(
    `  - Local:   ${chalk.cyan(`${protocol}//${hostStr}:${port}`)}`,
  );
  messages.push(`  - Network: ${chalk.cyan(`${protocol}//${ip}:${port}`)}`);
  return messages.join('\n');
}

export { findRootDir } from '@utoo/pack';
export * from './config';
