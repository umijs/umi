import ReactDOMServer from 'react-dom/server';
import React from 'react';
import { Stream } from 'stream';
import { matchRoutes } from 'react-router-config';
import {
  Plugin,
  StaticRouter,
  ApplyPluginsType,
  MemoryHistory,
} from '@umijs/runtime';
import { IRoute } from '@umijs/types';
import { renderRoutes } from '@umijs/renderer-react';

export interface IOpts {
  path: string;
  history?: MemoryHistory;
  basename?: string;
  pathname?: string;
  plugin: Plugin;
  routes: IRoute[];
  getInitialPropsCtx?: object;
  initialData?: any;
  context?: object;
  mode?: 'stream' | 'string';
  staticMarkup?: boolean;
  /** unused */
  [key: string]: any;
}

export interface ILoadGetInitialPropsValue {
  pageInitialProps: any;
  routesMatched?: IRoute[];
}

interface ILoadGetInitialPropsOpts extends IOpts {
  App?: React.ReactElement;
}

interface IPatchRoute extends IRoute {
  component: any;
}

// getInitialProps(ctx)
interface IContext {
  isServer: boolean;
  history: MemoryHistory;
  match?: any;
  [key: string]: any;
}

/**
 * get current page component getPageInitialProps data
 * @param params
 */
export const loadPageGetInitialProps = async ({
  ctx,
  opts,
}: {
  ctx: IContext;
  opts: ILoadGetInitialPropsOpts;
}): Promise<ILoadGetInitialPropsValue> => {
  const { routes, pathname = opts.path } = opts;

  // via {routes} to find `getInitialProps`
  const routesMatched = matchRoutes(routes, pathname || '/');
  const promises = routesMatched
    .map(async ({ route, match }) => {
      const { component, ...restRouteParams } = route as IPatchRoute;
      let Component = component;
      // preload for dynamicImport
      if (Component?.preload) {
        const preloadComponent = await Component.preload();
        Component = preloadComponent?.default || preloadComponent;
      }

      if (Component && (Component as any)?.getInitialProps) {
        // handle ctx
        ctx = Object.assign(ctx, { match, route, ...restRouteParams });

        return Component.getInitialProps
          ? await Component.getInitialProps(ctx)
          : {};
      }
    })
    .filter(Boolean);
  const pageInitialProps = (await Promise.all(promises)).reduce(
    (acc, curr) => Object.assign({}, acc, curr),
    {},
  );

  return {
    pageInitialProps,
    routesMatched,
  };
};

/**
 * 处理 getInitialProps、路由 StaticRouter、数据预获取
 * @param opts
 */
function getRootContainer(
  opts: IOpts & ILoadGetInitialPropsValue,
): React.ReactElement {
  const { path, context, basename = '/', ...renderRoutesProps } = opts;
  return renderRoutesProps.plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: (
      <StaticRouter
        basename={basename === '/' ? '' : basename}
        location={path}
        context={context}
      >
        {renderRoutes(renderRoutesProps)}
      </StaticRouter>
    ),
    args: {
      type: 'ssr',
      history: opts.history,
      routes: opts.routes,
      plugin: opts.plugin,
      ctx: opts.ctx,
    },
  });
}

interface IRenderServer extends ILoadGetInitialPropsValue {
  pageHTML: string | Stream;
}

/**
 * 服务端渲染处理，通过 `routes` 来做 页面级 数据预获取
 *
 * @param opts
 */
export default async function renderServer(
  opts: IOpts,
): Promise<IRenderServer> {
  const defaultCtx = {
    isServer: true,
    // server only
    history: opts.history,
    ...(opts.getInitialPropsCtx || {}),
  };
  // modify ctx
  const ctx =
    (await opts.plugin.applyPlugins({
      key: 'ssr.modifyGetInitialPropsCtx',
      type: ApplyPluginsType.modify,
      initialValue: defaultCtx,
      async: true,
    })) || defaultCtx;
  // get pageInitialProps
  const { pageInitialProps, routesMatched } = await loadPageGetInitialProps({
    ctx,
    opts,
  });
  const rootContainer = getRootContainer({
    ...(opts as IOpts),
    pageInitialProps,
    ctx,
  });
  if (opts.mode === 'stream') {
    const pageHTML = ReactDOMServer[
      opts.staticMarkup ? 'renderToStaticNodeStream' : 'renderToNodeStream'
    ](rootContainer);
    return {
      pageHTML,
      pageInitialProps,
      routesMatched,
    };
  }
  const pageHTML = ReactDOMServer[
    opts.staticMarkup ? 'renderToStaticMarkup' : 'renderToString'
  ](rootContainer);
  // by default
  return {
    pageHTML,
    pageInitialProps,
    routesMatched,
  };
}
