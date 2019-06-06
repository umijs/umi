export default function findRoute(routes, path) {
  let activeRoute;
  routes.map(route => {
    if (route.routes) {
      activeRoute = findRoute(route.routes, path);
    } else if (require('react-router-dom').matchPath(path, route)) {
      activeRoute = route;
    }
  });
  return activeRoute;
}
