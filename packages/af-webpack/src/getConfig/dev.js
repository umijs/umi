export default function(webpackConfig, opts) {
  webpackConfig
    .devtool(opts.devtool || 'cheap-module-eval-source-map')
    .output.pathinfo(true);

  webpackConfig
    .plugin('hmr')
    .use(require('webpack/lib/HotModuleReplacementPlugin'));

  webpackConfig
    .plugin('system-bell')
    .use(require('system-bell-webpack-plugin'));

  if (process.env.HARD_SOURCE) {
    webpackConfig
      .plugin('hard-source')
      .use(require('hard-source-webpack-plugin'));
  }
}
