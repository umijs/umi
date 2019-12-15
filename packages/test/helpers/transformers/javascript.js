const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: [require.resolve('@umijs/babel-preset-umi/test')],
  babelrc: false,
  configFile: false,
});
