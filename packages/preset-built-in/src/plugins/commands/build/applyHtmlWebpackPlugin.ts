import { existsSync } from 'fs';
import { join } from 'path';
import { IApi, webpack, BundlerConfigType } from '@umijs/types';
import { getHtmlGenerator } from '../htmlUtils';
import { OUTPUT_SERVER_FILENAME } from '../../features/ssr/constants';

export function fixRoutePathInWindows(path?: string) {
  // window 下 : 不是一个合法路径，所以需要处理一下
  // 不直接删除是为了保证 render 可以生效
  if (!path || !path?.includes(':')) {
    return path;
  }
  return path.replace(/:/g, '.');
}

export default function (api: IApi) {
  // maybe hack but useful
  function ensureServerFileExisted() {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (
          existsSync(join(api.paths.absOutputPath!, OUTPUT_SERVER_FILENAME))
        ) {
          clearInterval(interval);
          resolve({});
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
              assets: compilation.assets,
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

            compilation.assets[fixRoutePathInWindows(file)!] = {
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
    const enableWriteToDisk =
      api.config.devServer && api.config.devServer.writeToDisk;
    if (
      (env === 'production' || enableWriteToDisk) &&
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
