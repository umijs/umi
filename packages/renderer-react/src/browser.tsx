import {
  BrowserHistory,
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
  History,
} from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, useRoutes } from 'react-router-dom';
import { AppContext, useAppData } from './appContext';
import { createClientRoutes } from './routes';
import { IRouteComponents, IRoutesById } from './types';

const historyCreators = {
  browser: createBrowserHistory,
  hash: createHashHistory,
  memory: createMemoryHistory,
};

function BrowserRoutes(props: {
  routes: any;
  clientRoutes: any;
  pluginManager: any;
  historyType: 'browser' | 'hash' | 'memory';
  basename: string;
  children: any;
}) {
  const historyRef = React.useRef<BrowserHistory>();
  if (historyRef.current == null) {
    historyRef.current = historyCreators[props.historyType || 'browser']({
      window,
    }) as History;
  }
  const history = historyRef.current;
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });
  React.useLayoutEffect(() => history.listen(setState), [history]);
  React.useLayoutEffect(
    () =>
      history.listen((location: any, action?: string) => {
        props.pluginManager.applyPlugins({
          key: 'onRouteChange',
          type: 'event',
          args: {
            routes: props.routes,
            clientRoutes: props.clientRoutes,
            location,
            action,
          },
        });
      }),
    [history, props.routes, props.clientRoutes],
  );
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

function Routes() {
  const { clientRoutes } = useAppData();
  return useRoutes(clientRoutes);
}

export function renderClient(opts: {
  rootElement?: HTMLElement;
  routes: IRoutesById;
  routeComponents: IRouteComponents;
  pluginManager: any;
  basename?: string;
  historyType: 'browser' | 'hash' | 'memory';
}) {
  const basename = opts.basename || '/';
  const rootElement = opts.rootElement || document.getElementById('root');
  const clientRoutes = createClientRoutes({
    routesById: opts.routes,
    routeComponents: opts.routeComponents,
  });
  let rootContainer = (
    <BrowserRoutes
      basename={basename}
      pluginManager={opts.pluginManager}
      routes={opts.routes}
      clientRoutes={clientRoutes}
      historyType={opts.historyType}
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
  const browser = (
    <AppContext.Provider
      value={{
        routes: opts.routes,
        routeComponents: opts.routeComponents,
        clientRoutes,
        pluginManager: opts.pluginManager,
        rootElement: opts.rootElement,
        basename,
      }}
    >
      {rootContainer}
    </AppContext.Provider>
  );

  // @ts-ignore
  if (ReactDOM.createRoot) {
    // @ts-ignore
    ReactDOM.createRoot(rootElement).render(browser);
  } else {
    ReactDOM.render(browser, rootElement);
  }
}
