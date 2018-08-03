import { join } from 'path';
import pullAll from 'lodash.pullall';
import uniq from 'lodash.uniq';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import webpack from 'af-webpack/webpack';
import { webpackHotDevClientPath } from 'af-webpack/react-dev-utils';

export default function(opts = {}) {
  const {
    dllDir,
    service,
    service: { paths },
    include,
    exclude,
  } = opts;

  const pkgFile = join(paths.cwd, 'package.json');
  const pkg = existsSync(pkgFile) ? require(pkgFile) : {}; // eslint-disable-line
  const depNames = pullAll(
    uniq(Object.keys(pkg.dependencies || {}).concat(include || [])),
    exclude,
  );
  const files = uniq([
    ...depNames,
    webpackHotDevClientPath,
    'umi/link',
    'umi/dynamic',
    'umi/navlink',
    'umi/redirect',
    'umi/router',
    'umi/withRouter',
    'umi/_renderRoutes',
    'umi/_createHistory',
    'react',
    'react-dom',
    'react-router-dom',
  ]).sort((a, b) => (a > b ? 1 : -1));

  const filesInfoFile = join(dllDir, 'filesInfo.json');

  if (existsSync(filesInfoFile)) {
    if (
      JSON.parse(readFileSync(filesInfoFile, 'utf-8')).join(', ') ===
      files.join(', ')
    ) {
      console.log(
        `[umi-plugin-dll] File list is equal, don't generate the dll file.`,
      );
      return Promise.resolve();
    }
  }

  const afWebpackOpts = service.applyPlugins('modifyAFWebpackOpts', {
    initialValue: {
      cwd: paths.cwd,
      disableBabelTransform: true,
      alias: {},
      babel: {},
    },
  });
  const afWebpackConfig = require('af-webpack/getConfig').default(
    afWebpackOpts,
  );
  const webpackConfig = {
    ...afWebpackConfig,
    entry: {
      umi: files,
    },
    output: {
      path: dllDir,
      filename: '[name].dll.js',
      library: '[name]',
    },
    plugins: [
      ...afWebpackConfig.plugins,
      ...service.webpackConfig.plugins.filter(plugin => {
        return plugin instanceof webpack.DefinePlugin;
      }),
      new webpack.DllPlugin({
        path: join(dllDir, '[name].json'),
        name: '[name]',
        context: paths.absSrcPath,
      }),
    ],
    resolve: {
      ...afWebpackConfig.resolve,
      alias: {
        ...afWebpackConfig.resolve.alias,
        ...service.webpackConfig.resolve.alias,
      },
    },
  };

  return new Promise((resolve, reject) => {
    require('af-webpack/build').default({
      webpackConfig,
      onSuccess() {
        console.log('[umi-plugin-dll] Build dll done');
        writeFileSync(filesInfoFile, JSON.stringify(files), 'utf-8');
        resolve();
      },
      onFail(err) {
        reject(err);
      },
    });
  });
}
