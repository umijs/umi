import eslintFormatter from 'react-dev-utils/eslintFormatter';

export default function(webpackConfig, opts) {
  const eslintOptions = {
    formatter: eslintFormatter,
    baseConfig: {
      extends: [require.resolve('eslint-config-umi')],
    },
    ignore: false,
    eslintPath: require.resolve('eslint'),
    useEslintrc: false,
  };

  webpackConfig.module
    .rule('eslint')
    .test(/\.(js|jsx)$/)
    .include.add(opts.cwd)
    .end()
    .exclude.add(/node_modules/)
    .end()
    .enforce('pre')
    .use('eslint-loader')
    .loader(require.resolve('eslint-loader'))
    .options(eslintOptions);
}
