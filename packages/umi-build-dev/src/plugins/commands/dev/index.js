import assign from 'object-assign';
import chalk from 'chalk';
import FilesGenerator from '../../../FilesGenerator';
import createRouteMiddleware from './createRouteMiddleware';
import UserConfig from '../../../UserConfig';
import { unwatch } from '../../../getConfig/watch';
import getRouteManager from '../getRouteManager';

export default function(api) {
  const { service } = api;
  const { cwd } = service;
  const RoutesManager = getRouteManager(service);
  RoutesManager.fetchRoutes();

  function mergeConfig(oldConfig, newConfig) {
    Object.keys(oldConfig).forEach(key => {
      if (!(key in newConfig)) {
        delete oldConfig[key];
      }
    });
    assign(oldConfig, newConfig);
    return oldConfig;
  }

  api.registerCommand('dev', {}, (args = {}) => {
    const { port } = args;
    process.env.NODE_ENV = 'development';
    service.applyPlugins('onStart');

    const filesGenerator = new FilesGenerator(service, RoutesManager);
    filesGenerator.generate();

    const userConfig = new UserConfig(service);
    const config = userConfig.getConfig({ force: true });
    mergeConfig(service.config, config);

    let server = null;
    function restart(why) {
      if (!server) return;
      if (why) {
        console.log(chalk.green(`Since ${why}, try to restart server`));
      } else {
        console.log(chalk.green(`Try to restart server`));
      }
      unwatch();
      filesGenerator.unwatch();
      server.close();
      process.send({ type: 'RESTART' });
    }
    service.dev = {
      restart,
      server: null,
      rebuildFiles() {
        filesGenerator.rebuild();
      },
    };

    function startWatch() {
      filesGenerator.watch();
      userConfig.setConfig(service.config);
      userConfig.watchWithDevServer();
    }

    require('af-webpack/dev').default({
      cwd,
      port,
      webpackConfig: service.webpackConfig,
      proxy: config.proxy || {},
      contentBase: './path-do-not-exists',
      _beforeServerWithApp(app) {
        // @private
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
        service.dev.server = server;
        service.applyPlugins('beforeServer', { args: { devServer } });
      },
      afterServer(devServer) {
        service.applyPlugins('afterServer', { args: { devServer } });
        startWatch();
      },
      onCompileDone: stats => {
        service.applyPlugins('onCompileDone', { args: { stats } });
      },
    });
  });
}
