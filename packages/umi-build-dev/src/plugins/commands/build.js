import rimraf from 'rimraf';
import getRouteConfig from '../../routes/getRouteConfig';
import FilesGenerator from '../../FilesGenerator';
import getWebpackConfig from '../../getWebpackConfig';
import chunksToMap from '../../utils/chunksToMap';
import HtmlGenerator from '../../html/HtmlGenerator';

export default function(api) {
  const {
    service,
    utils: { debug },
  } = api;
  const { cwd, paths, config } = service;

  const RoutesManager = {
    routes: null,
    fetchRoutes() {
      this.routes = service.applyPlugins('modifyRoutes', {
        initialValue: getRouteConfig(paths, config),
      });
    },
  };

  api.registerCommand('build', {}, () => {
    process.env.NODE_ENV = 'production';
    service.applyPlugins('onStart');

    const filesGenerator = new FilesGenerator(service, RoutesManager);
    filesGenerator.generate();

    const webpackConfig = getWebpackConfig(service);
    service.webpackConfig = webpackConfig;
    require('af-webpack/build').default({
      cwd,
      webpackConfig,
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
