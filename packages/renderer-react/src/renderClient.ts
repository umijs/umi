import * as ReactDOM from 'react-dom';
import React, { ComponentClass, FunctionComponent } from 'react';
import { Plugin, ApplyPluginsType } from '@umijs/runtime';
import findActiveRoute from './findActiveRoute';
import { IRoute } from './types';

interface IOpts {
  routes: IRoute[];
  rootElement: string | HTMLElement;
  initialProps?: object;
  ChildComponent: FunctionComponent | ComponentClass;
  plugin: Plugin;
  location: {
    pathname: string;
  };
}

export default async function(opts: IOpts) {
  const rootElement =
    typeof opts.rootElement === 'string'
      ? document.getElementById(opts.rootElement)
      : opts.rootElement;
  const useSSR = !!opts.initialProps;

  let props = opts.initialProps;
  if (!props) {
    const activeRoute = findActiveRoute({
      routes: opts.routes,
      pathname: opts.location.pathname,
    });
    if (activeRoute?.component?.getInitialProps) {
      props = await activeRoute.component.getInitialProps({
        route: activeRoute,
        server: false,
        location: opts.location,
      });
    }
  }

  const rootContainer = opts.plugin.applyPlugins({
    type: ApplyPluginsType.modify,
    key: 'rootContainer',
    initialValue: React.createElement(opts.ChildComponent, props),
  });

  ReactDOM[useSSR ? 'hydrate' : 'render'](rootContainer, rootElement);
}
