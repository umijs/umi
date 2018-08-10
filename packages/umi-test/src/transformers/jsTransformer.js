import babelJest from 'babel-jest';

export default babelJest.createTransformer({
  presets: [
    [
      require.resolve('babel-preset-umi'),
      {
        transformRuntime: false,
      },
    ],
  ],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        alias: {
          'ts-jest-babel-7': require.resolve('ts-jest-babel-7'),
          react: require.resolve('react'),
          'react-dom': require.resolve('react-dom'),
          enzyme: require.resolve('enzyme'),
        },
      },
      'module-resolver-in-umi-test',
    ],
  ],
});
