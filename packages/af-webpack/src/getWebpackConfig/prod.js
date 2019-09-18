import TerserPlugin from 'terser-webpack-plugin';
import UglifyPlugin from 'uglifyjs-webpack-plugin';
import { isPlainObject } from 'lodash';
import terserOptions from './terserOptions';
import uglifyOptions from './uglifyOptions';

function mergeConfig(config, userConfig) {
  if (typeof userConfig === 'function') {
    return userConfig(config);
  } else if (isPlainObject(userConfig)) {
    return {
      ...config,
      ...userConfig,
    };
  } else {
    return config;
  }
}

export default function(webpackConfig, opts) {
  const disableCompress = process.env.COMPRESS === 'none';

  webpackConfig.mode('production').devtool(opts.devtool);

  if (disableCompress && !process.env.__FROM_UMI_TEST) {
    webpackConfig.output.pathinfo(true);
    webpackConfig.optimization.namedModules(true).namedChunks(true);
  }

  if (opts.hash) {
    webpackConfig.output
      .filename(`[name].[contenthash:8].js`)
      .chunkFilename(`[name].[contenthash:8].async.js`);
  }

  webpackConfig.performance.hints(false);

  // server build not generate manifest
  // TODO: better manifest for ssr,
  // {
  //   "common": { "umi.js": "...", "umi.css": "..." }
  //   "pages": { "/about": { "about_index.js": "...", "about_index.css": "..." } }
  // }
  if (opts.manifest && !opts.ssr) {
    webpackConfig.plugin('manifest').use(require('webpack-manifest-plugin'), [
      {
        fileName: 'asset-manifest.json',
        ...opts.manifest,
      },
    ]);
  }

  webpackConfig.optimization
    // don't emit files if have error
    .noEmitOnErrors(true);

  if (disableCompress || process.env.__FROM_UMI_TEST) {
    webpackConfig.optimization.minimize(false);
  } else {
    webpackConfig.plugin('hash-module-ids').use(require('webpack/lib/HashedModuleIdsPlugin'));

    let minimizerName = 'uglifyjs';
    let minimizerPlugin = UglifyPlugin;
    let minimizerOptions = [
      mergeConfig(
        {
          ...uglifyOptions,
          sourceMap: !!opts.devtool,
        },
        opts.uglifyJSOptions,
      ),
    ];

    if (opts.minimizer === 'terserjs') {
      minimizerName = 'terserjs';
      minimizerPlugin = TerserPlugin;
      minimizerOptions = [
        mergeConfig(
          {
            ...terserOptions,
            sourceMap: !!opts.devtool,
          },
          opts.terserJSOptions,
        ),
      ];
    }

    webpackConfig.optimization.minimizer(minimizerName).use(minimizerPlugin, minimizerOptions);
  }
}
