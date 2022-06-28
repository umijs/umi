import { createHttpsServer } from '@umijs/bundler-utils';
import express from '@umijs/bundler-utils/compiled/express';
import { createProxyMiddleware } from '@umijs/bundler-webpack/compiled/http-proxy-middleware';
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
        Object.keys(proxy).forEach((key) => {
          const proxyConfig = proxy[key];
          const target = proxyConfig.target;
          if (target) {
            app.use(
              key,
              createProxyMiddleware(key, {
                ...proxy[key],
                // Add x-real-url in response header
                onProxyRes(proxyRes, req: any, res) {
                  proxyRes.headers['x-real-url'] =
                    new URL(req.url || '', target as string)?.href || '';
                  proxyConfig.onProxyRes?.(proxyRes, req, res);
                },
              }),
            );
          }
        });
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
            : '127.0.0.1';

        logger.ready(
          `App listening at ${chalk.green(`${protocol}//${host}:${port}`)}`,
        );
      });
    },
  });
};
