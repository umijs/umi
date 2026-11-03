import type { Compiler, RequestHandler, Stats } from '@umijs/bundler-webpack';
import { createRequestHandler } from '@umijs/server';
import { IApi } from '../../types';
import { getAssetsMap } from './getAssetsMap';
import { getMarkupArgs } from './getMarkupArgs';

function createRouteMiddleware(opts: { api: IApi }) {
  let utoopackStats: any;
  let resolveUtoopackStats: ((stats: any) => void) | undefined;
  const firstUtoopackStats = new Promise((resolve) => {
    resolveUtoopackStats = resolve;
  });

  // Register during plugin initialization so the first compilation is captured.
  opts.api.onDevCompileDone(({ stats }: { stats: Stats }) => {
    utoopackStats = stats;
    resolveUtoopackStats?.(stats);
  });

  return ({ compiler }: { compiler: Compiler }): RequestHandler => {
    let webpackStats: Stats | null = null;
    let onStats: Function | null = null;

    compiler?.hooks.done.tap('umiRouteMiddleware', (stats: any) => {
      webpackStats = stats;
      onStats?.(stats);
    });

    async function getStats(api: IApi) {
      if (!compiler && api.config.utoopack) {
        return utoopackStats || firstUtoopackStats;
      }
      if (!compiler && api.config.mako) {
        const assets = { 'umi.js': 'umi.js', 'umi.css': 'umi.css' };
        return {
          compilation: { assets },
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
      const stats: any = await getStats(opts.api);
      const markupArgs = (await getMarkupArgs(opts)) as any;
      const assetsMap = getAssetsMap({
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
