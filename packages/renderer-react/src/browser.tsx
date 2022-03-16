import { History } from 'history';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router, useRoutes } from 'react-router-dom';
import { AppContext, useAppData } from './appContext';
import { createClientRoutes } from './routes';
import { IRouteComponents, IRoutesById } from './types';

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
  loadingComponent?: React.ReactNode;
  history: History;
}) {
  const basename = opts.basename || '/';
  const rootElement = opts.rootElement || document.getElementById('root');
  const clientRoutes = createClientRoutes({
    routesById: opts.routes,
    routeComponents: opts.routeComponents,
    loadingComponent: opts.loadingComponent,
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
