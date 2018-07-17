import { compatDirname } from 'umi-utils';

export default function(api, options) {
  const { cwd } = api.service;
  api.register('chainWebpackConfig', ({ args: { webpackConfig } }) => {
    if (options === 'preact') {
      webpackConfig.resolve.alias
        .set('react', compatDirname('preact-compat/package.json'), cwd)
        .set('react-dom', compatDirname('preact-compat/package.json'), cwd)
        .set(
          'create-react-class',
          compatDirname('preact-compat/lib/create-react-class', cwd),
        );
    }
  });
}
