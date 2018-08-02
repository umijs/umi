import { join } from 'path';
import { existsSync } from 'fs';
import getRouteConfigFromConfigFile from './getRouteConfigFromConfigFile';
import getRouteConfigFromDir from './getRouteConfigFromDir';
import patchRoutes from './patchRoutes';
import getRouteConfigFromConfig from './getRouteConfigFromConfig';

export default (paths, config = {}, onPatchRoute) => {
  let routes = null;

  const routeConfigFile = join(paths.absSrcPath, '_routes.json');
  if (config.routes) {
    routes = getRouteConfigFromConfig(config.routes, paths.pagesPath);
  } else if (existsSync(routeConfigFile)) {
    routes = getRouteConfigFromConfigFile(routeConfigFile);
  } else {
    routes = getRouteConfigFromDir(paths);
  }

  patchRoutes(
    routes,
    config,
    /* isProduction */ process.env.NODE_ENV === 'production',
    onPatchRoute,
  );
  return routes;
};
