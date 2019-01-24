import getRouteConfig from '../../routes/getRouteConfig';

const debug = require('debug')('umi-build-dev:getRouteManager');

export default function(service) {
  const { paths, config } = service;
  return {
    routes: null,
    fetchRoutes() {
      debug('fetch routes');
      const routes = service.applyPlugins('modifyRoutes', {
        initialValue: getRouteConfig(paths, config, route => {
          service.applyPlugins('onPatchRoute', {
            args: {
              route,
            },
          });
        }),
      });
      debug('fetch routes done');
      debug(routes);
      this.routes = routes;
      service.routes = routes;
    },
  };
}
