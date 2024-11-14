// @ts-ignore
import React from 'react';
import {
  generatePath,
  Navigate,
  Outlet,
  useLocation,
  useParams,
} from 'react-router-dom';
import { useAppData, useRouteProps } from './appContext';
import { RouteContext, useRouteData } from './routeContext';
import { IClientRoute, IRoute, IRoutesById } from './types';

export function createClientRoutes(opts: {
  routesById: IRoutesById;
  routeComponents: Record<string, any>;
  parentId?: string;
  loadingComponent?: React.ReactNode;
  reactRouter5Compat?: boolean;
  useStream?: boolean;
}) {
  const { routesById, parentId, routeComponents, useStream = true } = opts;
  return Object.keys(routesById)
    .filter((id) => routesById[id].parentId === parentId)
    .map((id) => {
      const route = createClientRoute({
        route: routesById[id],
        routeComponent: routeComponents[id],
        loadingComponent: opts.loadingComponent,
        reactRouter5Compat: opts.reactRouter5Compat,
        ...(opts.reactRouter5Compat && {
          // TODO: 这个不准，没考虑 patchClientRoutes 的场景
          hasChildren:
            Object.keys(routesById).filter(
              (rid) => routesById[rid].parentId === id,
            ).length > 0,
        }),
        useStream,
      });
      const children = createClientRoutes({
        routesById,
        routeComponents,
        parentId: route.id,
        loadingComponent: opts.loadingComponent,
        reactRouter5Compat: opts.reactRouter5Compat,
        useStream,
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
  let to = generatePath(props.to, params);
  const routeProps = useRouteProps();
  const location = useLocation();
  if (routeProps?.keepQuery) {
    const queryAndHash = location.search + location.hash;
    to += queryAndHash;
  }
  const propsWithParams = {
    ...props,
    to,
  };
  return <Navigate replace={true} {...propsWithParams} />;
}

function createClientRoute(opts: {
  route: IRoute;
  routeComponent: any;
  loadingComponent?: React.ReactNode;
  hasChildren?: boolean;
  reactRouter5Compat?: boolean;
  useStream?: boolean;
}): IClientRoute {
  const { route, useStream = true } = opts;
  const { redirect, ...props } = route;
  const Remote = opts.reactRouter5Compat
    ? RemoteComponentReactRouter5
    : RemoteComponent;
  return {
    element: redirect ? (
      <NavigateWithParams to={redirect} />
    ) : (
      <RouteContext.Provider
        value={{
          route: opts.route,
        }}
      >
        <Remote
          loader={React.memo(opts.routeComponent)}
          loadingComponent={opts.loadingComponent || DefaultLoading}
          hasChildren={opts.hasChildren}
          useStream={useStream}
        />
      </RouteContext.Provider>
    ),
    ...props,
  };
}

function DefaultLoading() {
  return <div />;
}

function RemoteComponentReactRouter5(props: any) {
  const { route } = useRouteData();
  const { history, clientRoutes } = useAppData();
  const params = useParams();
  const match = {
    params,
    isExact: true,
    path: route.path,
    url: history.location.pathname,
  };

  // staticContext 没有兼容 好像没看到对应的兼容写法
  const Component = props.loader;
  const ComponentProps = {
    location: history.location,
    match,
    history,
    params,
    route,
    routes: clientRoutes,
  };
  return props.useStream ? (
    <React.Suspense fallback={<props.loadingComponent />}>
      <Component {...ComponentProps}>
        {props.hasChildren && <Outlet />}
      </Component>
    </React.Suspense>
  ) : (
    <Component {...ComponentProps}>{props.hasChildren && <Outlet />}</Component>
  );
}

function RemoteComponent(props: any) {
  const Component = props.loader;
  return props.useStream ? (
    <React.Suspense fallback={<props.loadingComponent />}>
      <Component />
    </React.Suspense>
  ) : (
    <Component />
  );
}
