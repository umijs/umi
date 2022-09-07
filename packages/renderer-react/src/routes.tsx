// @ts-ignore
import React from 'react';
import {
  generatePath,
  Navigate,
  useParams,
  useLocation,
  useNavigate,
  Outlet,
} from 'react-router-dom';
import { RouteContext, useRouteData } from './routeContext';
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
        hasChildren:
          Object.keys(routesById).filter(
            (rid) => routesById[rid].parentId === id,
          ).length > 0,
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
  return <Navigate replace={true} {...propsWithParams} />;
}

function createClientRoute(opts: {
  route: IRoute;
  routeComponent: any;
  loadingComponent?: React.ReactNode;
  hasChildren?: boolean;
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
          hasChildren={opts.hasChildren}
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
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const { route } = useRouteData();
  const match = {
    params,
    isExact: true,
    path: route.path,
    url: location.pathname,
  };

  const history = {
    back: () => navigate(-1),
    goBack: () => navigate(-1),
    location,
    push: (url: string, state?: any) => navigate(url, { state }),
    replace: (url: string, state?: any) =>
      navigate(url, {
        replace: true,
        state,
      }),
  };

  // staticContext 没有兼容 好像没看到对应的兼容写法
  const Component = props.loader;

  return (
    <React.Suspense fallback={<props.loadingComponent />}>
      <Component location={location} match={match} history={history}>
        {props.hasChildren && <Outlet />}
      </Component>
    </React.Suspense>
  );
}
