import babelJest from 'babel-jest';

export default babelJest.createTransformer({
  presets: [
    [
      require.resolve('babel-preset-umi'),
      {
        commonjs: true,
      },
    ],
  ],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        alias: {
          'ts-jest': require.resolve('ts-jest'),
        },
      },
    ],
  ],
});
