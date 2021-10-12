import express from '@umijs/bundler-webpack/compiled/express';
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
}

export async function createServer(opts: IOpts) {
  const { webpackConfig, userConfig } = opts;
  const app = express();

  // compression
  app.use(require('@umijs/bundler-webpack/compiled/compression')());

  // TODO: headers

  // before middlewares
  (opts.beforeMiddlewares || []).forEach((m) => app.use(m));

  // webpack dev middleware
  const compiler = webpack(
    Array.isArray(webpackConfig) ? webpackConfig : [webpackConfig],
  );
  const webpackDevMiddleware = require('@umijs/bundler-webpack/compiled/webpack-dev-middleware');
  const compilerMiddleware = webpackDevMiddleware(compiler, {
    publicPath: '/',
    writeToDisk: userConfig.writeToDisk,
    // watchOptions: { ignored }
  });
  app.use(compilerMiddleware);

  // hmr hooks
  compiler.compilers.forEach(addHooks);
  function addHooks(compiler: webpack.Compiler) {
    compiler.hooks.invalid.tap('server', () => {
      sendMessage(MESSAGE_TYPE.invalid);
    });
    compiler.hooks.done.tap('server', (stats) => {
      sendStats(getStats(stats));
      // this.stats = stats;
    });
  }
  function sendStats(stats: webpack.StatsCompilation, force?: boolean) {
    const shouldEmit =
      !force &&
      stats &&
      (!stats.errors || stats.errors.length === 0) &&
      (!stats.warnings || stats.warnings.length === 0) &&
      stats.assets &&
      stats.assets.every((asset) => !asset.emitted);
    if (shouldEmit) {
      sendMessage(MESSAGE_TYPE.stillOk);
      return;
    }
    sendMessage(MESSAGE_TYPE.hash, stats.hash);
    if (
      (stats.errors && stats.errors.length > 0) ||
      (stats.warnings && stats.warnings.length > 0)
    ) {
      if (stats.warnings && stats.warnings.length > 0) {
        sendMessage(MESSAGE_TYPE.warnings, stats.warnings);
      }
      if (stats.errors && stats.errors.length > 0) {
        sendMessage(MESSAGE_TYPE.errors, stats.errors);
      }
    } else {
      sendMessage(MESSAGE_TYPE.ok);
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
  function sendMessage(type: string, data?: any) {
    ws.send({ type, data });
  }

  // mock
  // proxy

  // after middlewares
  (opts.afterMiddlewares || []).forEach((m) => app.use(m));

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

  const port = opts.port || 8000;
  server.listen(port, () => {
    const host = opts.host && opts.host !== '0.0.0.0' ? opts.host : '127.0.0.1';
    logger.ready(`Example app listening at http://${host}:${port}`);
  });

  return server;
}
