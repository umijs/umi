import buildDll from './buildDll';

export default function(api, opts = {}) {
  // api.registerCommand('generateDll', () => {
  // });

  api.register('beforeDevAsync', () => {
    return new Promise(resolve => {
      buildDll({
        webpack: api.utils._webpack,
        afWebpackGetConfig: api.utils._afWebpackGetConfig,
        afWebpackBuild: api.utils._afWebpackBuild,
        service: api.service,
        ...opts,
      })
        .then(() => {
          console.log('build dll done');
          process.exit(1);
          resolve();
        })
        .catch(e => {
          console.log('error', e);
        });
    });
  });
}
