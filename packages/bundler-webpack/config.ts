export default {
  entry: {
    webpackHotDevClient: './src/webpackHotDevClient/webpackHotDevClient',
  },
  // externals: {
  //   react: 'commonjs2 react',
  //   'react-dom': 'commonjs2 react-dom',
  // },
  nodeModulesTransform: {
    type: 'none',
  },
};
