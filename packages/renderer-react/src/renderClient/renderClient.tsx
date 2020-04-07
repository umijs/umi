import * as ReactDOM from 'react-dom';
import React, { useEffect } from 'react';
import { ApplyPluginsType, Plugin, Router } from '@umijs/runtime';
import { matchRoutes } from 'react-router-config';
import { IRoute } from '..';
import renderRoutes from '../renderRoutes/renderRoutes';

interface IRouterComponentProps {
  routes: IRoute[];
  plugin: Plugin;
  history: any;
  ssrProps?: object;
  defaultTitle?: string;
}

interface IOpts extends IRouterComponentProps {
  rootElement?: string | HTMLElement;
}

function RouterComponent(props: IRouterComponentProps) {
  const { history, ...renderRoutesProps } = props;

  useEffect(() => {
    function routeChangeHandler(location: any, action?: string) {
      const matchedRoutes = matchRoutes(props.routes, location.pathname);

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
    ReactDOM[!!opts.ssrProps ? 'hydrate' : 'render'](
      rootContainer,
      rootElement,
    );
  } else {
    return rootContainer;
  }
}
