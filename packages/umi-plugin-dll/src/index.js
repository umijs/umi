import { join } from 'path';
import { readFileSync, existsSync } from 'fs';
import buildDll from './buildDll';

export default function(api, opts = {}) {
  // TODO: generateDll command
  // api.registerCommand('generateDll', () => {
  // });

  if (process.env.NODE_ENV !== 'development') return;

  const {
    _webpack: webpack,
    _afWebpackGetConfig: afWebpackGetConfig,
    _afWebpackBuild: afWebpackBuild,
    _webpackHotDevClientPath: webpackHotDevClientPath,
  } = api.utils;
  const { paths } = api.service;

  const dllDir = join(paths.absNodeModulesPath, 'umi-dlls');
  const dllFile = join(dllDir, 'umi.dll.js');
  const dllManifest = join(dllDir, 'umi.json');

  api.register('beforeDevAsync', () => {
    return new Promise(resolve => {
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
          resolve();
        })
        .catch(e => {
          console.log('error', e);
        });
    });
  });

  api.register('modifyMiddlewares', ({ memo }) => {
    memo.push((req, res, next) => {
      if (req.path === '/__umi.dll.js') {
        const content = existsSync(dllFile)
          ? readFileSync(dllFile, 'utf-8')
          : `console.error('File pages/.umi/dll/umi.dll.js not found, please reload after it\'s ready.');`;
        res.end(content);
      } else {
        next();
      }
    });
    return memo;
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
<script src="/__umi.dll.js"></script>
</head>
    `.trim(),
    );
    return memo;
  });
}
