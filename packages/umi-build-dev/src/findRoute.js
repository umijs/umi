import { matchPath } from 'react-router-dom';

export default function findRoute(routes, path) {
  for (const route of routes) {
    if (route.routes) {
      const routesMatch = findRoute(route.routes, path);
      if (routesMatch) {
        return routesMatch;
      }
    } else if (matchPath(path, route)) {
      // for get params (/news/1 => { params: { id： 1 } })
      const { params } = matchPath(path, route);
      return {
        ...route,
        params,
      };
    }
  }
}

export const getUrlQuery = url => {
  if (typeof url === 'string' && url.indexOf('?') > -1) {
    const params = url.slice(1).split('&');
    if (Array.isArray(params) && params.length > 0) {
      return params.reduce((acc, curr) => {
        const [key, value] = curr.split('=');
        return { ...acc, [key]: value };
      }, {});
    }
  }
  return {};
};
