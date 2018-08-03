import rimraf from 'rimraf';
import FilesGenerator from '../../../FilesGenerator';
import chunksToMap from './chunksToMap';
import getRouteManager from '../getRouteManager';
import getHtmlGenerator from '../getHtmlGenerator';

export default function(api) {
  const { service, debug } = api;
  const { cwd, paths } = service;

  api.registerCommand('build', {}, () => {
    const RoutesManager = getRouteManager(service);
    RoutesManager.fetchRoutes();

    process.env.NODE_ENV = 'production';
    service.applyPlugins('onStart');

    const filesGenerator = new FilesGenerator(service, RoutesManager);
    filesGenerator.generate();

    require('af-webpack/build').default({
      cwd,
      webpackConfig: service.webpackConfig,
      onSuccess({ stats }) {
        if (process.env.RM_TMPDIR !== 'none') {
          debug(`Clean tmp dir ${service.paths.tmpDirPath}`);
          rimraf.sync(paths.absTmpDirPath);
        }

        if (process.env.HTML !== 'none') {
          debug(`Bundle html files`);
          const chunksMap = chunksToMap(stats.compilation.chunks);
          try {
            const hg = getHtmlGenerator(service, {
              chunksMap,
            });
            hg.generate();
          } catch (e) {
            console.log(e);
          }
        }

        service.applyPlugins('onBuildSuccess', {
          args: {
            stats,
          },
        });
      },
      onFail(err) {
        service.applyPlugins('onBuildFail', {
          args: {
            err,
          },
        });
      },
    });
  });
}
