import getRouteConfig from '../../routes/getRouteConfig';

export default function(service) {
  const { paths, config } = service;
  return {
    routes: null,
    fetchRoutes() {
      this.routes = service.applyPlugins('modifyRoutes', {
        initialValue: getRouteConfig(paths, config),
      });
      service.routes = this.routes;
    },
  };
}
