import chalk from 'chalk';
import notify from 'umi-notify';
import createRouteMiddleware from './createRouteMiddleware';
import { unwatch } from '../../../getConfig/watch';
import getRouteManager from '../getRouteManager';
import getFilesGenerator from '../getFilesGenerator';

export default function(api) {
  const { service, config, log, debug } = api;
  const { cwd } = service;

  api.registerCommand(
    'dev',
    {
      webpack: true,
      description: 'start a dev server for development',
    },
    (args = {}) => {
      notify.onDevStart({ name: 'umi', version: 2 });

      const RoutesManager = getRouteManager(service);
      RoutesManager.fetchRoutes();

      const { port } = args;
      process.env.NODE_ENV = 'development';
      service.applyPlugins('onStart');
      service._applyPluginsAsync('onStartAsync').then(() => {
        const filesGenerator = getFilesGenerator(service, {
          RoutesManager,
          mountElementId: config.mountElementId,
        });
        debug('generate files');
        filesGenerator.generate();

        let server = null;

        // Add more service methods.
        service.restart = why => {
          if (!server) {
            log.debug(
              `Server is not ready, ${chalk.underline.cyan(
                'api.restart',
              )} does not work.`,
            );
            return;
          }
          if (why) {
            log.pending(
              `Since ${chalk.cyan.underline(why)}, try to restart server...`,
            );
          } else {
            log.pending(`Try to restart server...`);
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
        service.rebuildHTML = () => {
          // Currently, refresh browser will get new HTML.
          service.applyPlugins('onHTMLRebuild');
          service.refreshBrowser();
        };

        function startWatch() {
          filesGenerator.watch();
          service.userConfig.setConfig(service.config);
          service.userConfig.watchWithDevServer();
        }

        service
          ._applyPluginsAsync('_beforeDevServerAsync')
          .then(() => {
            debug('start dev server with af-webpack/dev');
            require('af-webpack/dev').default({
              cwd,
              port,
              base: service.config.base,
              webpackConfig: service.webpackConfig,
              proxy: service.config.proxy || {},
              contentBase: './path-do-not-exists',
              _beforeServerWithApp(app) {
                // @private
                service.applyPlugins('_beforeServerWithApp', { args: { app } });
              },
              beforeMiddlewares: service.applyPlugins('addMiddlewareAhead', {
                initialValue: [],
              }),
              afterMiddlewares: service.applyPlugins('addMiddleware', {
                initialValue: [
                  ...(process.env.ROUTE_MIDDLEWARE !== 'none'
                    ? [createRouteMiddleware(service)]
                    : []),
                ],
              }),
              beforeServer(devServer) {
                server = devServer;
                service.applyPlugins('beforeDevServer', {
                  args: { server: devServer },
                });
              },
              afterServer(devServer) {
                service.applyPlugins('afterDevServer', {
                  args: { server: devServer },
                });
                startWatch();
              },
              onCompileDone({ isFirstCompile, stats }) {
                service.__chunks = stats.compilation.chunks;
                service.applyPlugins('onDevCompileDone', {
                  args: {
                    isFirstCompile,
                    stats,
                  },
                });
                if (isFirstCompile) {
                  notify.onDevComplete({
                    name: 'umi',
                    version: 2,
                  });
                }
              },
            });
          })
          .catch(e => {
            log.error(e);
          });
      });
    },
  );
}
