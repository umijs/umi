// @ts-ignore
import { BrowserHistory, createBrowserHistory } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, useRoutes } from 'react-router-dom';
import { AppContext, useAppData } from './appContext';
import { createClientRoutes } from './routes';
import { IRouteComponents, IRoutesById } from './types';

function BrowserRoutes(props: any) {
  const historyRef = React.useRef<BrowserHistory>();
  if (historyRef.current == null) {
    historyRef.current = createBrowserHistory({ window });
  }
  const history = historyRef.current;
  const [state, setState] = React.useState({
    action: history.action,
    location: history.location,
  });
  React.useLayoutEffect(() => history.listen(setState), [history]);
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
}) {
  const basename = opts.basename || '/';
  const rootElement = opts.rootElement || document.getElementById('root');
  const clientRoutes = createClientRoutes({
    routesById: opts.routes,
    routeComponents: opts.routeComponents,
  });
  let rootContainer = (
    <BrowserRoutes basename={basename}>
      <Routes />
    </BrowserRoutes>
  );
  for (const key of [
    'innerProvider',
    'i18nProvider',
    'accessProvider',
    'dataflowProvider',
    'outerProvider',
    // Highest priority
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
