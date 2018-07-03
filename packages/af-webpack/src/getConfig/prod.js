import UglifyPlugin from 'uglifyjs-webpack-plugin';
import uglifyOptions from './uglifyOptions';

export default function(webpackConfig, opts) {
  const disableCompress = process.env.COMPRESS === 'none';

  webpackConfig
    .mode('production')
    .bail(true)
    .devtool(opts.devtool);

  if (disableCompress && !process.env.__FROM_UMI_TEST) {
    webpackConfig.output.pathinfo(true);
    webpackConfig.optimization.namedModules(true).namedChunks(true);
  }

  if (opts.hash) {
    webpackConfig.output
      .filename(`[name].[chunkhash:8].js`)
      .chunkFilename(`[name].[chunkhash:8].async.js`);
  }

  if (opts.manifest) {
    webpackConfig.plugin('manifest').use(require('webpack-manifest-plugin'), [
      {
        fileName: 'assets.json',
        ...opts.manifest,
      },
    ]);
  }

  // don't emit files if have error
  webpackConfig.optimization.noEmitOnErrors(true);

  if (process.env.__FROM_UMI_TEST) {
    webpackConfig.optimization.minimize(false);
  } else {
    webpackConfig
      .plugin('hash-module-ids')
      .use(require('webpack/lib/HashedModuleIdsPlugin'));

    if (!disableCompress) {
      webpackConfig.optimization.minimizer([
        new UglifyPlugin({
          ...uglifyOptions,
          sourceMap: !!opts.devtool,
        }),
      ]);
    }
  }
}
