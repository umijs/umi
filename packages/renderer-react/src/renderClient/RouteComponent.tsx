import { ApplyPluginsType, Router } from '@umijs/runtime';
import React, { useEffect } from 'react';
import { matchRoutes, RouteConfig } from 'react-router-config';
import renderRoutes from '../renderRoutes/renderRoutes';
import type { IRouterComponentProps } from './types';

export default function RouterComponent(props: IRouterComponentProps) {
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

  // @ts-ignore because type check will fail due to React 18 types
  return <Router history={history}>{renderRoutes(renderRoutesProps)}</Router>;
}
