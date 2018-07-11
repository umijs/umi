import getRouteConfig from '../../routes/getRouteConfig';
import FilesGenerator from '../../FilesGenerator';
import getWebpackConfig from '../../getWebpackConfig';

export default function(api) {
  const { service } = api;
  const { cwd, paths, config } = service;

  const RoutesManager = {
    routes: null,
    fetchRoutes() {
      this.routes = service.applyPlugins('modifyRoutes', {
        initialValue: getRouteConfig(paths, config),
      });
    },
  };

  api.registerCommand('dev', {}, () => {
    service.applyPlugins('onStart');

    const filesGenerator = new FilesGenerator(service, RoutesManager);
    filesGenerator.generate();

    const webpackConfig = getWebpackConfig(service);
    require('af-webpack/dev').default({
      cwd,
      webpackConfig,
      proxy: config.proxy,
    });
  });
}
