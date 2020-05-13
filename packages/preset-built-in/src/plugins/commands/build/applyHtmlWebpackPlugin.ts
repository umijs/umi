import { IApi, webpack, BundlerConfigType } from '@umijs/types';
import { getHtmlGenerator } from '../htmlUtils';

export default function (api: IApi) {
  class HtmlWebpackPlugin {
    apply(compiler: webpack.Compiler) {
      compiler.hooks.emit.tapPromise(
        'UmiHtmlGeneration',
        async (compilation: any) => {
          const html = getHtmlGenerator({ api });
          const routeMap = await api.applyPlugins({
            key: 'modifyRouteMap',
            type: api.ApplyPluginsType.modify,
            initialValue: [{ route: { path: '/' }, file: 'index.html' }],
            args: {
              html,
            },
          });
          for (const { route, file } of routeMap) {
            const content = await html.getContent({
              route,
              chunks: compilation.chunks,
            });
            compilation.assets[file] = {
              source: () => content,
              size: () => content.length,
            };
          }
          return true;
        },
      );
    }
  }

  api.modifyBundleConfig((bundleConfig, { env, type, bundler: { id } }) => {
    if (
      env === 'production' &&
      id === 'webpack' &&
      process.env.HTML !== 'none' &&
      // avoid ssr bundler build override index.html
      type === BundlerConfigType.csr
    ) {
      bundleConfig.plugins?.unshift(new HtmlWebpackPlugin());
    }
    return bundleConfig;
  });
}
