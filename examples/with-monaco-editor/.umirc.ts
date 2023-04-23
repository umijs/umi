const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');

export default {
  chainWebpack(memo) {
    memo.plugin('hello').use(MonacoWebpackPlugin);
  },
};
