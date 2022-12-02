const path = require('path');
const webpack = require('webpack');
const htmlWebpackPlugin = require('html-webpack-plugin');
const { MFSU } = require('@umijs/mfsu');

// [mfsu] 1. init instance
const mfsu = new MFSU({
  implementor: webpack,
  buildDepWithESBuild: true,
});

const config = {
  entry: {
    index: path.join(__dirname, './src'),
    pageTwo: './src',
    pageThree: path.join(__dirname, './src/index.tsx'),
  },
  mode: 'development',
  output: {
    path: path.join(__dirname, './dist'),
    filename: '[name].js',
  },
  devServer: {
    // [mfsu] 2. add mfsu middleware
    setupMiddlewares(middlewares, devServer) {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined');
      }

      devServer.app.head('/api', (_, response) => {
        response.send('notice api');
      });

      middlewares.unshift(...mfsu.getMiddlewares());
      return middlewares;
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
            plugins: [
              // [mfsu] 3. add mfsu babel plugins
              ...mfsu.getBabelPlugins(),
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      filename: 'index.html',
      template: path.resolve(__dirname, './index.html'),
      inject: true,
      chunks: ['index']
    }),
    new htmlWebpackPlugin({
      filename: 'pageTwo.html',
      template: path.resolve(__dirname, './index.html'),
      chunks: ['pageTwo']
    }),
    new htmlWebpackPlugin({
      filename: 'pageThree.html',
      template: path.resolve(__dirname, './index.html'),
      chunks: ['pageThree']
    }),
  ],
  stats: {
    assets: false,
    moduleAssets: false,
    runtime: false,
    runtimeModules: false,
    modules: false,
    entrypoints: false,
  },
};

const depConfig = {
  output: {},
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript',
            ],
          },
        },
      },
    ],
  },
  plugins: [],
};
// [mfsu] 4. inject mfsu webpack config
const getConfig = async () => {
  await mfsu.setWebpackConfig({ config, depConfig });
  return config;
};

module.exports = getConfig();
