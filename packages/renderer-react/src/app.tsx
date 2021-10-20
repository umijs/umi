import { Location } from 'history';
import React from 'react';
import { Navigator, Router, useRoutes } from 'react-router-dom';
import { AppContext, useAppContext } from './appContext';
import { createClientRoutes } from './routes';
import { IRoutesById } from './types';

export function App(props: {
  navigator: Navigator;
  location: Location;
  routes: IRoutesById;
  routeComponents: Record<string, any>;
}) {
  const clientRoutes = React.useMemo(() => {
    return createClientRoutes({
      routesById: props.routes,
      Component: RouteComponent,
    });
  }, [props.routes]);
  return (
    <AppContext.Provider
      value={{
        routes: props.routes,
        routeComponents: props.routeComponents,
        clientRoutes,
      }}
    >
      <Router navigator={props.navigator} location={props.location}>
        <Routes />
      </Router>
    </AppContext.Provider>
  );
}

function Routes() {
  const { clientRoutes } = useAppContext();
  return useRoutes(clientRoutes) || clientRoutes[0].element;
}

function Loading() {
  return <div>Loading...</div>;
}

export function RouteComponent(props: { id: string }) {
  const loader = useAppContext().routeComponents[props.id];
  const RouteComponent = React.lazy(loader);

  // ref: https://reactjs.org/docs/code-splitting.html
  // TODO: replace with https://github.com/gregberge/loadable-components when we support ssr
  return (
    <React.Suspense fallback={<Loading />}>
      <RouteComponent />
    </React.Suspense>
  );
}
