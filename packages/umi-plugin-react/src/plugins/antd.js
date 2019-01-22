import { dirname } from 'path';

function importPlugin(key, options) {
  return [
    require.resolve('babel-plugin-import'),
    {
      libraryName: key,
      libraryDirectory:
        process.env.ANTD_IMPORT_DIRECTORY || options.importDirectory || 'es',
      style: true,
    },
    key,
  ];
}

export default function(api, options = {}) {
  const { cwd, compatDirname } = api;

  api.modifyAFWebpackOpts(opts => {
    opts.babel.plugins = [
      ...(opts.babel.plugins || []),
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
    return opts;
  });

  api.chainWebpackConfig(webpackConfig => {
    webpackConfig.resolve.alias
      .set(
        'antd',
        compatDirname(
          'antd/package.json',
          cwd,
          dirname(require.resolve('antd/package.json')),
        ),
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
