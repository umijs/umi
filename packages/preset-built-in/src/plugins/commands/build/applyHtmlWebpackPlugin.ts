import { IApi, webpack } from '@umijs/types';
import { getHtmlGenerator } from '../htmlUtils';

export default function (api: IApi) {
  class HtmlWebpackPlugin {
    private type: string;
    constructor({ type }: { type: string }) {
      this.type = type;
    }
    apply(compiler: webpack.Compiler) {
      compiler.hooks.emit.tapPromise(
        'UmiHtmlGeneration',
        async (compilation: any) => {
          const html = getHtmlGenerator({ api, type: this.type });
          const routeMap = await api.applyPlugins({
            key: 'modifyRouteMap',
            type: api.ApplyPluginsType.modify,
            initialValue: [{ route: { path: '/' }, file: 'index.html' }],
            args: {
              html,
            },
          });
          for (const { route, file } of routeMap) {
            const defaultContent = await html.getContent({
              route,
              chunks: compilation.chunks,
            });
            const content = await api.applyPlugins({
              key: 'modifyBuildContent',
              type: api.ApplyPluginsType.modify,
              initialValue: defaultContent,
              args: {
                route,
                file,
              }
            })
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
      type === 'csr'
    ) {
      bundleConfig.plugins?.unshift(new HtmlWebpackPlugin({ type }));
    }
    return bundleConfig;
  });
}
