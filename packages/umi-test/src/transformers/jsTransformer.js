import babelJest from 'babel-jest';
import { dirname } from 'path';

export default babelJest.createTransformer({
  presets: [
    [
      require.resolve('babel-preset-umi'),
      {
        commonjs: true,
        disableTransform: true,
      },
    ],
  ],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        alias: {
          'ts-jest': require.resolve('ts-jest'),
          react: require.resolve('react'),
          'react-dom': require.resolve('react-dom'),
          enzyme: require.resolve('enzyme'),
          // '@babel/runtime': dirname(require.resolve('@babel/runtime/package')),
        },
      },
    ],
  ],
});
