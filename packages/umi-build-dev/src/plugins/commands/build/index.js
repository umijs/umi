import rimraf from 'rimraf';
import notify from 'umi-notify';
import getRouteManager from '../getRouteManager';
import getFilesGenerator from '../getFilesGenerator';
import replaceChunkMaps from '../replaceChunkMaps';

export default function(api) {
  const { service, debug, config, UmiError, printUmiError } = api;
  const { cwd, paths } = service;

  api.registerCommand(
    'build',
    {
      webpack: true,
      description: 'building for production',
    },
    args => {
      const watch = args.w || args.watch;
      notify.onBuildStart({ name: 'umi', version: 2 });

      const RoutesManager = getRouteManager(service);
      RoutesManager.fetchRoutes();

      return new Promise((resolve, reject) => {
        process.env.NODE_ENV = 'production';
        service.applyPlugins('onStart');
        service._applyPluginsAsync('onStartAsync').then(() => {
          service.rebuildTmpFiles = () => {
            filesGenerator.rebuild();
          };
          service.rebuildHTML = () => {
            service.applyPlugins('onHTMLRebuild');
          };

          const filesGenerator = getFilesGenerator(service, {
            RoutesManager,
            mountElementId: config.mountElementId,
          });
          filesGenerator.generate();

          function startWatch() {
            filesGenerator.watch();
            service.userConfig.setConfig(service.config);
            service.userConfig.watchWithDevServer();
          }

          if (process.env.HTML !== 'none') {
            const HtmlGeneratorPlugin = require('../getHtmlGeneratorPlugin').default(service);
            // move html-webpack-plugin to the head, so that
            // other plugins (like workbox-webpack-plugin)
            // which listen to `emit` event can detect assets
            service.webpackConfig.plugins.unshift(new HtmlGeneratorPlugin());
          }
          service._applyPluginsAsync('beforeBuildCompileAsync').then(() => {
            require('af-webpack/build').default({
              cwd,
              watch,
              // before: service.webpackConfig
              // now: [ service.webpackConfig, ... ] , for ssr or more configs
              webpackConfig: [
                service.webpackConfig,
                ...(service.ssrWebpackConfig ? [service.ssrWebpackConfig] : []),
              ],
              // stats now is Array MultiStats
              // [ clientStats, ...otherStats ]
              onSuccess({ stats }) {
                debug('Build success');
                if (watch) {
                  startWatch();
                }
                if (process.env.RM_TMPDIR !== 'none' && !watch) {
                  debug(`Clean tmp dir ${service.paths.tmpDirPath}`);
                  rimraf.sync(paths.absTmpDirPath);
                }
                if (service.ssrWebpackConfig) {
                  // replace using manifest
                  // __UMI_SERVER__.js/css => umi.${hash}.js/css
                  const clientStat = Array.isArray(stats.stats) ? stats.stats[0] : stats;
                  if (clientStat) {
                    replaceChunkMaps(service, clientStat);
                  }
                }
                service.applyPlugins('onBuildSuccess', {
                  args: {
                    stats,
                  },
                });
                service
                  ._applyPluginsAsync('onBuildSuccessAsync', {
                    args: {
                      stats,
                    },
                  })
                  .then(() => {
                    debug('Build success end');

                    notify.onBuildComplete({ name: 'umi', version: 2 }, { err: null });
                    resolve();
                  });
              },
              // stats now is Array MultiStats
              // [ clientStats, ...otherStats ]
              onFail({ err, stats }) {
                service.applyPlugins('onBuildFail', {
                  args: {
                    err,
                    stats,
                  },
                });
                notify.onBuildComplete({ name: 'umi', version: 2 }, { err });
                printUmiError(
                  new UmiError({
                    message: err && err.message,
                    context: {
                      err,
                      stats,
                    },
                  }),
                  { detailsOnly: true },
                );
                reject(err);
              },
            });
          });
        });
      });
    },
  );
}
