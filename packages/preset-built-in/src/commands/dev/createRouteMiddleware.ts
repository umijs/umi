import { RequestHandler } from '@umijs/bundler-webpack';
import { createRequestHandler } from '@umijs/server';
import { IApi } from '../../types';

// TODO: extract to bundler-vite
// refer: https://vitejs.dev/guide/backend-integration.html#backend-integration
const viteRefreshScript = `
import RefreshRuntime from '/@react-refresh'
RefreshRuntime.injectIntoGlobalHook(window)
window.$RefreshReg$ = () => {}
window.$RefreshSig$ = () => (type) => type
window.__vite_plugin_react_preamble_installed__ = true
`;

export function createRouteMiddleware(opts: { api: IApi }): RequestHandler {
  return async (req, res, next) => {
    const { vite } = opts.api.args;
    const requestHandler = await createRequestHandler({
      routes: opts.api.appData.routes,
      scripts: vite
        ? [viteRefreshScript, '/@vite/client', '/.umi/umi.ts']
        : ['/umi.js'],
      esmScript: vite,
      config: opts.api.config,
    });
    requestHandler(req, res, next);
  };
}
