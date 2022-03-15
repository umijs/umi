import { IRoute } from '../types';
import { createRouteId } from './utils';

export function defineRoutes(callback: (defineRoute: Function) => void) {
  const routes = Object.create(null);
  const parentRoutes: IRoute[] = [];
  const defineRoute = (opts: {
    path: string;
    file: string;
    options?: {};
    children: Function;
  }) => {
    opts.options = opts.options || {};
    const parentId =
      parentRoutes.length > 0
        ? parentRoutes[parentRoutes.length - 1].id
        : undefined;
    const parentAbsPath = parentId
      ? parentRoutes[parentRoutes.length - 1].absPath.concat('/')
      : '/';
    const absPath = parentAbsPath.concat(opts.path);
    const route = {
      path: opts.path || '/',
      id: createRouteId(opts.file),
      parentId,
      file: opts.file,
      absPath,
    };
    routes[route.id] = route;
    if (opts.children) {
      parentRoutes.push(route);
      opts.children();
      parentRoutes.pop();
    }
  };
  callback(defineRoute);
  return routes;
}
