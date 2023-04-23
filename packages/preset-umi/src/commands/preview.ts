import { createHttpsServer, createProxy } from '@umijs/bundler-utils';
import express from '@umijs/bundler-utils/compiled/express';
import { chalk, logger, portfinder } from '@umijs/utils';
import assert from 'assert';
import { existsSync } from 'fs';
import http from 'http';
import { resolve } from 'path';
// @ts-ignore
import sirv from '../../compiled/sirv';
import { createMockMiddleware } from '../features/mock/createMockMiddleware';
import { getMockData } from '../features/mock/getMockData';
import { IApi } from '../types';

export default (api: IApi) => {
  api.registerCommand({
    name: 'preview',
    description: 'locally preview production build',
    details: `
umi preview

# specify hostname
umi preview --host [host]

# specify port
umi preview --port [port]
`,
    fn: async function () {
      // 检查构建的静态资源是否存在
      const distDir = resolve(api.cwd, api.paths.absOutputPath);

      assert(
        existsSync(distDir),
        'build output dir not found, please run umi build',
      );

      const app = express();

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

      // proxy
      const { proxy } = api.userConfig;

      if (proxy) {
        createProxy(proxy, app);
      }

      // mock
      app.use(
        createMockMiddleware({
          context: {
            mockData: getMockData({
              cwd: api.cwd,
              mockConfig: api.config.mock || {},
            }),
          },
        }),
      );

      app.use(
        api.config.base,
        sirv(distDir, {
          etag: true,
          dev: true,
          single: true,
        }),
      );

      // history fallback
      app.use(
        require('@umijs/bundler-webpack/compiled/connect-history-api-fallback')(),
      );

      // 如果是 browser，并且配置了非 / base，访问 / 时 /index.html redirect 到 base 路径
      app.use((_req, res, next) => {
        const historyType = api.config.history?.type || 'browser';

        if (
          historyType === 'browser' &&
          api.config.base !== '/' &&
          (_req.path === '/' || _req.path === '/index.html')
        ) {
          return res.redirect(api.config.base);
        }

        next();
      });

      // https 复用用户配置
      const server = api.userConfig.https
        ? await createHttpsServer(app, api.userConfig.https)
        : http.createServer(app);

      if (!server) {
        return null;
      }

      const port = await portfinder.getPortPromise({
        port: parseInt(String(api.args.port || 4172), 10),
      });

      const protocol = api.userConfig.https ? 'https:' : 'http:';

      server.listen(port, () => {
        const host =
          api.args.host && api.args.host !== '0.0.0.0'
            ? api.args.host
            : 'localhost';

        logger.ready(
          `App listening at ${chalk.green(`${protocol}//${host}:${port}`)}`,
        );
      });
    },
  });
};
