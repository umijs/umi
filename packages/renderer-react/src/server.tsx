import type { IMetadata } from '@umijs/server/dist/types';
import React from 'react';
import { StaticRouter } from 'react-router-dom/server';
import { AppContext } from './appContext';
import { Routes } from './browser';
import { createClientRoutes } from './routes';
import { IRouteComponents, IRoutesById } from './types';

interface IHtmlProps {
  routes: IRoutesById;
  routeComponents: IRouteComponents;
  pluginManager: any;
  location: string;
  loaderData: { [routeKey: string]: any };
  manifest: any;
  metadata?: IMetadata;
}

// Get the root React component for ReactDOMServer.renderToString
export async function getClientRootComponent(opts: IHtmlProps) {
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

function Html({
  children,
  loaderData,
  manifest,
  metadata,
}: React.PropsWithChildren<IHtmlProps>) {
  // TODO: 处理 head 标签，比如 favicon.ico 的一致性
  // TODO: root 支持配置

  return (
    <html lang={metadata?.lang || 'en'}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {metadata?.title && <title>{metadata.title}</title>}
        {metadata?.description && (
          <meta name="description" content={metadata.description} />
        )}
        {metadata?.keywords?.length && (
          <meta name="keywords" content={metadata.keywords.join(',')} />
        )}
        {metadata?.metas?.map((em) => (
          <meta key={em.name} name={em.name} content={em.content} />
        ))}
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
