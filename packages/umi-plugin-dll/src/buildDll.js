import { join } from 'path';
import pullAll from 'lodash.pullall';
import uniq from 'lodash.uniq';

export default function(opts = {}) {
  const {
    webpack,
    afWebpackBuild,
    afWebpackGetConfig,
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

  const appBuild = join(paths.absTmpDirPath, 'dll');

  const afWebpackConfig = afWebpackGetConfig({
    cwd: paths.cwd,
  });
  const webpackConfig = {
    ...afWebpackConfig,
    entry: {
      umi: uniq([...depNames, 'umi/link', 'umi/navlink', 'umi/route']),
    },
    output: {
      path: appBuild,
      filename: '[name].dll.js',
      library: '[name]',
    },
    plugins: [
      ...afWebpackConfig.plugins,
      new webpack.DllPlugin({
        path: join(appBuild, '[name].json'),
        name: '[name]',
        context: paths.absSrcPath,
      }),
    ],
    alias: {
      ...afWebpackConfig.alias,
      ...service.webpackConfig.alias,
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
