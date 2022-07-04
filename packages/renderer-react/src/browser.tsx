import { History } from 'history';
import React, { useCallback, useEffect, useState } from 'react';
// compatible with < react@18 in @umijs/preset-umi/src/features/react
import ReactDOM from 'react-dom/client';
import { matchRoutes, Router, useRoutes } from 'react-router-dom';
import { AppContext, useAppData } from './appContext';
import { createClientRoutes } from './routes';
import { ILoaderData, IRouteComponents, IRoutesById } from './types';

function BrowserRoutes(props: {
  routes: any;
  clientRoutes: any;
  pluginManager: any;
  history: History;
  basename: string;
  children: any;
}) {
  const { history } = props;
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });
  React.useLayoutEffect(() => history.listen(setState), [history]);
  React.useLayoutEffect(() => {
    function onRouteChange(opts: any) {
      props.pluginManager.applyPlugins({
        key: 'onRouteChange',
        type: 'event',
        args: {
          routes: props.routes,
          clientRoutes: props.clientRoutes,
          location: opts.location,
          action: opts.action,
        },
      });
    }
    history.listen(onRouteChange);
    onRouteChange({ location: state.location, action: state.action });
  }, [history, props.routes, props.clientRoutes]);
  return (
    <Router
      navigator={history}
      location={state.location}
      basename={props.basename}
    >
      {props.children}
    </Router>
  );
}

export function Routes() {
  const { clientRoutes } = useAppData();
  return useRoutes(clientRoutes);
}

export function renderClient(opts: {
  publicPath?: string;
  runtimePublicPath?: boolean;
  rootElement?: HTMLElement;
  routes: IRoutesById;
  routeComponents: IRouteComponents;
  pluginManager: any;
  basename?: string;
  loadingComponent?: React.ReactNode;
  history: History;
  hydrate?: boolean;
}) {
  const basename = opts.basename || '/';
  const rootElement = opts.rootElement || document.getElementById('root')!;
  const clientRoutes = createClientRoutes({
    routesById: opts.routes,
    routeComponents: opts.routeComponents,
    loadingComponent: opts.loadingComponent,
  });
  opts.pluginManager.applyPlugins({
    key: 'patchClientRoutes',
    type: 'event',
    args: {
      routes: clientRoutes,
    },
  });
  let rootContainer = (
    <BrowserRoutes
      basename={basename}
      pluginManager={opts.pluginManager}
      routes={opts.routes}
      clientRoutes={clientRoutes}
      history={opts.history}
    >
      <Routes />
    </BrowserRoutes>
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

  const Browser = () => {
    const [clientLoaderData, setClientLoaderData] = useState<ILoaderData>({});
    const [serverLoaderData, setServerLoaderData] = useState<ILoaderData>(
      // @ts-ignore
      window.__UMI_LOADER_DATA__ || {},
    );

    const handleRouteChange = useCallback(
      (id: string, isFirst?: boolean) => {
        // Patched routes has to id
        const matchedRouteIds = (
          matchRoutes(clientRoutes, id)?.map(
            // @ts-ignore
            (route) => route.route.id,
          ) || []
        ).filter(Boolean);
        matchedRouteIds.forEach((id) => {
          // preload
          // @ts-ignore
          const manifest = window.__umi_manifest__;
          if (manifest) {
            const routeIdReplaced = id.replace(/[\/\-]/g, '_');
            const preloadId = 'preload-' + routeIdReplaced;
            if (!document.getElementById(preloadId)) {
              const key = Object.keys(manifest).find((k) =>
                k.startsWith(routeIdReplaced + '.js'),
              );
              if (!key) return;
              let file = manifest[key];
              const link = document.createElement('link');
              link.id = preloadId;
              link.rel = 'preload';
              link.as = 'script';
              // publicPath already in the manifest,
              // but if runtimePublicPath is true, we need to replace it
              if (opts.runtimePublicPath) {
                file = file.replace(
                  new RegExp(`^${opts.publicPath}`),
                  // @ts-ignore
                  window.publicPath,
                );
              }
              link.href = file;
              document.head.appendChild(link);
            }
          }
          // server loader
          if (!isFirst && opts.routes[id].hasServerLoader) {
            fetch('/__serverLoader?route=' + id)
              .then((d) => d.json())
              .then((data) => {
                // setServerLoaderData when startTransition because if ssr is enabled,
                // the component may being hydrated and setLoaderData will break the hydration
                React.startTransition(() => {
                  setServerLoaderData((d) => ({ ...d, [id]: data }));
                });
              })
              .catch(console.error);
          }
          // client loader
          // onPatchClientRoutes 添加的 route 在 opts.routes 里是不存在的
          const clientLoader = opts.routes[id]?.clientLoader;
          if (clientLoader && !clientLoaderData[id]) {
            clientLoader().then((data: any) => {
              setClientLoaderData((d: any) => ({ ...d, [id]: data }));
            });
          }
        });
      },
      [clientLoaderData],
    );

    useEffect(() => {
      handleRouteChange(window.location.pathname, true);
      return opts.history.listen((e) => {
        handleRouteChange(e.location.pathname);
      });
    }, []);

    return (
      <AppContext.Provider
        value={{
          routes: opts.routes,
          routeComponents: opts.routeComponents,
          clientRoutes,
          pluginManager: opts.pluginManager,
          rootElement: opts.rootElement!,
          basename,
          clientLoaderData,
          serverLoaderData,
          preloadRoute: handleRouteChange,
        }}
      >
        {rootContainer}
      </AppContext.Provider>
    );
  };

  if (opts.hydrate) {
    ReactDOM.hydrateRoot(rootElement, <Browser />);
  } else {
    if (ReactDOM.createRoot) {
      ReactDOM.createRoot(rootElement).render(<Browser />);
    } else {
      // @ts-ignore
      ReactDOM.render(<Browser />, rootElement);
    }
  }
}
