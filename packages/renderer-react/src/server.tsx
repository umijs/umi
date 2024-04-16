import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import { AppContext } from './appContext';
import { Routes } from './browser';
import { Html } from './html';
import { createClientRoutes } from './routes';
import { IRootComponentOptions } from './types';

// Get the root React component for ReactDOMServer.renderToString
export async function getClientRootComponent(opts: IRootComponentOptions) {
  const basename = '/';
  const components = { ...opts.routeComponents };
  // todo 参数对齐
  const clientRoutes = createClientRoutes({
    routesById: opts.routes,
    routeComponents: components,
  });

  await opts.pluginManager.applyPlugins({
    key: 'patchClientRoutes',
    type: 'event',
    args: {
      routes: clientRoutes,
    },
  });
  let rootContainer = (
    <StaticRouter basename={basename} location={opts.location}>
      <Routes />
    </StaticRouter>
  );
  for (const key of [
    // Lowest to the highest priority
    'innerProvider',
    'i18nProvider',
    'accessProvider',
    'dataflowProvider',
    'outerProvider',
    'rootContainer',
  ]) {
    rootContainer = opts.pluginManager.applyPlugins({
      type: 'modify',
      key: key,
      initialValue: rootContainer,
      args: {},
    });
  }
  const app = (
    <AppContext.Provider
      value={{
        routes: opts.routes,
        routeComponents: opts.routeComponents,
        clientRoutes,
        pluginManager: opts.pluginManager,
        basename,
        clientLoaderData: {},
        serverLoaderData: opts.loaderData,
      }}
    >
      {rootContainer}
    </AppContext.Provider>
  );
  return <Html {...opts}>{app}</Html>;
}
