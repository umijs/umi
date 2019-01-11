import { sync as resolveSync } from 'resolve';
import { resolve } from 'path';
import eslintFormatter from 'react-dev-utils/eslintFormatter';
import { existsSync, readFileSync } from 'fs';
const debug = require('debug')('af-webpack:getConfig');

export default function(webpackConfig, opts) {
  const eslintOptions = {
    formatter: eslintFormatter,
    baseConfig: {
      extends: [require.resolve('eslint-config-umi')],
    },
    ignore: false,
    eslintPath: require.resolve('eslint'),
    useEslintrc: false,
  };

  try {
    const { dependencies, devDependencies } = require(resolve('package.json')); // eslint-disable-line
    if (dependencies.eslint || devDependencies) {
      const eslintPath = resolveSync('eslint', {
        basedir: opts.cwd,
      });
      eslintOptions.eslintPath = eslintPath;
      debug(`use user's eslint bin: ${eslintPath}`);
    }
  } catch (e) {
    debug(e);
  }

  if (existsSync(resolve('.eslintrc'))) {
    try {
      const userRc = JSON.parse(readFileSync(resolve('.eslintrc'), 'utf-8'));
      debug(`userRc: ${JSON.stringify(userRc)}`);
      if (userRc.extends) {
        debug(`use user's .eslintrc: ${resolve('.eslintrc')}`);
        eslintOptions.useEslintrc = true;
        eslintOptions.baseConfig = false;
        eslintOptions.ignore = true;
      } else {
        debug(`extend with user's .eslintrc: ${resolve('.eslintrc')}`);
        eslintOptions.baseConfig = {
          ...eslintOptions.baseConfig,
          ...userRc,
        };
      }
    } catch (e) {
      debug(e);
    }
  }

  webpackConfig.module
    .rule('eslint')
    .test(/\.(js|jsx)$/)
    .include.add(opts.cwd)
    .end()
    .exclude.add(/node_modules/)
    .end()
    .enforce('pre')
    .use('eslint-loader')
    .loader(require.resolve('eslint-loader'))
    .options(eslintOptions);
}
