import nodeExternals from 'webpack-node-externals';

export default function(webpackConfig) {
  // for node server-side render config
  const isDev = process.env.NODE_ENV === 'development';
  webpackConfig.mode = process.env.NODE_ENV;
  webpackConfig.devtool = isDev ? 'eval-source-map' : '';
  webpackConfig.target = 'node';
  webpackConfig.externals = nodeExternals({
    whilelist: /\.(css|less|sass|scss)$/,
  });
  webpackConfig.output.libraryTarget = 'commonjs2';
  webpackConfig.plugins.map(item => {
    if (item.definitions) {
      // 定义server端标示
      item.definitions.__isBrowser__ = false;
    }
  });
  webpackConfig.output.filename = '[name].server.js';
  webpackConfig.output.chunkFilename = '[name].server.chunk.js';
  if (isDev) {
    // 开发环境Server端移除webpackHotDevClient
    let webpackHotDevClientIndex;
    if (Array.isArray(webpackConfig.entry.umi)) {
      webpackConfig.entry.umi.map((item, index) => {
        if (item.match('webpackHotDevClient')) {
          webpackHotDevClientIndex = index;
        }
      });
    }
    webpackConfig.entry.umi.splice(webpackHotDevClientIndex, 1);
  }
  return webpackConfig;
}
