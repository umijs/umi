import { join } from 'path';
import registerBabel from 'af-webpack/registerBabel';
import excapeRegExp from 'lodash.escaperegexp';
import { CONFIG_FILES } from './constants';

export default function resiterBabelFn(babelPreset, opts) {
  const { only, disablePreventTest, ignore } = opts;
  registerBabel({
    only,
    ignore,
    babelPreset: [babelPreset, { disableTransform: true }],
    disablePreventTest,
  });
}

export function registerBabelForConfig(babelPreset, opts = {}) {
  const { paths } = opts;
  const files = [...CONFIG_FILES, 'webpack.config.js', '.webpackrc.js'].map(
    file => {
      return excapeRegExp(join(paths.cwd, file));
    },
  );

  resiterBabelFn(babelPreset, {
    ...opts,
    only: [new RegExp(`(${files.join('|')})`)],
  });
}
