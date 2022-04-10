import express from '@umijs/bundler-utils/compiled/express';
import { createProxyMiddleware } from '@umijs/bundler-webpack/compiled/http-proxy-middleware';
import webpack, {
  Configuration,
} from '@umijs/bundler-webpack/compiled/webpack';
import { chalk, logger } from '@umijs/utils';
import { createReadStream, existsSync } from 'fs';
import http from 'http';
import { join } from 'path';
import { MESSAGE_TYPE } from '../constants';
import { IConfig } from '../types';
import { createHttpsServer } from './https';
import { createWebSocketServer } from './ws';

interface IOpts {
  cwd: string;
  port?: number;
  host?: string;
  webpackConfig: Configuration;
  userConfig: IConfig;
  beforeMiddlewares?: any[];
  afterMiddlewares?: any[];
  onDevCompileDone?: Function;
  onProgress?: Function;
}

export async function createServer(opts: IOpts) {
  const { webpackConfig, userConfig } = opts;
  const { proxy } = userConfig;
  const app = express();

  // basename middleware
  app.use((req, _res, next) => {
    const { url, path } = req;
    const { basename, history } = userConfig;
    if (
      history?.type === 'browser' &&
      basename !== '/' &&
      url.startsWith(basename)
    ) {
      req.url = url.slice(basename.length);
      req.path = path.slice(basename.length);
    }
    next();
  });

  // cros
  app.use((_req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Content-Length, Authorization, Accept, X-Requested-With',
    );
    res.header(
      'Access-Control-Allow-Methods',
      'GET, HEAD, PUT, POST, PATCH, DELETE, OPTIONS',
    );
    next();
  });

  // compression
  app.use(require('@umijs/bundler-webpack/compiled/compression')());

  // TODO: headers

  // before middlewares
  (opts.beforeMiddlewares || []).forEach((m) => app.use(m));

  // TODO: add to before middleware
  app.use((req, res, next) => {
    if (req.path === '/umi.js' && existsSync(join(opts.cwd, 'umi.js'))) {
      res.setHeader('Content-Type', 'application/javascript');
      createReadStream(join(opts.cwd, 'umi.js')).on('error', next).pipe(res);
    } else {
      next();
    }
  });

  // webpack dev middleware
  const configs = Array.isArray(webpackConfig)
    ? webpackConfig
    : [webpackConfig];
  const progresses: any[] = [];
  if (opts.onProgress) {
    configs.forEach((config) => {
      const progress = {
        percent: 0,
        status: 'waiting',
      };
      progresses.push(progress);
      config.plugins.push(
        new webpack.ProgressPlugin((percent, msg) => {
          progress.percent = percent;
          progress.status = msg;
          opts.onProgress!({ progresses });
        }),
      );
    });
  }
  const compiler = webpack(configs);

  const webpackDevMiddleware = require('@umijs/bundler-webpack/compiled/webpack-dev-middleware');
  const compilerMiddleware = webpackDevMiddleware(compiler, {
    publicPath: userConfig.publicPath || '/',
    writeToDisk: userConfig.writeToDisk,
    stats: 'none',
    // watchOptions: { ignored }
  });
  app.use(compilerMiddleware);

  // hmr hooks
  let stats: any;
  let isFirstCompile = true;
  compiler.compilers.forEach(addHooks);

  function addHooks(compiler: webpack.Compiler) {
    compiler.hooks.invalid.tap('server', () => {
      sendMessage(MESSAGE_TYPE.invalid);
    });
    compiler.hooks.done.tap('server', (_stats) => {
      stats = _stats;
      sendStats(getStats(stats));
      opts.onDevCompileDone?.({
        stats,
        isFirstCompile,
        time: stats.endTime - stats.startTime,
      });
      isFirstCompile = false;
    });
  }

  function sendStats(
    stats: webpack.StatsCompilation,
    force?: boolean,
    sender?: any,
  ) {
    const shouldEmit =
      !force &&
      stats &&
      (!stats.errors || stats.errors.length === 0) &&
      (!stats.warnings || stats.warnings.length === 0) &&
      stats.assets &&
      stats.assets.every((asset) => !asset.emitted);
    if (shouldEmit) {
      sendMessage(MESSAGE_TYPE.stillOk, null, sender);
      return;
    }
    sendMessage(MESSAGE_TYPE.hash, stats.hash, sender);
    if (
      (stats.errors && stats.errors.length > 0) ||
      (stats.warnings && stats.warnings.length > 0)
    ) {
      if (stats.warnings && stats.warnings.length > 0) {
        sendMessage(MESSAGE_TYPE.warnings, stats.warnings, sender);
      }
      if (stats.errors && stats.errors.length > 0) {
        sendMessage(MESSAGE_TYPE.errors, stats.errors, sender);
      }
    } else {
      sendMessage(MESSAGE_TYPE.ok, null, sender);
    }
  }

  function getStats(stats: webpack.Stats) {
    return stats.toJson({
      all: false,
      hash: true,
      assets: true,
      warnings: true,
      errors: true,
      errorDetails: false,
    });
  }

  function sendMessage(type: string, data?: any, sender?: any) {
    (sender || ws).send(JSON.stringify({ type, data }));
  }

  // mock
  // proxy
  if (proxy) {
    Object.keys(proxy).forEach((key) => {
      const proxyConfig = proxy[key];
      const target = proxyConfig.target;
      if (target) {
        app.use(
          key,
          createProxyMiddleware(key, {
            ...proxy[key],
            // Add x-real-url in response header
            onProxyRes(proxyRes, req: any) {
              proxyRes.headers['x-real-url'] =
                new URL(req.url || '', target as string)?.href || '';
            },
          }),
        );
      }
    });
  }
  // after middlewares
  (opts.afterMiddlewares || []).forEach((m) => {
    // TODO: FIXME
    app.use(m.toString().includes(`{ compiler }`) ? m({ compiler }) : m);
  });
  // history fallback
  app.use(
    require('@umijs/bundler-webpack/compiled/connect-history-api-fallback')({
      index: '/',
    }),
  );

  // hmr reconnect ping
  app.use('/__umi_ping', (_, res) => {
    res.end('pong');
  });

  // index.html
  // TODO: remove me
  app.get('/', (_req, res, next) => {
    res.set('Content-Type', 'text/html');
    const htmlPath = join(opts.cwd, 'index.html');
    if (existsSync(htmlPath)) {
      createReadStream(htmlPath).on('error', next).pipe(res);
    } else {
      next();
    }
  });

  const server = userConfig.https
    ? await createHttpsServer(app, userConfig.https)
    : http.createServer(app);
  if (!server) {
    return null;
  }

  const ws = createWebSocketServer(server);

  ws.wss.on('connection', (socket) => {
    if (stats) {
      sendStats(getStats(stats), false, socket);
    }
  });

  const protocol = userConfig.https ? 'https:' : 'http:';
  const port = opts.port || 8000;

  server.listen(port, () => {
    const host = opts.host && opts.host !== '0.0.0.0' ? opts.host : '127.0.0.1';
    logger.ready(
      `App listening at ${chalk.green(`${protocol}//${host}:${port}`)}`,
    );
  });

  return server;
}
