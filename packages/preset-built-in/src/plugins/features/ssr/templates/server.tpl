// umi.server.js
import { renderServer } from '{{{ Renderer }}}';
import { findRoute, serialize } from '{{{ Utils }}}';
import { ApplyPluginsType } from '@umijs/runtime';
import { plugin } from '@@/core/plugin';
import { routes } from '@@/core/routes';

export interface IParams {
  path: string;
  initialData?: object;
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

/**
 * get current page component getPageInitialProps data
 * @param params
 */
export const getInitial = async (params) => {
  const { path } = params;
  // pages getInitialProps
  let { component, ...restRouteParams } = findRoute(routes, path) || {};
  let pageInitialProps = {};
  // handle preload dynamic import
  if (component?.preload) {
    component = await component.preload();
  }
  pageInitialProps = component?.getInitialProps
    ? await component.getInitialProps({
        isServer: true,
        ...restRouteParams,
      })
    : null;
  const runtimeConfig = plugin.applyPlugins({
    key: 'ssr',
    type: ApplyPluginsType.modify,
    initialValue: {},
  });
  let appInitialData = {};
  if (typeof runtimeConfig?.getInitialData === 'function') {
    appInitialData = await runtimeConfig.getInitialData({
      isServer: true,
      ...restRouteParams,
    });
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
export const handleHtml = ({ html, pageInitialProps, appInitialData, rootContainer, mountElementId = 'root' }) => {
  return html
    .replace(
      '</head>',
      `<script>
        window.g_useSSR = true;
        ${appInitialData && !{{{ ForceInitial }}} ? `window.g_initialData = ${serialize(appInitialData)};` : ''}
        ${pageInitialProps && !{{{ ForceInitial }}} ? `window.g_initialProps = ${serialize(pageInitialProps)};` : ''}
      </script>
      </head>`
    )
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
  const { path, initialData, htmlTemplate = '', mountElementId = 'root', context = {} } = params;

  // getInitial
  const { pageInitialProps, appInitialData } = await getInitial({
    path,
  });

  let html = htmlTemplate || `{{ DEFAULT_HTML_PLACEHOLDER }}`;
  let rootContainer = '';
  try {
    const opts = {
      path,
      initialData,
      pageInitialProps,
      appInitialData,
      context,
      routes,
    }
    // renderServer get rootContainer
    rootContainer = await renderServer({
      ...opts,
      plugin,
    });
    if (html) {
      html = handleHtml({ html, rootContainer, pageInitialProps, appInitialData, mountElementId });
    }
  } catch (e) {
    // downgrade into csr
    error = e;
    console.error('[SSR ERROR]', e);
  }

  return {
    rootContainer,
    error,
    html,
  }
}

export default render;
