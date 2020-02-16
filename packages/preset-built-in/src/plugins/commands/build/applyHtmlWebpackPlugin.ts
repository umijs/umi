import { IApi, webpack, IRoute } from '@umijs/types';
import { getRoutePaths, getHtmlGenerator, chunksToFiles } from '../htmlUtils';

export default function(api: IApi) {
  class HtmlWebpackPlugin {
    apply(compiler: webpack.Compiler) {
      const key = 'UmiHtmlGeneration';
      compiler.hooks.emit.tap(key, async compilation => {
        const { jsFiles, cssFiles } = chunksToFiles(compilation.chunks);
        const html = getHtmlGenerator({ api });

        const routeMap = api.config.exportStatic
          ? await html.getRouteMap()
          : [{ path: '/', file: 'index.html' }];
        for (const { path, file } of routeMap) {
          const content = await html.getContent({
            route: { path },
            cssFiles,
            jsFiles,
          });
          compilation.assets[file] = {
            source: () => content,
            size: () => content.length,
          };
        }
      });
    }
  }

  api.modifyBundleConfig((bundleConfig, { env, bundler: { id } }) => {
    if (
      env === 'production' &&
      id === 'webpack' &&
      process.env.HTML !== 'none'
    ) {
      bundleConfig.plugins?.unshift(new HtmlWebpackPlugin());
    }
    return bundleConfig;
  });
}
