import assign from 'object-assign';
import chalk from 'chalk';
import getRouteConfig from '../../../routes/getRouteConfig';
import FilesGenerator from '../../../FilesGenerator';
import getWebpackConfig from '../../../getWebpackConfig';
import createRouteMiddleware from './createRouteMiddleware';
import UserConfig from '../../../UserConfig';
import { unwatch } from '../../../getConfig/watch';

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

  function mergeConfig(oldConfig, newConfig) {
    Object.keys(oldConfig).forEach(key => {
      if (!(key in newConfig)) {
        delete oldConfig[key];
      }
    });
    assign(oldConfig, newConfig);
    return oldConfig;
  }

  api.registerCommand('dev', {}, () => {
    process.env.NODE_ENV = 'development';
    service.applyPlugins('onStart');

    const filesGenerator = new FilesGenerator(service, RoutesManager);
    filesGenerator.generate();

    const userConfig = new UserConfig(service);
    const config = userConfig.getConfig({ force: true });
    mergeConfig(service.config, config);

    const webpackConfig = getWebpackConfig(service);
    service.webpackConfig = webpackConfig;

    let server = null;
    function restart(why) {
      if (!server) return;
      console.log(chalk.green(`Since ${why}, try to restart server`));
      unwatch();
      server.close();
      process.send({ type: 'RESTART' });
    }
    service.restart = restart;

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
        server = devServer;
        service.applyPlugins('beforeServer', { args: { devServer } });
      },
      afterServer(devServer) {
        service.applyPlugins('afterServer', { args: { devServer } });
        filesGenerator.watch();
        userConfig.setConfig(service.config);
        userConfig.watchWithDevServer();
      },
      onCompileDone: stats => {
        service.applyPlugins('onCompileDone', { args: { stats } });
      },
    });
  });
}
