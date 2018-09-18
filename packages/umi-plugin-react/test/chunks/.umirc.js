export default {
  plugins: [
    [
      '../../lib',
      {
        dynamicImport: {
          webpackChunkName: true,
        },
        chunks: ['vendors', 'umi'],
      },
    ],
  ],
  chainWebpack(config) {
    config.optimization.splitChunks({
      cacheGroups: {
        vendors: {
          name: 'vendors',
          chunks: 'all',
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom)[\\/]/,
        },
        commons: {
          name: 'commons',
          chunks: 'async',
          minChunks: 2,
          minSize: 0,
        },
      },
    });
  },
};
