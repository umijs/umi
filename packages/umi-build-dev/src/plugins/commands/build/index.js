import rimraf from 'rimraf';
import notify from 'umi-notify';
import getRouteManager from '../getRouteManager';
import getFilesGenerator from '../getFilesGenerator';

export default function(api) {
  const { service, debug, config, log } = api;
  const { cwd, paths } = service;

  api.registerCommand(
    'build',
    {
      webpack: true,
      description: 'building for production',
    },
    () => {
      notify.onBuildStart({ name: 'umi', version: 2 });

      const RoutesManager = getRouteManager(service);
      RoutesManager.fetchRoutes();

      return new Promise((resolve, reject) => {
        process.env.NODE_ENV = 'production';
        service.applyPlugins('onStart');
        service._applyPluginsAsync('onStartAsync').then(() => {
          const filesGenerator = getFilesGenerator(service, {
            RoutesManager,
            mountElementId: config.mountElementId,
          });
          filesGenerator.generate();

          if (process.env.HTML !== 'none') {
            const HtmlGeneratorPlugin = require('../getHtmlGeneratorPlugin').default(
              service,
            );
            // move html-webpack-plugin to the head, so that
            // other plugins (like workbox-webpack-plugin)
            // which listen to `emit` event can detect assets
            service.webpackConfig.plugins.unshift(new HtmlGeneratorPlugin());
          }
          require('af-webpack/build').default({
            cwd,
            webpackConfig: service.webpackConfig,
            onSuccess({ stats }) {
              debug('Build success');
              if (process.env.RM_TMPDIR !== 'none') {
                debug(`Clean tmp dir ${service.paths.tmpDirPath}`);
                rimraf.sync(paths.absTmpDirPath);
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

                  notify.onBuildComplete(
                    { name: 'umi', version: 2 },
                    { err: null },
                  );
                  resolve();
                });
            },
            onFail({ err, stats }) {
              service.applyPlugins('onBuildFail', {
                args: {
                  err,
                  stats,
                },
              });
              notify.onBuildComplete({ name: 'umi', version: 2 }, { err });
              reject(err);
            },
          });
        });
      });
    },
  );
}
