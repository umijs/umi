
export default {
  externals: {
    react: 'window.React',
    'react-dom': 'window.ReactDOM',
    'react-router': 'window.ReactRouter',
    'react-router-dom': 'window.ReactRouterDOM',
    'react-router-config': 'window.ReactRouterConfig',
    'assert': 'window.assert',
  },
  chainWebpack(webpackConfig, { webpack }) {
    webpackConfig
      .plugin('ignore-core-js')
      .use(
        webpack.IgnorePlugin,
        [
          /core-js|regenerator-runtime|react-loadable|umi-history/,
        ],
      );
  },
  exportStatic: true,
}
