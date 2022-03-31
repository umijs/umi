import type { Compiler, RequestHandler, Stats } from '@umijs/bundler-webpack';
import { createRequestHandler, IOpts } from '@umijs/server';
import { IApi } from '../../types';
import { getAssetsMap } from './getAssetsMap';
import { getMarkupArgs } from './getMarkupArgs';

// TODO: extract to bundler-vite
// refer: https://vitejs.dev/guide/backend-integration.html#backend-integration
const viteRefreshScript = `
import RefreshRuntime from '/@react-refresh'
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
`;

function createRouteMiddleware(opts: { api: IApi }) {
  return ({ compiler }: { compiler: Compiler }): RequestHandler => {
    const { vite } = opts.api.config;
    let webpackStats: Stats | null = null;
    let onStats: Function | null = null;

    if (!vite) {
      compiler.hooks.done.tap('umiRouteMiddleware', (stats: any) => {
        webpackStats = stats;
        onStats?.(stats);
      });
    }

    async function getStats() {
      if (webpackStats) return Promise.resolve(webpackStats);
      return new Promise((resolve) => {
        onStats = (stats: any) => {
          resolve(stats);
        };
      });
    }

    return async (req, res, next) => {
      const viteScripts: IOpts['scripts'] = [
        // add noshim attr for skip import-maps shim logic for this modules
        { content: viteRefreshScript, noshim: '' },
        { src: '/@vite/client', noshim: '' },
        opts.api.appData.hasSrcDir ? '/src/.umi/umi.ts' : '/.umi/umi.ts',
      ];
      const markupArgs = await getMarkupArgs(opts);
      let assetsMap: Record<string, string[]> = {};
      if (!vite) {
        const stats: any = await getStats();
        assetsMap = getAssetsMap({
          stats,
          publicPath: opts.api.config.publicPath,
        });
      }
      const requestHandler = await createRequestHandler({
        ...markupArgs,
        // css will be injected with style tag in vite mode
        styles: (vite ? [] : assetsMap['umi.css'] || []).concat(
          markupArgs.styles,
        ),
        scripts: (vite ? viteScripts : assetsMap['umi.js'] || []).concat(
          markupArgs.scripts!,
        ),
        esmScript: vite,
        historyType: opts.api.config.history?.type || 'browser',
      });
      requestHandler(req, res, next);
    };
  };
}

export { createRouteMiddleware };
