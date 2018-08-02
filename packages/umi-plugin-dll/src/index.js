import { join } from 'path';
import serveStatic from 'serve-static';
import webpack from 'af-webpack/webpack';
import buildDll from './buildDll';

export default function(api, opts = {}) {
  if (process.env.NODE_ENV !== 'development') return;

  const { paths } = api.service;

  const dllDir = join(paths.absNodeModulesPath, 'umi-dlls');
  const dllManifest = join(dllDir, 'umi.json');

  api._beforeDevServerAsync(() => {
    return new Promise(resolve => {
      const originHardSource = process.env.HARD_SOURCE;
      process.env.HARD_SOURCE = 'none';
      buildDll({
        service: api.service,
        dllDir,
        ...opts,
      })
        .then(() => {
          process.env.HARD_SOURCE = originHardSource;
          resolve();
        })
        .catch(e => {
          console.log('[umi-plugin-dll] error', e);
        });
    });
  });

  api.addMiddlewareAhead(() => {
    return serveStatic(dllDir);
  });

  api.chainWebpackConfig(webpackConfig => {
    webpackConfig.plugin('dll-reference').use(webpack.DllReferencePlugin, [
      {
        context: paths.absSrcPath,
        manifest: dllManifest,
      },
    ]);
  });

  api.addHTMLHeadScript({
    src: '/umi.dll.js',
  });
}
