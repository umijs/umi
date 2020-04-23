import { matchPath } from '@umijs/runtime';
import { parse, UrlWithStringQuery } from 'url';
// @ts-ignore
import serialize from 'serialize-javascript';


function addLeadingSlash(path: string): string {
  return path.charAt(0) === "/" ? path : "/" + path;
}

// from react-router
function stripBasename(basename: string, location: UrlWithStringQuery): UrlWithStringQuery {
  if (!basename) return location;

  const base = addLeadingSlash(basename);

  if (location?.pathname?.indexOf(base) !== 0) return location;

  return {
    ...location,
    pathname: addLeadingSlash(location.pathname.substr(base.length))
  };
}

export function findRoute(routes: any[], path: string, basename: string = '/'): any {
  const { pathname } = stripBasename(basename, parse(path));
  for (const route of routes) {
    if (route.routes) {
      const routesMatch = findRoute(route.routes, path, basename);
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

