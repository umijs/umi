import getRouteConfig from '../../routes/getRouteConfig';
import FilesGenerator from '../../FilesGenerator';
import getWebpackConfig from '../../getWebpackConfig';
import createRouteMiddleware from '../../middlewares/createRouteMiddleware';

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
    service.webpackConfig = webpackConfig;
    require('af-webpack/dev').default({
      cwd,
      webpackConfig,
      proxy: config.proxy || {},
      contentBase: './path-do-not-exists',
      _beforeServerWithApp(app) {
        service.applyPlugins('_beforeServerWithApp', { args: { app } });
      },
      beforeMiddlewares: service.applyPlugins('modifyBeforeMiddlewares', {
        initialValue: [],
      }),
      afterMiddlewares: service.applyPlugins('modifyAfterMiddlewares', {
        initialValue: [createRouteMiddleware(service)],
      }),
      beforeServer(devServer) {
        service.applyPlugins('beforeServer', { args: { devServer } });
      },
      afterServer(devServer) {
        service.applyPlugins('afterServer', { args: { devServer } });
      },
      onCompileDone: stats => {
        service.applyPlugins('onCompileDone', { args: { stats } });
      },
    });
  });
}
