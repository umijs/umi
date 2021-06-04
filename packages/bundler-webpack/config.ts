export default {
  outputPath: './bundled/js/',
  entry: {
    webpackHotDevClient: './src/webpackHotDevClient/webpackHotDevClient',
  },
  nodeModulesTransform: {
    type: 'all',
  },
  devtool: false,
  define: {
    'process.env': {},
  },
  targets: {
    ie: 11,
  },
};
