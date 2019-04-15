import { matchPath } from 'react-router-dom';

const findRoute = (routes, path) => {
  let activeRoute;
  routes.map(route => {
    if (route.routes) {
      activeRoute = findRoute(route.routes, path);
    } else if (matchPath(path, route)) {
      activeRoute = route;
    }
  });
  return activeRoute;
};
export default findRoute;
