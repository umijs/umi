import { dirname, join } from 'path';

function importPlugin(key, options) {
  return [
    require.resolve('babel-plugin-component'),
    {
      libraryName: key,
      styleLibraryName: 'theme-chalk',
      ...options,
    },
  ];
}

export default function(api, options = { importByNeed: true }) {
  const { cwd, compatDirname } = api;

  const elementDir = compatDirname(
    'element-ui/package.json',
    cwd,
    dirname(require.resolve('element-ui/package.json')),
  );
  // eslint-disable-next-line import/no-dynamic-require
  const elementVersion = require(join(elementDir, 'package.json')).version;
  api.addVersionInfo([`element-ui@${elementVersion} (${elementDir})`]);

  const { importByNeed, ...babelPluginComponentOptions } = options;

  if (importByNeed) {
    api.modifyAFWebpackOpts((memo, opts = {}) => {
      // element ssr not enabled
      if (!opts.ssr) {
        memo.babel.plugins = [
          ...(memo.babel.plugins || []),
          importPlugin('element-ui', babelPluginComponentOptions),
        ];
      }
      return memo;
    });
  }

  api.chainWebpackConfig(webpackConfig => {
    webpackConfig.resolve.alias.set(
      'element-ui',
      compatDirname(
        'element-ui/package.json',
        cwd,
        dirname(require.resolve('element-ui/package.json')),
      ),
    );
  });
}
