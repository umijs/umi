export default function findRoute(routes, path) {
  for (const route of routes) {
    if (route.routes) {
      return findRoute(route.routes, path);
    } else if (require('react-router-dom').matchPath(path, route)) {
      // for get params (/news/1 => { params: { id： 1 } })
      const { params } = require('react-router-dom').matchPath(path, route);
      return {
        ...route,
        params,
      };
    }
  }
}
