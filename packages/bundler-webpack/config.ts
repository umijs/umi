export default {
  outputPath: './bundled/',
  entry: {
    webpackHotDevClient: './src/webpackHotDevClient/webpackHotDevClient',
  },
  nodeModulesTransform: {
    type: 'none',
  },
  devtool: false,
  define: {
    'process.env': {},
  },
};
