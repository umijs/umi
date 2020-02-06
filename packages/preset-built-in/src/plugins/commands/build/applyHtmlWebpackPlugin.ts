import { IApi, webpack } from '@umijs/types';
import { getHtmlGenerator, chunksToFiles } from '../buildDevUtils';

export default function(api: IApi) {
  class HtmlWebpackPlugin {
    apply(compiler: webpack.Compiler) {
      const key = 'UmiHtmlGeneration';
      compiler.hooks.compilation.tap(key, compilation => {
        compilation.hooks.moduleAsset.tap(key, (module, file) => {
          // console.log(module, file);
        });
      });
      compiler.hooks.emit.tap(key, async compilation => {
        const { jsFiles, cssFiles } = chunksToFiles(compilation.chunks);
        const html = getHtmlGenerator({ api });
        const content = await html.getContent({
          route: { path: '/' },
          cssFiles,
          jsFiles,
        });
        compilation.assets['index.html'] = {
          source: () => content,
          size: () => content.length,
        };
      });
    }
  }

  api.modifyBundleConfig((bundleConfig, { env, bundler: { id } }) => {
    if (env === 'production' && id === 'webpack') {
      bundleConfig.plugins?.unshift(new HtmlWebpackPlugin());
    }
    return bundleConfig;
  });
}
