import getRouteConfig from '../../routes/getRouteConfig';

export default function(service) {
  const { paths, config } = service;
  return {
    routes: null,
    fetchRoutes() {
      const routes = service.applyPlugins('modifyRoutes', {
        initialValue: getRouteConfig(paths, config, route => {
          service.applyPlugins('onPatchRoute', {
            args: {
              route,
            },
          });
        }),
      });
      this.routes = routes;
      service.routes = routes;
    },
  };
}
