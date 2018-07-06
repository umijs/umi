import { join } from 'path';
import serveStatic from 'serve-static';
import buildDll from './buildDll';

export default function(api, opts = {}) {
  if (process.env.NODE_ENV !== 'development') return;

  const {
    _webpack: webpack,
    _afWebpackGetConfig: afWebpackGetConfig,
    _afWebpackBuild: afWebpackBuild,
    _webpackHotDevClientPath: webpackHotDevClientPath,
  } = api.utils;
  const { paths } = api.service;

  const dllDir = join(paths.absNodeModulesPath, 'umi-dlls');
  const dllManifest = join(dllDir, 'umi.json');

  api.register('beforeDevAsync', () => {
    return new Promise(resolve => {
      process.env.HARD_SOURCE = 'none';
      buildDll({
        webpack,
        afWebpackGetConfig,
        afWebpackBuild,
        webpackHotDevClientPath,
        service: api.service,
        dllDir,
        ...opts,
      })
        .then(() => {
          process.env.HARD_SOURCE = '';
          resolve();
        })
        .catch(e => {
          console.log('[umi-plugin-dll] error', e);
        });
    });
  });

  api.register('modifyMiddlewares', ({ memo }) => {
    return [serveStatic(dllDir), ...memo];
  });

  api.register('modifyWebpackConfig', ({ memo }) => {
    memo.plugins.push(
      new webpack.DllReferencePlugin({
        context: paths.absSrcPath,
        manifest: dllManifest,
      }),
    );
    return memo;
  });

  api.register('modifyHTML', ({ memo }) => {
    memo = memo.replace(
      '</head>',
      `
<script src="/umi.dll.js"></script>
</head>
    `.trim(),
    );
    return memo;
  });
}
