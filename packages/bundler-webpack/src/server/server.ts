import express from '@umijs/bundler-webpack/compiled/express';
import webpack, {
  Configuration,
} from '@umijs/bundler-webpack/compiled/webpack';
// @ts-ignore
import webpackDevMiddleware from '@umijs/bundler-webpack/compiled/webpack-dev-middleware';
import { logger } from '@umijs/utils';
import http from 'http';
import { IConfig } from '../types';
import { createWebSocketServer } from './ws';

interface IOpts {
  webpackConfig: Configuration;
  userConfig: IConfig;
}

export async function createServer(opts: IOpts) {
  const { webpackConfig, userConfig } = opts;
  const app = express();

  // compression
  app.use(require('@umijs/bundler-webpack/compiled/compression')());

  const compiler = webpack(webpackConfig);
  const compilerMiddleware = webpackDevMiddleware(compiler, {
    publicPath: '/',
    writeToDisk: userConfig.writeToDisk,
    // watchOptions: { ignored }
  });
  app.use(compilerMiddleware);

  // mock
  // proxy

  const server = http.createServer(app);
  const ws = createWebSocketServer(server);
  ws;

  const port = process.env.PORT || 8000;
  server.listen(port, () => {
    logger.ready(
      `Example app listening at http://${
        process.env.HOST || '127.0.0.1'
      }:${port}`,
    );
  });

  return server;
}
