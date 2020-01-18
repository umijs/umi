import * as ReactDOM from 'react-dom';
import React, { useEffect } from 'react';
import { ApplyPluginsType, Plugin, Router } from '@umijs/runtime';
import { IRoute } from '../types';
import renderRoutes from '../renderRoutes/renderRoutes';

interface IRouterComponentProps {
  routes: IRoute[];
  plugin: Plugin;
  history: any;
  ssrProps?: object;
}

interface IOpts extends IRouterComponentProps {
  rootElement?: string | HTMLElement;
}

function RouterComponent(props: IRouterComponentProps) {
  const { history, ...renderRoutesProps } = props;

  useEffect(() => {
    function routeChangeHandler(location: any, action?: string) {
      props.plugin.applyPlugins({
        key: 'onRouteChange',
        type: ApplyPluginsType.event,
        args: {
          routes: props.routes,
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
      />
    ),
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
