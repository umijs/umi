import { matchPath } from '@umijs/runtime';
import { parse } from 'url';
// @ts-ignore
import serialize from 'serialize-javascript';

export function findRoute(routes: any[], path: string): any {
  const { pathname } = parse(path);
  for (const route of routes) {
    if (route.routes) {
      const routesMatch = findRoute(route.routes, path);
      if (routesMatch) {
        return routesMatch;
      }
    } else if (matchPath(pathname || '', route)) {
      // for get params (/news/1 => { params: { id： 1 } })
      const match = matchPath(pathname || '', route) as any;
      return {
        ...route,
        match,
      };
    }
  }
}

export { serialize };

