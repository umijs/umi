import { Location } from 'history';
import React from 'react';
// @ts-ignore
import dynamic from 'react-loadable';
import { Navigator, Router, useRoutes } from 'react-router-dom';
import { IRoute, IRoutesById } from './types';

export function createClientRoutes(opts: {
  routesById: IRoutesById;
  parentId?: string;
  Component: any;
}) {
  const { routesById, parentId, Component } = opts;
  return Object.keys(routesById)
    .filter((id) => routesById[id].parentId === parentId)
    .map((id) => {
      const route = createClientRoute({
        route: routesById[id],
        Component,
      });
      const children = createClientRoutes({
        routesById,
        parentId: route.id,
        Component,
      });
      if (children.length > 0) {
        // @ts-ignore
        route.children = children;
      }
      return route;
    });
}

export function createClientRoute(opts: { route: IRoute; Component: any }) {
  const { route, Component } = opts;
  return {
    id: route.id,
    path: route.path,
    index: route.index,
    element: <Component id={route.id} />,
  };
}

export function App(props: {
  navigator: Navigator;
  location: Location;
  routes: IRoutesById;
  routeComponents: Record<string, any>;
}) {
  console.log('app props', props);
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

interface IAppContextType {
  routes: any;
  routeComponents: any;
  clientRoutes: any;
}
const AppContext = React.createContext<IAppContextType | undefined>(undefined);

function useAppContext(): IAppContextType {
  return React.useContext(AppContext)!;
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
  const RouteComponent = dynamic({ loader, loading: Loading });

  return (
    <div>
      <h2>route: {props.id}</h2>
      <RouteComponent />
    </div>
  );
}
