import { join } from 'path';
import pullAll from 'lodash.pullall';
import uniq from 'lodash.uniq';

export default function(opts = {}) {
  const {
    webpack,
    afWebpackBuild,
    afWebpackGetConfig,
    webpackHotDevClientPath,
    dllDir,
    service,
    service: { paths },
    include,
    exclude,
  } = opts;

  const pkg = require(join(paths.cwd, 'package.json')); // eslint-disable-line
  const depNames = pullAll(
    uniq(Object.keys(pkg.dependencies).concat(include || [])),
    exclude,
  );

  const afWebpackConfig = afWebpackGetConfig({
    cwd: paths.cwd,
    disableBabelTransform: true,
  });
  const webpackConfig = {
    ...afWebpackConfig,
    entry: {
      umi: uniq([
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
        'umi-fastclick',
        'react',
        'react-dom',
        'react-router-dom',
      ]),
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
    afWebpackBuild({
      webpackConfig,
      success({ stats, warnings }) {
        resolve();
      },
      fail(err) {
        reject(err);
      },
    });
  });
}
