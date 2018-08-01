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
    const RoutesManager = getRouteManager(service);
    RoutesManager.fetchRoutes();

    const { port } = args;
    process.env.NODE_ENV = 'development';
    service.applyPlugins('onStart');

    const filesGenerator = new FilesGenerator(service, RoutesManager);
    filesGenerator.generate();

    const userConfig = new UserConfig(service);
    const config = userConfig.getConfig({ force: true });
    mergeConfig(service.config, config);

    let server = null;

    // Add more service methods.
    service.restart = why => {
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
    };
    service.refreshBrowser = () => {
      if (!server) return;
      server.sockWrite(server.sockets, 'content-changed');
    };
    service.printError = messages => {
      if (!server) return;
      messages = typeof messages === 'string' ? [messages] : messages;
      server.sockWrite(server.sockets, 'errors', messages);
    };
    service.printWarn = messages => {
      if (!server) return;
      messages = typeof messages === 'string' ? [messages] : messages;
      server.sockWrite(server.sockets, 'warns', messages);
    };
    service.rebuildTmpFiles = () => {
      filesGenerator.rebuild();
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
        service.applyPlugins('_onBeforeServerWithApp', { args: { app } });
      },
      beforeMiddlewares: service.applyPlugins('modifyBeforeMiddlewares', {
        initialValue: [],
      }),
      afterMiddlewares: service.applyPlugins('modifyAfterMiddlewares', {
        initialValue: [createRouteMiddleware(service)],
      }),
      beforeServer(devServer) {
        server = devServer;
        service.applyPlugins('beforeDevServer', { args: { devServer } });
      },
      afterServer(devServer) {
        service.applyPlugins('afterDevServer', { args: { devServer } });
        startWatch();
      },
      onCompileDone({ isFirstCompile, stats }) {
        service.applyPlugins('onDevCompileDone', {
          args: {
            isFirstCompile,
            stats,
          },
        });
      },
    });
  });
}
