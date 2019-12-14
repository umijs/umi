const babelJest = require('babel-jest');

module.exports = babelJest.createTransformer({
  presets: [
    [
      require.resolve('@umijs/babel-preset-umi'),
      {
        typescript: true,
        react: true,
        env: {
          targets: {
            node: 'current',
          },
          modules: 'commonjs',
        },
      },
    ],
  ],
  babelrc: false,
  configFile: false,
});
