// umi.server.js
import '{{{ RuntimePolyfill }}}';
import { existsSync, readFileSync } from 'fs';
import { format } from 'url';
import renderServer from '{{{ Renderer }}}';
import { stripBasename, cheerio, handleHTML } from '{{{ Utils }}}';

import { ApplyPluginsType, createMemoryHistory } from '{{{ RuntimePath }}}';
import { plugin } from './plugin';
import { routes } from './routes';

// origin require module
// https://github.com/webpack/webpack/issues/4175#issuecomment-342931035
const requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;

export interface IParams {
  path: string;
  htmlTemplate?: string;
  mountElementId?: string;
  context?: object
}

export interface IRenderResult<T> {
  rootContainer: T;
  html?: T;
  error?: Error;
}

export interface IRender<T = string> {
  (params: IParams): Promise<IRenderResult<T>>;
}

const { modifyServerHTML } = plugin.applyPlugins({
  key: 'ssr',
  type: ApplyPluginsType.modify,
  initialValue: {},
});

/**
 * server render function
 * @param params
 */
const render: IRender = async (params) => {
  let error;
  const {
    path,
    htmlTemplate = '',
    mountElementId = '{{{ MountElementId }}}',
    context = {},
    mode = '{{{ Mode }}}',
    basename = '{{{ Basename }}}',
    staticMarkup = {{{ StaticMarkup }}},
    forceInitial = {{{ ForceInitial }}},
    manifestPath = '{{{ ManifestPath }}}',
    getInitialPropsCtx,
  } = params;
  const env = '{{{ Env }}}';

  let html = htmlTemplate || {{{ DEFAULT_HTML_PLACEHOLDER }}};
  let rootContainer = '';
  try {
    // handle basename
    const location = stripBasename(basename, path);
    const { pathname } = location;
    // server history
    const history = createMemoryHistory({
      initialEntries: [format(location)],
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
    }
    const dynamicImport =  {{{ DynamicImport }}};
    const publicPath = '{{{ PublicPath }}}';
    let manifest = {};
    if (env !== 'development' && dynamicImport && existsSync(manifestPath)) {
      manifest = requireFunc(manifestPath);
    }

    // renderServer get rootContainer
    const { pageHTML, pageInitialProps, routesMatched } = await renderServer(opts);
    rootContainer = pageHTML;
    if (html) {
      // plugin for modify html template
      html = typeof modifyServerHTML === 'function' ? await modifyServerHTML(html, { context, cheerio, routesMatched, dynamicImport, manifest, env, publicPath }) : html;
      html = await handleHTML({ html, rootContainer, pageInitialProps, mountElementId, mode, forceInitial, routesMatched, dynamicImport, manifest, env, publicPath });
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
