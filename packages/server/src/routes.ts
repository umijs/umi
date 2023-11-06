import { IRoute, IRouteCustom, IRoutesById } from './types';

export function createServerRoutes(opts: {
  routesById: IRoutesById;
  parentId?: string;
  createRoute?: (opts: { route: IRoute }) => IRouteCustom;
}) {
  const { routesById, parentId, createRoute } = opts;
  const createRouteFn = createRoute || createServerRoute;
  return Object.keys(routesById)
    .filter((id) => routesById[id].parentId === parentId)
    .map((id) => {
      const route = createRouteFn({
        route: routesById[id],
      });
      const children = createServerRoutes({
        routesById,
        parentId: route.id,
      });
      if (children.length > 0) {
        // @ts-ignore
        route.children = children;
      }
      return route;
    });
}

export function createServerRoute(opts: { route: IRoute }) {
  const { route } = opts;
  return {
    id: route.id,
    path: route.path,
    index: route.index,
  };
}
