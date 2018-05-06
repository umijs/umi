import { matchRoutes } from 'react-router-config';
import { setRequest } from '../requestCache';

const COMPILING_PREFIX = '/__umi_dev/compiling';

export default function createUmiDevMiddleware(service, opts = {}) {
  return (req, res, next) => {
    const { path } = req;

    if (!path.startsWith(COMPILING_PREFIX)) {
      return next();
    }

    const routePath = path.replace(COMPILING_PREFIX, '');
    const routes = [...service.routes];
    const rootRoute = routes.filter(route => route.path === '/')[0];
    if (rootRoute) {
      routes.unshift({
        ...rootRoute,
        path: '/index.html',
      });
    }
    const matchedRoutes = matchRoutes(routes, routePath);

    if (matchedRoutes && matchedRoutes.length) {
      matchedRoutes.forEach(({ route }) => {
        setRequest(route.path);
      });
      opts.rebuildEntry();
    }

    res.end('done');
  };
}
