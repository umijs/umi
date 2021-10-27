import { IRoute, IRoutesById } from './types';

export function createServerRoutes(opts: {
  routesById: IRoutesById;
  parentId?: string;
}) {
  const { routesById, parentId } = opts;
  return Object.keys(routesById)
    .filter((id) => routesById[id].parentId === parentId)
    .map((id) => {
      const route = createServerRoute({
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
