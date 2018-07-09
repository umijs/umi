import compatDirname from '../utils/compatDirname';

export default function(api) {
  const {
    config: { react = {} },
  } = api.service;
  const { cwd } = api.service;

  api.register('chainWebpackConfig', ({ args: { webpackConfig } }) => {
    if (react.library === 'preact') {
      webpackConfig.resolve.alias
        .set('react', compatDirname('preact-compat/package.json'), cwd)
        .set('react-dom', compatDirname('preact-compat/package.json'), cwd)
        .set(
          'create-react-class',
          compatDirname('preact-compat/lib/create-react-class'),
          cwd,
        );
    }
  });
}
