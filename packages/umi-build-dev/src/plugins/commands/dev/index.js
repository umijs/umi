import { readFileSync } from 'fs';
import chalk from 'chalk';
import notify from 'umi-notify';
import createRouteMiddleware from './createRouteMiddleware';
import { unwatch } from '../../../getConfig/watch';
import getRouteManager from '../getRouteManager';
import getFilesGenerator from '../getFilesGenerator';
import getPort from './getPort';

export default function(api) {
  const { service, config, log, debug, printUmiError, UmiError } = api;
  const { cwd } = service;

  let hasUIArg = false;

  api.addHTMLHeadScript(() => {
    return hasUIArg
      ? {
          content: readFileSync(require.resolve('./injectUI'), 'utf-8'),
        }
      : [];
  });

  api.registerCommand(
    'dev',
    {
      webpack: true,
      description: 'start a dev server for development',
    },
    async (args = {}) => {
      notify.onDevStart({ name: 'umi', version: 2 });

      const RoutesManager = getRouteManager(service);
      RoutesManager.fetchRoutes();

      const { port: portFromArgs, ui } = args;
      if (ui) {
        hasUIArg = true;
      }

      const port = await getPort(portFromArgs);
      service.port = port;

      process.env.NODE_ENV = 'development';
      service.applyPlugins('onStart');
      return new Promise((resolve, reject) => {
        service
          ._applyPluginsAsync('onStartAsync')
          .then(() => {
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
                  `Server is not ready, ${chalk.underline.cyan('api.restart')} does not work.`,
                );
                return;
              }
              if (why) {
                log.pending(`Since ${chalk.cyan.underline(why)}, try to restart server...`);
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
                const { history = 'browser' } = service.config;
                require('af-webpack/dev').default({
                  cwd,
                  port,
                  history: typeof history === 'string' ? history : history[0],
                  base: service.config.base,
                  webpackConfig: service.webpackConfig,
                  proxy: service.config.proxy || {},
                  contentBase: './path-do-not-exists',
                  _beforeServerWithApp(app) {
                    // @private
                    service.applyPlugins('_beforeServerWithApp', { args: { app } });
                  },
                  beforeMiddlewares: service.applyPlugins('addMiddlewareAhead', {
                    initialValue: [
                      ...(service.ssrWebpackConfig
                        ? [
                            require('af-webpack/webpack-dev-middleware')(
                              require('af-webpack/webpack')(service.ssrWebpackConfig),
                              {},
                            ),
                          ]
                        : []),
                    ],
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
                  afterServer(devServer, devServerPort) {
                    service.applyPlugins('afterDevServer', {
                      args: {
                        server: devServer,
                        devServerPort,
                      },
                    });
                    startWatch();
                  },
                  onFail({ stats }) {
                    printUmiError(
                      new UmiError({
                        context: {
                          stats,
                        },
                      }),
                      { detailsOnly: true },
                    );
                  },
                  onCompileDone({ isFirstCompile, stats, port, urls }) {
                    service.__chunks = stats.compilation.chunks;
                    service.applyPlugins('onDevCompileDone', {
                      args: {
                        isFirstCompile,
                        stats,
                        port,
                        server,
                        urls,
                      },
                    });
                    if (isFirstCompile) {
                      notify.onDevComplete({
                        name: 'umi',
                        version: 2,
                      });
                      resolve({
                        port,
                        stats,
                        server,
                      });
                    }
                  },
                });
              })
              .catch(e => {
                log.error(e);
              });
          })
          .catch(e => {
            log.error(e);
            process.exit(1);
          });
      });
    },
  );
}
