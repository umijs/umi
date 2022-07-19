// @ts-ignore
import React from 'react';
import { generatePath, Navigate, useParams } from 'react-router-dom';
import { RouteContext } from './routeContext';
import { IClientRoute, IRoute, IRoutesById } from './types';

export function createClientRoutes(opts: {
  routesById: IRoutesById;
  routeComponents: Record<string, any>;
  parentId?: string;
  loadingComponent?: React.ReactNode;
}) {
  const { routesById, parentId, routeComponents } = opts;
  return Object.keys(routesById)
    .filter((id) => routesById[id].parentId === parentId)
    .map((id) => {
      const route = createClientRoute({
        route: routesById[id],
        routeComponent: routeComponents[id],
        loadingComponent: opts.loadingComponent,
      });
      const children = createClientRoutes({
        routesById,
        routeComponents,
        parentId: route.id,
        loadingComponent: opts.loadingComponent,
      });
      if (children.length > 0) {
        route.children = children;
        // TODO: remove me
        // compatible with @ant-design/pro-layout
        route.routes = children;
      }
      return route;
    });
}

function NavigateWithParams(props: { to: string }) {
  const params = useParams();
  const propsWithParams = {
    ...props,
    to: generatePath(props.to, params),
  };
  return <Navigate {...propsWithParams} />;
}

function createClientRoute(opts: {
  route: IRoute;
  routeComponent: any;
  loadingComponent?: React.ReactNode;
}): IClientRoute {
  const { route } = opts;
  const { redirect, ...props } = route;
  return {
    element: redirect ? (
      <NavigateWithParams to={redirect} />
    ) : (
      <RouteContext.Provider
        value={{
          route: opts.route,
        }}
      >
        <RemoteComponent
          loader={opts.routeComponent}
          loadingComponent={opts.loadingComponent || DefaultLoading}
        />
      </RouteContext.Provider>
    ),
    ...props,
  };
}

function DefaultLoading() {
  return <div />;
}

function RemoteComponent(props: any) {
  const useSuspense = true; // !!React.startTransition;
  if (useSuspense) {
    const Component = props.loader;
    return (
      <React.Suspense fallback={<props.loadingComponent />}>
        <Component />
      </React.Suspense>
    );
  } else {
    return null;
    // // @ts-ignore
    //     import loadable from '@loadable/component';
    //     const Component = loadable(props.loader, {
    //       fallback: <props.loadingComponent />,
    //     });
    //     return <Component />;
  }
}
