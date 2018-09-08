import rimraf from 'rimraf';
import getRouteManager from '../getRouteManager';
import getFilesGenerator from '../getFilesGenerator';

export default function(api) {
  const { service, debug, config } = api;
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
        service.webpackConfig.plugins.push(new HtmlGeneratorPlugin());
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
          debug(`Build failed ${err}`);
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
