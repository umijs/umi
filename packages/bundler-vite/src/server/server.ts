import {
  createHttpsServer,
  createProxy,
  resolveHttpsConfig,
} from '@umijs/bundler-utils';
import express from '@umijs/bundler-utils/compiled/express';
import { getDevBanner, logger } from '@umijs/utils';
import http from 'http';
import type {
  DepOptimizationMetadata,
  HmrContext,
  InlineConfig as ViteInlineConfig,
} from '../../compiled/vite';
import { createServer as createViteServer } from '../../compiled/vite';
import type { IConfig } from '../types';
import middlewaresPlugin from './plugins/middlewares';
import pluginOnHotUpdate from './plugins/onHotUpdate';

interface IOpts {
  cwd: string;
  port?: number;
  host?: string;
  viteConfig: ViteInlineConfig;
  userConfig: IConfig;
  beforeMiddlewares?: any[];
  afterMiddlewares?: any[];
  /**
   * onDevCompileDone hook
   * @param args  includes 2 fields:
   *              - isFirstCompile:
   *                  it would be true after the dev server is started
   *                  it should be false before each HMR is sent
   *              - stats:
   *                  it would be DepOptimizationMetadata after the dev server is started
   *                  it would be the modules of HMR Context before each HMR is sent
   */
  onDevCompileDone?: (args: {
    time: number;
    isFirstCompile: boolean;
    stats: HmrContext['modules'] | DepOptimizationMetadata | undefined;
  }) => Promise<void> | void;
  onBeforeMiddleware?: Function;
}

export async function createServer(opts: IOpts): Promise<any> {
  const startTms = +new Date();
  const { viteConfig, userConfig, onDevCompileDone } = opts;
  const app = express();

  const viteConfigServer = { ...viteConfig.server };

  // 如果启用https 先获取key 和 cert 给vite ws 服务使用
  if (userConfig.https) {
    const httpsConfig = await resolveHttpsConfig(userConfig.https);
    if (httpsConfig) {
      userConfig.https = viteConfigServer.https = {
        key: httpsConfig.key,
        cert: httpsConfig.cert,
      };
    }
  }

  const vite = await createViteServer({
    ...viteConfig,
    plugins: [
      ...(viteConfig.plugins || []),
      ...(opts.afterMiddlewares?.length
        ? [middlewaresPlugin(opts.afterMiddlewares)]
        : []),
      // use `handleHotUpdate` vite hook to workaround `onDevCompileDone` umi hook
      ...(typeof onDevCompileDone === 'function'
        ? [
            pluginOnHotUpdate(async (modules) => {
              await onDevCompileDone({
                time: 0,
                isFirstCompile: false,
                stats: modules,
              });
            }),
          ]
        : []),
    ],
    server: { ...viteConfigServer, middlewareMode: true },
  });

  // before middlewares
  opts.beforeMiddlewares?.forEach((m) => app.use(m));

  if (opts.onBeforeMiddleware) {
    opts.onBeforeMiddleware(app);
  }

  // proxy
  if (userConfig.proxy) {
    createProxy(userConfig.proxy, app);
  }

  // use vite via middleware way
  app.use(vite.middlewares);

  // writeToDisk(?)
  // mock
  // prerender
  // bundless

  const server = userConfig.https
    ? await createHttpsServer(app, userConfig.https)
    : http.createServer(app);

  if (!server) {
    return null;
  }

  const protocol = userConfig.https ? 'https:' : 'http:';
  const port = opts.port || 8000;

  server.listen(port, async () => {
    if (typeof onDevCompileDone === 'function') {
      await onDevCompileDone({
        time: +new Date() - startTms,
        isFirstCompile: true,
        stats: vite.environments.client.depsOptimizer?.metadata,
      });
    }

    const banner = getDevBanner(protocol, opts.host, port);

    console.log(banner.before);
    logger.ready(banner.main);
    console.log(banner.after);
  });

  return server;
}
