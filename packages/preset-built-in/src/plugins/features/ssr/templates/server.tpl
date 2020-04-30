// umi.server.js
import '{{{ RuntimePolyfill }}}';
import { renderServer } from '{{{ Renderer }}}';
import { matchRoutes } from 'react-router-config';
import { findRoute, serialize, mergeStream, ReadableString } from '{{{ Utils }}}';

import { ApplyPluginsType } from '@umijs/runtime';
import { plugin } from './plugin';
import { routes } from './routes';

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

const { getInitialData, modifyGetInitialPropsParams, modifyHTML } = plugin.applyPlugins({
  key: 'ssr',
  type: ApplyPluginsType.modify,
  initialValue: {},
});

/**
 * get current page component getPageInitialProps data
 * @param params
 */
const getInitial = async (params) => {
  const { path } = params;
  const matched = matchRoutes(routes, path).map(async ({ route, match }) => {
    // @ts-ignore
    const { component, ...restRouteParams } = route;
    if (component && component?.getInitialProps) {
      const defaultInitialProps = {
        isServer: true,
        match,
        ...restRouteParams,
      };
      // extend the `params` of getInitialProps(params) function
      const initialPropsParams = modifyGetInitialPropsParams ? await modifyGetInitialPropsParams(defaultInitialProps) : defaultInitialProps;
      return component.getInitialProps
        ? await component.getInitialProps(initialPropsParams)
        : null;
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
const handleHtml = ({ html, pageInitialProps, appInitialData, rootContainer, mountElementId = '{{{MountElementId}}}', mode = '{{{ Mode }}}' }) => {
  const htmlWithInitialData = html.replace(
    '</head>',
    `<script>
      window.g_useSSR = true;
      ${appInitialData && !{{{ ForceInitial }}} ? `window.g_initialData = ${serialize(appInitialData)};` : ''}
      ${pageInitialProps && !{{{ ForceInitial }}} ? `window.g_initialProps = ${serialize(pageInitialProps)};` : ''}
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
    initialData,
    htmlTemplate = '',
    mountElementId = '{{{MountElementId}}}',
    context = {},
    mode = '{{{ Mode }}}',
    staticMarkup = {{{StaticMarkup}}},
  } = params;

  let html = htmlTemplate || {{{ DEFAULT_HTML_PLACEHOLDER }}};
  let rootContainer = '';
  try {
    // getInitial
    const { pageInitialProps, appInitialData } = await getInitial({
      path,
    });
    const opts = {
      path,
      initialData,
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
      basename: '{{{ Basename }}}',
      plugin,
    });
    rootContainer = serverResult.html;
    if (html) {
      const processedHTML = handleHtml({ html, rootContainer, pageInitialProps, appInitialData, mountElementId, mode });
      html = modifyHTML
        ? modifyHTML(processedHTML, { context })
        : processedHTML;
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
