import express from '@umijs/bundler-webpack/compiled/express';
import { createProxyMiddleware } from '@umijs/bundler-webpack/compiled/http-proxy-middleware';
import webpack, {
  Configuration,
} from '@umijs/bundler-webpack/compiled/webpack';
import { logger } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
import http from 'http';
import { join } from 'path';
import { MESSAGE_TYPE } from '../constants';
import { IConfig } from '../types';
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
}

export async function createServer(opts: IOpts) {
  const { webpackConfig, userConfig } = opts;
  const { proxy } = userConfig;
  const app = express();

  // compression
  app.use(require('@umijs/bundler-webpack/compiled/compression')());

  // TODO: headers

  // before middlewares
  (opts.beforeMiddlewares || []).forEach((m) => app.use(m));

  // TODO: add to before middleware
  app.use((req, res, next) => {
    if (req.path === '/umi.js' && existsSync(join(opts.cwd, 'umi.js'))) {
      res.setHeader('Content-Type', 'application/javascript');
      res.send(readFileSync(join(opts.cwd, 'umi.js'), 'utf-8'));
    } else {
      next();
    }
  });

  // webpack dev middleware
  const compiler = webpack(
    Array.isArray(webpackConfig) ? webpackConfig : [webpackConfig],
  );
  const webpackDevMiddleware = require('@umijs/bundler-webpack/compiled/webpack-dev-middleware');
  const compilerMiddleware = webpackDevMiddleware(compiler, {
    publicPath: '/',
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
      app.use(key, createProxyMiddleware(proxy[key]));
    });
  }
  // after middlewares
  (opts.afterMiddlewares || []).forEach((m) => app.use(m));
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
      const html = readFileSync(htmlPath, 'utf-8');
      res.send(html);
    } else {
      next();
    }
  });

  const server = http.createServer(app);
  const ws = createWebSocketServer(server);

  ws.wss.on('connection', (socket) => {
    if (stats) {
      sendStats(getStats(stats), false, socket);
    }
  });

  const port = opts.port || 8000;
  server.listen(port, () => {
    const host = opts.host && opts.host !== '0.0.0.0' ? opts.host : '127.0.0.1';
    logger.ready(`App listening at http://${host}:${port}`);
  });

  return server;
}
