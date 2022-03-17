import express from '@umijs/bundler-utils/compiled/express';
import { logger } from '@umijs/utils';
import http from 'http';
import type {
  DepOptimizationMetadata,
  HmrContext,
  InlineConfig as ViteInlineConfig,
} from '../../compiled/vite';
import { createServer as createViteServer } from '../../compiled/vite';
import type { IConfig } from '../types';
import pluginOnHotUpdate from './plugins/onHotUpdate';

interface IOpts {
  cwd: string;
  port?: number;
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
    stats: HmrContext['modules'] | DepOptimizationMetadata;
  }) => Promise<void> | void;
}

export async function createServer(opts: IOpts) {
  const startTms = +new Date();
  const { viteConfig, onDevCompileDone } = opts;
  const app = express();
  const vite = await createViteServer({
    ...viteConfig,
    // use `handleHotUpdate` vite hook to workaround `onDevCompileDone` umi hook
    ...(typeof onDevCompileDone === 'function'
      ? {
          plugins: viteConfig.plugins!.concat([
            pluginOnHotUpdate(async (modules) => {
              await onDevCompileDone({
                time: 0,
                isFirstCompile: false,
                stats: modules,
              });
            }),
          ]),
        }
      : {}),
    server: { ...viteConfig.server, middlewareMode: 'html' },
  });

  // before middlewares
  opts.beforeMiddlewares?.forEach((m) => app.use(m));

  // after middlewares, insert before vite spaFallbackMiddleware
  // refer: https://github.com/vitejs/vite/blob/2c586165d7bc4b60f8bcf1f3b462b97a72cce58c/packages/vite/src/node/server/index.ts#L508
  if (opts.afterMiddlewares?.length) {
    vite.middlewares.stack.some((s, i) => {
      if ((s.handle as Function).name === 'viteSpaFallbackMiddleware') {
        const afterStacks: typeof vite.middlewares.stack =
          opts.afterMiddlewares!.map((m) => ({
            route: '',
            // TODO: FIXME
            // see: https://github.com/umijs/umi-next/commit/34d4e4e26a20ff5c7393eab5d3db363cca541379#diff-3a996a9e7a2f94fc8f23c6efed1447eed9567e36ed622bd8547a58e5415087f7R164
            handle: app.use(m.toString().includes(`{ compiler }`) ? m({}) : m),
          }));

        vite.middlewares.stack.splice(i, 0, ...afterStacks);

        return true;
      }

      return false;
    });
  }

  // use vite via middleware way
  app.use(vite.middlewares);

  // writeToDisk(?)
  // mock
  // prerender
  // bundless

  const server = http.createServer(app);
  const port = opts.port || 8000;

  server.listen(port, async () => {
    if (typeof onDevCompileDone === 'function') {
      await onDevCompileDone({
        time: +new Date() - startTms,
        isFirstCompile: true,
        // @ts-ignore
        stats: vite._optimizeDepsMetadata,
      });
    }

    logger.ready(
      `Example app listening at http://${
        process.env.HOST || '127.0.0.1'
      }:${port}`,
    );
  });

  return server;
}
