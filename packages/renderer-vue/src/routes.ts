import { IRoute, IRoutesById } from './types';

export function createClientRoutes(opts: {
  routesById: IRoutesById;
  routeComponents: Record<string, any>;
  parentId?: string;
}) {
  const { routesById, parentId, routeComponents } = opts;
  return Object.keys(routesById)
    .filter((id) => routesById[id].parentId === parentId)
    .map((id) => {
      const route = createClientRoute({
        route: routesById[id],
        routeComponent: routeComponents[id],
        parentId,
      });

      const children = createClientRoutes({
        routesById,
        routeComponents,
        parentId: route.id,
      });

      if (children.length > 0) {
        // @ts-ignore
        route.children = children;
      }

      delete route.id;

      return route;
    });
}

export function createClientRoute(opts: {
  route: IRoute;
  routeComponent: any;
  parentId?: string;
}) {
  const { route } = opts;
  const { id, path, redirect, ...other } = route;

  if (redirect) {
    return {
      ...other,
      id,
      path,
      redirect,
    };
  }

  const item: Record<string, any> = {
    ...other,
    id,
    component: opts.routeComponent,
    path,
  };

  if (route.parentId === undefined && path && !path.startsWith('/')) {
    // fix Uncaught (in promise) Error: Route paths should start with a "/": "users" should be "/users".
    item.path = `/${path}`;
  }

  return item;
}
