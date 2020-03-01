const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: [require.resolve('@umijs/babel-preset-umi/node')],
  babelrc: false,
  configFile: false,
});
