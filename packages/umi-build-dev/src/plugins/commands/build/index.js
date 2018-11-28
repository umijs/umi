import rimraf from 'rimraf';
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
      const RoutesManager = getRouteManager(service);
      RoutesManager.fetchRoutes();

      process.env.NODE_ENV = 'production';
      service.applyPlugins('onStart');

      const filesGenerator = getFilesGenerator(service, {
        RoutesManager,
        mountElementId: config.mountElementId,
      });
      filesGenerator.generate();

      if (process.env.HTML !== 'none') {
        const HtmlGeneratorPlugin = require('../getHtmlGeneratorPlugin').default(
          service,
        );
        // move html-webpack-plugin to the head, so that other plugins (like workbox-webpack-plugin)
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
          debug('Build success end');
        },
        onFail({ err, stats }) {
          log.error(`Build failed`);
          log.error(err);
          service.applyPlugins('onBuildFail', {
            args: {
              err,
              stats,
            },
          });
        },
      });
    },
  );
}
