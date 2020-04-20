import { matchPath } from 'react-router-dom';

export function findRoute(routes: any[], pathname: string): any {
  for (const route of routes) {
    if (route.routes) {
      const routesMatch = findRoute(route.routes, pathname);
      if (routesMatch) {
        return routesMatch;
      }
    } else if (matchPath(pathname, route)) {
      // for get params (/news/1 => { params: { id： 1 } })
      const { params } = matchPath(pathname, route) as any;
      return {
        ...route,
        params,
      };
    }
  }
}
