const path = require('path')
const webpack = require('webpack');
const { MFSU, esbuildLoader } = require('@umijs/mfsu');
const esbuild = require('esbuild')

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
    publicPath: '/'
  },
  devServer: {
    // [mfsu] 2. add mfsu middleware
    setupMiddlewares(middlewares, devServer) {
      middlewares.unshift(
        ...mfsu.getMiddlewares()
      )
      return middlewares
    },
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx']
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: esbuildLoader,
          options: {
            handler: [
              // [mfsu] 3. add mfsu esbuild loader handlers
              ...mfsu.getEsbuildLoaderHandler()
            ],
            target: 'esnext',
            implementation: esbuild
          }
        }
      }
    ]
  },
  plugins: [
    new (require('html-webpack-plugin'))({
      template: path.resolve(__dirname, './index.html')
    })
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

// [mfsu] 4. inject mfsu webpack config
const getConfig = async () => {
  await mfsu.setWebpackConfig({
    config,
  });
  return config
}

module.exports = getConfig();
