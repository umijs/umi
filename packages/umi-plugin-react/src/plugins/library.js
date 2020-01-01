import { dirname } from 'path';

export default function(api, options) {
  const { cwd, compatDirname } = api;

  api.chainWebpackConfig(webpackConfig => {
    if (options === 'preact') {
      webpackConfig.resolve.alias
        .set('preact/debug', require.resolve('preact/debug'))
        .set(
          'preact',
          compatDirname(
            'preact/package.json',
            cwd,
            dirname(require.resolve('preact/package.json')),
          ),
        )
        .set(
          'react',
          compatDirname(
            'preact/compat/package.json',
            cwd,
            dirname(require.resolve('preact/compat/package.json')),
          ),
        )
        .set(
          'react-dom/test-utils',
          compatDirname(
            'preact/test-utils/package.json',
            cwd,
            dirname(require.resolve('preact/test-utils/package.json')),
          ),
        )
        .set(
          'react-dom',
          compatDirname(
            'preact/compat/package.json',
            cwd,
            dirname(require.resolve('preact/compat/package.json')),
          ),
        )
        .set('react-addons-css-transition-group', 'preact-css-transition-group');
    }
  });

  api.addEntryImport(() => {
    if (process.env.NODE_ENV === 'development' && options === 'preact') {
      return {
        source: 'preact/debug',
      };
    } else {
      return [];
    }
  });
}
