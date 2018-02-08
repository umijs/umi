import { join } from 'path';
import registerBabel from 'af-webpack/registerBabel';
import excapeRegExp from 'lodash.escaperegexp';
import { CONFIG_FILES } from './constants';

export default function resiterBabelFn(babelPreset, opts) {
  const { only, disablePreventTest, ignore, cwd } = opts;

  const files = [...CONFIG_FILES, 'webpack.config.js', '.webpackrc.js'].map(
    file => {
      return excapeRegExp(join(cwd, file));
    },
  );

  registerBabel({
    only: [...(only || []), new RegExp(`(${files.join('|')})`)],
    ignore,
    babelPreset: [babelPreset, { disableTransform: true }],
    disablePreventTest,
  });
}

export function registerBabelForConfig(babelPreset, opts = {}) {
  const { paths } = opts;
  resiterBabelFn(babelPreset, {
    ...opts,
    cwd: paths.cwd,
  });
}
