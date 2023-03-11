import { createHttpsServer, createProxy } from '@umijs/bundler-utils';
import express from '@umijs/bundler-utils/compiled/express';
import type { Stats } from '@umijs/bundler-webpack/compiled/webpack';
import webpack, {
  Configuration,
} from '@umijs/bundler-webpack/compiled/webpack';
import { getDevBanner, lodash, logger } from '@umijs/utils';
import cors from 'cors';
import { createReadStream, existsSync } from 'fs';
import http from 'http';
import { extname, join } from 'path';
import { MESSAGE_TYPE } from '../constants';
import { IConfig } from '../types';
import { createWebSocketServer } from './ws';

interface IOpts {
  cwd: string;
  port?: number;
  host?: string;
  ip?: string;
  webpackConfig: Configuration;
  userConfig: IConfig;
  beforeMiddlewares?: any[];
  afterMiddlewares?: any[];
  onDevCompileDone?: Function;
  onProgress?: Function;
  onBeforeMiddleware?: Function;
}

export async function createServer(opts: IOpts): Promise<any> {
  const { webpackConfig, userConfig } = opts;
  const { proxy } = userConfig;
  const app = express();
  // ws 需要提前初始化
  // 避免在 https 模式下时「Cannot access 'ws' before initialization」的报错
  let ws: ReturnType<typeof createWebSocketServer>;

  // cros
  app.use(
    cors({
      origin: true,
      methods: ['GET', 'HEAD', 'PUT', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  );

  // compression
  app.use(require('@umijs/bundler-webpack/compiled/compression')());

  // debug all js file
  app.use((req, res, next) => {
    const file = req.path;
    const filePath = join(opts.cwd, file);
    const ext = extname(filePath);

    if (ext === '.js' && existsSync(filePath)) {
      logger.info(
        '[dev]',
        `${file} is responded with ${filePath}, remove it to use original file`,
      );
      res.sendFile(filePath);
    } else {
      next();
    }
  });

  // before middlewares
  (opts.beforeMiddlewares || []).forEach((m) => app.use(m));

  // Provides the ability to execute custom middleware prior to all other middleware internally within the server.
  if (opts.onBeforeMiddleware) {
    opts.onBeforeMiddleware(app);
  }

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
        details: [],
      };
      progresses.push(progress);
      config.plugins.push(
        new webpack.ProgressPlugin((percent, msg, ...details) => {
          progress.percent = percent;
          progress.status = msg;
          (progress.details as string[]) = details;
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
    compiler.hooks.done.tap('server', (_stats: Stats) => {
      stats = _stats;
      sendStats(getStats(stats));
      opts.onDevCompileDone?.({
        stats,
        isFirstCompile,
        ws,
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
    (sender || ws)?.send(JSON.stringify({ type, data }));
  }

  // proxy
  if (proxy) {
    createProxy(proxy, app);
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

  let server: http.Server | Awaited<ReturnType<typeof createHttpsServer>>;
  if (userConfig.https) {
    const httpsOpts = userConfig.https;
    if (!httpsOpts.hosts) {
      httpsOpts.hosts = lodash.uniq(
        [
          ...(httpsOpts.hosts || []),
          // always add localhost, 127.0.0.1, ip and host
          '127.0.0.1',
          'localhost',
          opts.ip,
          opts.host !== '0.0.0.0' && opts.host,
        ].filter(Boolean) as string[],
      );
    }
    server = await createHttpsServer(app, httpsOpts);
  } else {
    server = http.createServer(app);
  }
  if (!server) {
    return null;
  }

  ws = createWebSocketServer(server);

  ws.wss.on('connection', (socket) => {
    if (stats) {
      sendStats(getStats(stats), false, socket);
    }
  });

  const protocol = userConfig.https ? 'https:' : 'http:';
  const port = opts.port || 8000;

  server.listen(port, () => {
    const banner = getDevBanner(protocol, opts.host, port);

    console.log(banner.before);
    logger.ready(banner.main);
    console.log(banner.after);
  });

  return server;
}
