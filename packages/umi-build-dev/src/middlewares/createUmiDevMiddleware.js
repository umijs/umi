import { matchRoutes } from 'react-router-config';
import { setRequest } from '../requestCache';

const COMPILING_PREFIX = '/__umi_dev/compiling';

export default function createUmiDevMiddleware(service, opts = {}) {
  const { config } = service;
  return (req, res, next) => {
    const { path } = req;

    if (!path.startsWith(COMPILING_PREFIX)) {
      return next();
    }

    const routePath = path.replace(COMPILING_PREFIX, '');
    const matchedRoutes = matchRoutes(service.routes, routePath);

    if (matchedRoutes && matchedRoutes.length) {
      matchedRoutes.forEach(({ route }) => {
        let newPath = null;
        if (config.exportStatic && config.exportStatic.htmlSuffix) {
          newPath = route.path.replace('(.html)?', '');
        }
        if (route.path) setRequest(newPath || route.path);
      });
      opts.rebuildEntry();
    }

    res.end('done');
  };
}
