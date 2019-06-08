export default function findRoute(routes, path) {
  for (const route of routes) {
    if (route.routes) {
      return findRoute(route.routes, path);
    } else if (require('react-router-dom').matchPath(path, route)) {
      return route;
    }
  }
}
