import { join } from 'path';
import assert from 'assert';
import chalk from 'chalk';
import workboxWebpackPlugin from 'workbox-webpack-plugin';

export default function(api, options) {
  const { pkg, relativeToTmp } = api;
  assert(
    pkg && pkg.name,
    `You must have ${chalk.underline.cyan(
      'package.json',
    )} and configure ${chalk.underline.cyan('name')} in it when enable pwa.`,
  );

  if (process.env.NODE_ENV === 'production') {
    api.addEntryCode(
      `
require('${relativeToTmp(join(__dirname, './registerServiceWorker.js'))}');
    `.trim(),
    );

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

    api.chainWebpackConfig(webpackConfig => {
      webpackConfig.plugin('workbox').use(workboxWebpackPlugin[mode], [config]);
      webpackConfig.resolve.alias.set(
        'register-service-worker',
        require.resolve('register-service-worker'),
      );
    });
  }

  // TODO: 更新 html 文件
}
