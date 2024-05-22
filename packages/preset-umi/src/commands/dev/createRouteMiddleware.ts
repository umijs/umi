import type { Compiler, RequestHandler, Stats } from '@umijs/bundler-webpack';
import { createRequestHandler } from '@umijs/server';
import { IApi } from '../../types';
import { getAssetsMap } from './getAssetsMap';
import { getMarkupArgs } from './getMarkupArgs';

function createRouteMiddleware(opts: { api: IApi }) {
  return ({ compiler }: { compiler: Compiler }): RequestHandler => {
    let webpackStats: Stats | null = null;
    let onStats: Function | null = null;

    compiler?.hooks.done.tap('umiRouteMiddleware', (stats: any) => {
      webpackStats = stats;
      onStats?.(stats);
    });

    async function getStats(api: IApi) {
      if (!compiler && api.config.mako) {
        return {
          compilation: { assets: { 'umi.js': 'umi.js', 'umi.css': 'umi.css' } },
          hasErrors: () => false,
        };
      }
      if (webpackStats) return Promise.resolve(webpackStats);
      return new Promise((resolve) => {
        onStats = (stats: any) => {
          resolve(stats);
        };
      });
    }

    return async (req, res, next) => {
      const markupArgs = (await getMarkupArgs(opts)) as any;
      let assetsMap: Record<string, string[]> = {};
      const stats: any = await getStats(opts.api);
      assetsMap = getAssetsMap({
        stats,
        publicPath: opts.api.config.publicPath!,
      });
      const requestHandler = await createRequestHandler({
        ...markupArgs,
        styles: markupArgs.styles.concat(
          (assetsMap['umi.css'] || []).map((src) => ({ src })),
        ),
        scripts: (assetsMap['umi.js'] || [])
          .map((src) => ({ src }))
          .concat(markupArgs.scripts!),
        esmScript: false,
        historyType: opts.api.config.history?.type || 'browser',
      });
      requestHandler(req, res, next);
    };
  };
}

export { createRouteMiddleware };
