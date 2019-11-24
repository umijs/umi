import { dirname, join } from 'path';

function importPlugin(key, options) {
  return [
    require.resolve('babel-plugin-import'),
    {
      libraryName: key,
      libraryDirectory: process.env.ANTD_IMPORT_DIRECTORY || options.importDirectory || 'es',
      style: true,
    },
    key,
  ];
}

export default function(api, options = {}) {
  const { cwd, compatDirname } = api;

  const antdDir = compatDirname(
    'antd/package.json',
    cwd,
    dirname(require.resolve('antd/package.json')),
  );
  // eslint-disable-next-line import/no-dynamic-require
  const antdVersion = require(join(antdDir, 'package.json')).version;
  api.addVersionInfo([`antd@${antdVersion} (${antdDir})`]);

  api.modifyAFWebpackOpts((memo, opts = {}) => {
    // antd ssr not enabled
    if (!opts.ssr) {
      memo.babel.plugins = [
        ...(memo.babel.plugins || []),
        importPlugin('antd', options),
        importPlugin('antd-mobile', options),
        [
          require.resolve('babel-plugin-import'),
          {
            libraryName: 'ant-design-pro',
            libraryDirectory: 'lib',
            style: true,
            camel2DashComponentName: false,
          },
          'ant-design-pro',
        ],
      ];
    }
    return memo;
  });

  api.chainWebpackConfig(webpackConfig => {
    webpackConfig.resolve.alias
      .set(
        'antd',
        compatDirname('antd/package.json', cwd, dirname(require.resolve('antd/package.json'))),
      )
      .set(
        'antd-mobile',
        compatDirname(
          'antd-mobile/package.json',
          cwd,
          dirname(require.resolve('antd-mobile/package.json')),
        ),
      );
  });
}
