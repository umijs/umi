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
    const parentRoute =
      parentRoutes.length > 0 ? parentRoutes[parentRoutes.length - 1] : null;
    const parentId = parentRoute?.id;
    const parentAbsPath = parentRoute?.absPath;
    const absPath = [parentAbsPath, opts.path].join('/');
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
