import compatDirname from '../utils/compatDirname';

function importPlugin(key) {
  return [
    require.resolve('babel-plugin-import'),
    {
      libraryName: key,
      libraryDirectory: 'es',
      style: true,
    },
    key,
  ];
}

export default function(api) {
  const { cwd } = api.service;

  api.register('modifyAFWebpackOpts', ({ memo }) => {
    memo.babel.plugins = [
      ...(memo.babel.plugins || []),
      importPlugin('antd'),
      importPlugin('antd-mobile'),
    ];
    return memo;
  });

  api.register('chainWebpackConfig', ({ args: { webpackConfig } }) => {
    webpackConfig.resolve.alias
      .set('antd', compatDirname('antd/package.json', cwd))
      .set('antd-mobile', compatDirname('antd-mobile/package.json', cwd));
  });
}
