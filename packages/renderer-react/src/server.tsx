import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import { AppContext } from './appContext';
import { Routes } from './browser';
import { Html } from './html';
import { createClientRoutes } from './routes';
import { IRootComponentOptions } from './types';

// Get the root React component for ReactDOMServer.renderToString
export async function getClientRootComponent(opts: IRootComponentOptions) {
  const basename = opts.basename || '/';
  const components = { ...opts.routeComponents };
  // todo 参数对齐
  const clientRoutes = createClientRoutes({
    routesById: opts.routes,
    routeComponents: components,
    useStream: opts.useStream,
  });

  opts.pluginManager.applyPlugins({
    key: 'patchClientRoutes',
    type: 'event',
    args: {
      routes: clientRoutes,
    },
  });

  let rootContainer = (
    // 这里的 location 需要包含 basename, 否则会影响 StaticRouter 的匹配.
    // 由于 getClientRootComponent 方法会同时用于 ssr 和 ssg, 所以在调用该方法时需要注意传入的 location 是否包含 basename.
    // 1. 在用于 ssr 时传入的 location 来源于 request.url, 它是包含 basename 的, 所以没有问题.
    // 2. 但是在用于 ssg 时(static export), 需要注意传入的 locaiton 要拼接上 basename.
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
