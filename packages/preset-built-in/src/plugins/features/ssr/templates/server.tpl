// umi.server.js
import '{{{ RuntimePolyfill }}}';
import { renderServer, matchRoutes } from '{{{ Renderer }}}';
import { stripBasename, serialize, mergeStream, ReadableString, getComponentDisplayName, cheerio } from '{{{ Utils }}}';

import { ApplyPluginsType, createMemoryHistory } from '{{{ RuntimePath }}}';
import { plugin } from './plugin';
import { routes } from './routes';

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

export interface IGetInitialProps {

}

export interface IGetInitialPropsServer extends IGetInitialProps {
  isServer: Boolean;
  match: object;
}

const { getInitialData, modifyGetInitialPropsCtx, modifyInitialProps, modifyServerHTML } = plugin.applyPlugins({
  key: 'ssr',
  type: ApplyPluginsType.modify,
  initialValue: {},
});

/**
 * get current page component getPageInitialProps data
 * @param params
 */
const getInitial = async (params) => {
  const { path, basename = '{{{ Basename }}}' } = params;
  // server history
  const history = createMemoryHistory({
    initialEntries: [path],
  });
  // handle basename
  const { pathname } = stripBasename(basename, path);
  const matched = matchRoutes(routes, pathname).map(async ({ route, match }) => {
    // @ts-ignore
    const { component, ...restRouteParams } = route;
    const componentName = getComponentDisplayName(component);

    if (component && component?.getInitialProps) {
      const defaultCtx = {
        isServer: true,
        match,
        // server only
        history,
        ...(params.getInitialPropsCtx || {}),
        ...restRouteParams,
      };
      // extend the `params` of getInitialProps(params) function
      const ctx = modifyGetInitialPropsCtx ? await modifyGetInitialPropsCtx(defaultCtx) : defaultCtx;
      const defaultInitialProps = component.getInitialProps
        ? await component.getInitialProps(ctx)
        : null;
      const initialProps = modifyInitialProps
        ? await modifyInitialProps(defaultInitialProps)
        : defaultInitialProps;
      return initialProps;
    }
  }).filter(Boolean);
  const pageInitialProps = (await Promise.all(matched)).reduce((acc, curr) => Object.assign({}, acc, curr), {});

  let appInitialData = {};
  if (typeof getInitialData === 'function') {
    const defaultInitialData = {
      isServer: true,
    };
    appInitialData = await getInitialData(defaultInitialData);
  }
  return {
    pageInitialProps,
    appInitialData,
  };
}

/**
 * handle html with rootContainer(rendered)
 * @param param0
 */
const handleHTML = async ({ html, pageInitialProps, appInitialData, rootContainer, mountElementId = '{{{MountElementId}}}', mode = '{{{ Mode }}}' }) => {
  const forceInitial = {{{ ForceInitial }}};
  const windowInitialVars = {
    ...(appInitialData && !forceInitial ? { 'window.g_initialData': serialize(appInitialData) } : {}),
    ...(pageInitialProps && !forceInitial ? { 'window.g_initialProps': serialize(pageInitialProps) } : {}),
  }
  const htmlWithInitialData = html.replace(
    '</head>',
    `<script>
      window.g_useSSR = true;
      ${Object.keys(windowInitialVars || {}).map(name => `${name} = ${windowInitialVars[name]}`).concat('').join(';\n')}
    </script>
    </head>`
  )

  if (mode === 'stream') {
    const containerString = `<div id="${mountElementId}">`;
    const [beforeRootContainer, afterRootContainer] = htmlWithInitialData.split(containerString);

    const beforeRootContainerStream = new ReadableString(beforeRootContainer);
    const containerStream = new ReadableString(containerString);
    const afterRootContainerStream = new ReadableString(afterRootContainer);
    const htmlStream = mergeStream(beforeRootContainerStream, containerStream, rootContainer, afterRootContainerStream);
    return htmlStream;
  }
  return htmlWithInitialData
    .replace(
      `<div id="${mountElementId}"></div>`,
      `<div id="${mountElementId}">${rootContainer}</div>`
    )
}

/**
 * server render function
 * @param params
 */
const render: IRender = async (params) => {
  let error;
  const {
    path,
    htmlTemplate = '',
    mountElementId = '{{{MountElementId}}}',
    context = {},
    mode = '{{{ Mode }}}',
    basename = '{{{ Basename }}}',
    staticMarkup = {{{StaticMarkup}}},
    getInitialPropsCtx,
  } = params;

  let html = htmlTemplate || {{{ DEFAULT_HTML_PLACEHOLDER }}};
  let rootContainer = '';
  try {
    // getInitial
    const { pageInitialProps, appInitialData } = await getInitial({
      path,
      basename,
      getInitialPropsCtx,
    });
    const opts = {
      path,
      getInitialPropsCtx,
      pageInitialProps,
      appInitialData,
      context,
      mode,
      staticMarkup,
      routes,
    }

    // renderServer get rootContainer
    const serverResult = await renderServer({
      ...opts,
      basename,
      plugin,
    });
    rootContainer = serverResult.html;
    if (html) {
      // plugin for modify html template
      html = typeof modifyServerHTML === 'function' ? await modifyServerHTML(html, { context, cheerio }) : html;
      html = await handleHTML({ html, rootContainer, pageInitialProps, appInitialData, mountElementId, mode });
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
