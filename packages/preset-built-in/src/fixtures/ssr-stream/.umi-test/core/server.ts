// @ts-nocheck
// umi.server.js
import '/Users/wangyiyi/work/project/umi/packages/preset-built-in/node_modules/regenerator-runtime/runtime.js';
import { format } from 'url';
import renderServer from '/Users/wangyiyi/work/project/umi/packages/preset-built-in/src/plugins/features/ssr/templates/renderServer/renderServer.tsx';
import { stripBasename, cheerio, handleHTML } from '/Users/wangyiyi/work/project/umi/packages/preset-built-in/src/plugins/features/ssr/templates/utils.ts';
import { IServerRender } from '@umijs/types';

import { ApplyPluginsType, createMemoryHistory } from '/Users/wangyiyi/work/project/umi/packages/runtime';
import { plugin } from './plugin';
import './pluginRegister';

// origin require module
// https://github.com/webpack/webpack/issues/4175#issuecomment-342931035
const requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;

/**
 * server render function
 * @param params
 */
const render: IServerRender = async (params) => {
  let error;
  const {
    origin = '',
    path,
    htmlTemplate = '',
    mountElementId = '',
    context = {},
    mode = 'string',
    basename = '/',
    staticMarkup = false,
    forceInitial = false,
    removeWindowInitialProps = false,
    getInitialPropsCtx,
  } = params;
  let manifest = params.manifest;
  const env = 'test';

  let html = htmlTemplate || "\u003C!DOCTYPE html\u003E\n\u003Chtml\u003E\n  \u003Chead\u003E\n    \u003Cmeta charset=\"utf-8\" \u002F\u003E\n    \u003Cmeta\n      name=\"viewport\"\n      content=\"width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no\"\n    \u002F\u003E\n    \u003Clink rel=\"stylesheet\" href=\"\u002Fumi.css\" \u002F\u003E\n    \u003Cscript\u003E\n      window.routerBase = \"\u002F\";\n    \u003C\u002Fscript\u003E\n    \u003Cscript\u003E\n      \u002F\u002F! umi version: undefined\n    \u003C\u002Fscript\u003E\n  \u003C\u002Fhead\u003E\n  \u003Cbody\u003E\n    \u003Cdiv id=\"root\"\u003E\u003C\u002Fdiv\u003E\n\n    \u003Cscript src=\"\u002Fumi.js\"\u003E\u003C\u002Fscript\u003E\n  \u003C\u002Fbody\u003E\n\u003C\u002Fhtml\u003E\n";
  let rootContainer = '';
  try {
    // handle basename
    const location = stripBasename(basename, `${origin}${path}`);
    const { pathname } = location;
    // server history
    const history = createMemoryHistory({
      initialEntries: [format(location)],
    });
    /**
     * beforeRenderServer hook, for polyfill global.*
     */
    await plugin.applyPlugins({
      key: 'ssr.beforeRenderServer',
      type: ApplyPluginsType.event,
      args: {
        env,
        path,
        context,
        history,
        mode,
        location,
      },
      async: true,
    });

    /**
     * routes init and patch only once
     * beforeRenderServer must before routes init avoding require error
     */
    // 主要为后面支持按需服务端渲染，单独用 routes 会全编译
    const routes = [
  {
    "path": "/",
    "component": require('/Users/wangyiyi/work/project/umi/packages/preset-built-in/src/fixtures/ssr-stream/pages/index').default,
    "exact": true
  }
];
    // allow user to extend routes
    plugin.applyPlugins({
      key: 'patchRoutes',
      type: ApplyPluginsType.event,
      args: { routes },
    });

    // for renderServer
    const opts = {
      path,
      history,
      pathname,
      getInitialPropsCtx,
      basename,
      context,
      mode,
      plugin,
      staticMarkup,
      routes,
      isServer: process.env.__IS_SERVER,
    }
    const dynamicImport =  false;
    if (dynamicImport && !manifest) {
      try {
        // prerender not work because the manifest generation behind of the prerender
        manifest = requireFunc(`./`);
      } catch (_) {}
    }
    // renderServer get rootContainer
    const { pageHTML, pageInitialProps, routesMatched } = await renderServer(opts);
    rootContainer = pageHTML;
    if (html) {
      // plugin for modify html template
      html = await plugin.applyPlugins({
        key: 'ssr.modifyServerHTML',
        type: ApplyPluginsType.modify,
        initialValue: html,
        args: {
          context,
          cheerio,
          routesMatched,
          dynamicImport,
          manifest
        },
        async: true,
      });
      html = await handleHTML({ html, rootContainer, pageInitialProps, mountElementId, mode, forceInitial, removeWindowInitialProps, routesMatched, dynamicImport, manifest });
    }
  } catch (e) {
    // downgrade into csr
    error = e;
  }
  return {
    rootContainer,
    error,
    html,
  }
}

export default render;
