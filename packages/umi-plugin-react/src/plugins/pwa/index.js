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
    paths: { absSrcPath },
  } = api;
  assert(
    pkg && pkg.name,
    `You must have ${chalk.underline.cyan(
      'package.json',
    )} and configure ${chalk.underline.cyan('name')} in it when enable pwa.`,
  );

  // generate webmanifest before workbox generation, so that webmanifest can be added to precached list
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
            skipWaiting: true,
            clientsClaim: true,
          }
        : {
            swSrc: join(absSrcPath, 'service-worker.js'),
          };
    const workboxConfig = {
      // remove manifest.json from exclude list. https://github.com/GoogleChrome/workbox/issues/1665
      exclude: [/\.map$/, /favicon\.ico$/, /^manifest.*\.js?$/],
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
}
