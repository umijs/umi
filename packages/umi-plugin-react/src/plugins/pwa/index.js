import { join } from 'path';
import assert from 'assert';
import chalk from 'chalk';
import workboxWebpackPlugin from 'workbox-webpack-plugin';
import WebManifestPlugin from './WebManifestPlugin';
import generateWebManifest from './generateWebManifest';

export default function(api, options) {
  const {
    pkg,
    relativeToTmp,
    config: { publicPath },
  } = api;
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
    const workboxConfig = {
      exclude: [/\.map$/, /favicon\.ico$/, /manifest\.(json|webmanifest)$/],
      ...defaultGenerateSWOptions,
      ...(options.workboxOptions || {}),
    };

    api.chainWebpackConfig(webpackConfig => {
      webpackConfig
        .plugin('workbox')
        .use(workboxWebpackPlugin[mode], [workboxConfig]);
      webpackConfig.resolve.alias.set(
        'register-service-worker',
        require.resolve('register-service-worker'),
      );
    });
  }

  const { srcPath, outputPath } = generateWebManifest(api, {
    ...options.manifestOptions,
  });

  api.chainWebpackConfig(webpackConfig => {
    webpackConfig.plugin('webmanifest').use(WebManifestPlugin, [
      {
        publicPath,
        srcPath,
        outputPath,
        pkgName: pkg.name,
      },
    ]);
  });
}
