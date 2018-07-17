import { winPath } from 'umi-utils';
import { join } from 'path';
import assert from 'assert';
import workboxWebpackPlugin from 'workbox-webpack-plugin';

export default function(api, options) {
  const { pkg } = api.service;
  assert(
    pkg && pkg.name,
    'You need to have package.json and the name in it when using pwa.',
  );

  if (process.env.NODE_ENV === 'production') {
    api.register('modifyEntryFile', ({ memo }) => {
      return `
${memo}
require('${winPath(join(__dirname, './registerServiceWorker.js'))}');
      `.trim();
    });

    const mode = options.workboxPluginMode || 'GenerateSW';
    const defaultGenerateSWOptions =
      mode === 'GenerateSW'
        ? {
            cacheId: pkg.name,
          }
        : {};
    const config = {
      exclude: [/\.map$/, /favicon\.ico$/, /manifest\.json$/],
      ...defaultGenerateSWOptions,
      ...(options.workboxOptions || {}),
    };

    api.chainWebpack(webpackConfig => {
      webpackConfig.plugin('workbox').use(workboxWebpackPlugin[mode], [config]);

      webpackConfig.resolve.alias.set(
        'register-service-worker',
        require.resolve('register-service-worker'),
      );
    });
  }

  // TODO: 更新 html 文件
}
