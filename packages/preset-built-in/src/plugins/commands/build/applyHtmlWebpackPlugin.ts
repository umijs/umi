import { existsSync } from 'fs';
import { join } from 'path';
import { IApi, webpack, BundlerConfigType } from '@umijs/types';
import { getHtmlGenerator } from '../htmlUtils';
import { OUTPUT_SERVER_FILENAME } from '../../features/ssr/constants';

export default function (api: IApi) {
  // maybe hack but useful
  function ensureServerFileExisted() {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          existsSync(join(api.paths.absOutputPath!, OUTPUT_SERVER_FILENAME))
        ) {
          clearInterval(interval);
          resolve();
        }
      }, 300);
    });
  }
  class HtmlWebpackPlugin {
    apply(compiler: webpack.Compiler) {
      compiler.hooks.emit.tapPromise(
        'UmiHtmlGeneration',
        async (compilation: any) => {
          if (api.config.ssr) {
            // waiting umi.server.js emited
            await ensureServerFileExisted();
          }
          const html = getHtmlGenerator({ api });
          const routeMap = await api.applyPlugins({
            key: 'modifyExportRouteMap',
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
              key: 'modifyProdHTMLContent',
              type: api.ApplyPluginsType.modify,
              initialValue: defaultContent,
              args: {
                route,
                file,
              },
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
