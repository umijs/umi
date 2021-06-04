import { ApplyPluginsType, Plugin, Router } from '@umijs/runtime';
import React, { useEffect } from 'react';
import { hydrate, render } from 'react-dom';
import { matchRoutes, RouteConfig } from 'react-router-config';
import { IRoute } from '..';
import renderRoutes from '../renderRoutes/renderRoutes';

interface IRouterComponentProps {
  routes: IRoute[];
  plugin: Plugin;
  history: any;
  ssrProps?: object;
  defaultTitle?: string;
  dynamicImport?: boolean;
  isServer?: boolean;
}

interface IOpts extends IRouterComponentProps {
  rootElement?: string | HTMLElement;
  callback?: () => void;
}

function RouterComponent(props: IRouterComponentProps) {
  const { history, ...renderRoutesProps } = props;

  useEffect(() => {
    // first time using window.g_initialProps
    // switch route fetching data, if exact route reset window.getInitialProps
    if ((window as any).g_useSSR) {
      (window as any).g_initialProps = null;
    }
    function routeChangeHandler(location: any, action?: string) {
      const matchedRoutes = matchRoutes(
        props.routes as RouteConfig[],
        location.pathname,
      );

      // Set title
      if (
        typeof document !== 'undefined' &&
        renderRoutesProps.defaultTitle !== undefined
      ) {
        document.title =
          (matchedRoutes.length &&
            // @ts-ignore
            matchedRoutes[matchedRoutes.length - 1].route.title) ||
          renderRoutesProps.defaultTitle ||
          '';
      }
      props.plugin.applyPlugins({
        key: 'onRouteChange',
        type: ApplyPluginsType.event,
        args: {
          routes: props.routes,
          matchedRoutes,
          location,
          action,
        },
      });
    }
    routeChangeHandler(history.location, 'POP');
    return history.listen(routeChangeHandler);
  }, [history]);

  return <Router history={history}>{renderRoutes(renderRoutesProps)}</Router>;
}

/**
 * preload for SSR in dynamicImport
 * exec preload Promise function before ReactDOM.hydrate
 * @param Routes
 */
export async function preloadComponent(
  readyRoutes: IRoute[],
  pathname = window.location.pathname,
): Promise<IRoute[]> {
  // using matched routes not load all routes
  const matchedRoutes = matchRoutes(readyRoutes as RouteConfig[], pathname);
  for (const matchRoute of matchedRoutes) {
    const route = matchRoute.route as IRoute;
    // load all preload function, because of only a chance to load
    if (typeof route.component !== 'string' && route.component?.preload) {
      const preloadComponent = await route.component.preload();
      route.component = preloadComponent.default || preloadComponent;
    }
    if (route.routes) {
      route.routes = await preloadComponent(route.routes, pathname);
    }
  }
  return readyRoutes;
}

export default function renderClient(opts: IOpts) {
  const rootContainer = opts.plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: (
      <RouterComponent
        history={opts.history}
        routes={opts.routes}
        plugin={opts.plugin}
        ssrProps={opts.ssrProps}
        defaultTitle={opts.defaultTitle}
      />
    ),
    args: {
      history: opts.history,
      routes: opts.routes,
      plugin: opts.plugin,
    },
  });

  if (opts.rootElement) {
    const rootElement =
      typeof opts.rootElement === 'string'
        ? document.getElementById(opts.rootElement)
        : opts.rootElement;
    const callback = opts.callback || (() => {});

    // flag showing SSR successed
    if (window.g_useSSR) {
      if (opts.dynamicImport) {
        // dynamicImport should preload current route component
        // first loades);
        preloadComponent(opts.routes).then(function () {
          hydrate(rootContainer, rootElement, callback);
        });
      } else {
        hydrate(rootContainer, rootElement, callback);
      }
    } else {
      render(rootContainer, rootElement, callback);
    }
  } else {
    return rootContainer;
  }
}
