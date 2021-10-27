import { logger } from '@umijs/utils';
import http from 'http';
import type {
  DepOptimizationMetadata,
  HmrContext,
  InlineConfig as ViteInlineConfig,
} from 'vite';
import { createServer as createViteServer } from 'vite';
import express from '../../compiled/express';
import type { IConfig } from '../types';
import pluginOnHotUpdate from './plugins/onHotUpdate';

interface IOpts {
  cwd: string;
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
    isFirstCompile: boolean;
    stats: HmrContext['modules'] | DepOptimizationMetadata;
  }) => Promise<void> | void;
}

export async function createServer(opts: IOpts) {
  const { viteConfig, onDevCompileDone } = opts;
  const app = express();
  const vite = await createViteServer({
    ...viteConfig,
    // use `handleHotUpdate` vite hook to workaround `onDevCompileDone` umi hook
    ...(typeof onDevCompileDone === 'function'
      ? {
          plugins: viteConfig.plugins!.concat([
            pluginOnHotUpdate(async (modules) => {
              await onDevCompileDone({ isFirstCompile: false, stats: modules });
            }),
          ]),
        }
      : {}),
    server: { middlewareMode: 'html' },
  });

  // before middlewares
  opts.beforeMiddlewares?.forEach((m) => app.use(m));

  // after middlewares, insert before vite spaFallbackMiddleware
  // refer: https://github.com/vitejs/vite/blob/2c586165d7bc4b60f8bcf1f3b462b97a72cce58c/packages/vite/src/node/server/index.ts#L508
  if (opts.afterMiddlewares?.length) {
    vite.middlewares.stack.some((s, i) => {
      if ((s.handle as Function).name === 'viteSpaFallbackMiddleware') {
        const afterStacks: typeof vite.middlewares.stack =
          opts.afterMiddlewares!.map((handle) => ({
            route: '',
            handle,
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
  const port = process.env.PORT || 8000;

  server.listen(port, async () => {
    if (typeof onDevCompileDone === 'function') {
      await onDevCompileDone({
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
