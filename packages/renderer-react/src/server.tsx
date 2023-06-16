import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import { AppContext } from './appContext';
import { Routes } from './browser';
import { createClientRoutes } from './routes';
import { IRouteComponents, IRoutesById } from './types';

// Get the root React component for ReactDOMServer.renderToString
export async function getClientRootComponent(opts: {
  routes: IRoutesById;
  routeComponents: IRouteComponents;
  pluginManager: any;
  location: string;
  loaderData: { [routeKey: string]: any };
  manifest: any;
}) {
  const basename = '/';
  const components = { ...opts.routeComponents };
  const clientRoutes = createClientRoutes({
    routesById: opts.routes,
    routeComponents: components,
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
  return (
    <Html loaderData={opts.loaderData} manifest={opts.manifest}>
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
    </Html>
  );
}

function Html({ children, loaderData, manifest }: any) {
  // TODO: 处理 head 标签，比如 favicon.ico 的一致性
  // TODO: root 支持配置

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {manifest.assets['umi.css'] && (
          <link rel="stylesheet" href={manifest.assets['umi.css']} />
        )}
      </head>
      <body>
        <noscript
          dangerouslySetInnerHTML={{
            __html: `<b>Enable JavaScript to run this app.</b>`,
          }}
        />

        <div id="root">{children}</div>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__UMI_LOADER_DATA__ = ${JSON.stringify(
              loaderData,
            )}`,
          }}
        />
      </body>
    </html>
  );
}
