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

          const routeMap = api.config.exportStatic
            ? await html.getRouteMap()
            : [{ route: { path: '/' }, file: 'index.html' }];
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
      process.env.HTML !== 'none'
    ) {
      bundleConfig.plugins?.unshift(new HtmlWebpackPlugin({ type }));
    }
    return bundleConfig;
  });
}
