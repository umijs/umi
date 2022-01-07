import { RequestHandler } from '@umijs/bundler-webpack';
import { createRequestHandler, IOpts } from '@umijs/server';
import { IApi } from '../../types';
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

export function createRouteMiddleware(opts: { api: IApi }): RequestHandler {
  return async (req, res, next) => {
    const { vite } = opts.api.args;
    const viteScripts: IOpts['scripts'] = [
      // add noshim attr for skip importmap shim logic for this modules
      { content: viteRefreshScript, noshim: '' },
      { src: '/@vite/client', noshim: '' },
      opts.api.appData.hasSrcDir ? '/src/.umi/umi.ts' : '/.umi/umi.ts',
    ];
    const markupArgs = await getMarkupArgs(opts);
    // @ts-ignore
    const requestHandler = await createRequestHandler({
      ...markupArgs,
      scripts: (vite ? viteScripts : ['/umi.js']).concat(markupArgs.scripts!),
      esmScript: vite,
    });
    requestHandler(req, res, next);
  };
}
