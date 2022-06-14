const path = require('path');
const webpack = require('webpack');
const { MFSU } = require('@umijs/mfsu');

// [mfsu] 1. init instance
const mfsu = new MFSU({
  implementor: webpack,
  buildDepWithESBuild: true,
});

const config = {
  entry: path.join(__dirname, './src'),
  mode: 'development',
  output: {
    path: path.join(__dirname, './dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  devServer: {
    // [mfsu] 2. add mfsu middleware
    setupMiddlewares(middlewares, devServer) {
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
    new (require('html-webpack-plugin'))({
      template: path.resolve(__dirname, './index.html'),
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
