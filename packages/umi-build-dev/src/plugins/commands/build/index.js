import rimraf from 'rimraf';
import FilesGenerator from '../../../FilesGenerator';
import chunksToMap from './chunksToMap';
import HtmlGenerator from '../../../html/HtmlGenerator';
import getRouteManager from '../getRouteManager';

export default function(api) {
  const {
    service,
    utils: { debug },
  } = api;
  const { cwd, paths } = service;
  const RoutesManager = getRouteManager(service);

  api.registerCommand('build', {}, () => {
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

        service.applyPlugins('beforeGenerateHTML');

        if (process.env.HTML !== 'none') {
          debug(`Bundle html files`);
          const chunksMap = chunksToMap(stats.compilation.chunks);
          try {
            const hg = new HtmlGenerator(service, {
              chunksMap,
            });
            hg.generate();
          } catch (e) {
            console.log(e);
          }
        }

        service.applyPlugins('buildSuccess');
      },
    });
  });
}
