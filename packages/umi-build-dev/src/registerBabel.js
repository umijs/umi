import { join } from 'path';
import registerBabel from 'af-webpack/registerBabel';
import excapeRegExp from 'lodash.escaperegexp';
import { CONFIG_FILES } from './constants';
import winPath from './winPath';

const files = [...CONFIG_FILES, 'webpack.config.js', '.webpackrc.js'];

export function addBabelRegisterFiles(extraFiles) {
  files.push(...extraFiles);
}

export default function(babelPreset, opts = {}) {
  const { cwd } = opts;
  const only = files.map(f => {
    const fullPath = f.charAt(0) === '/' ? f : join(cwd, f);
    return excapeRegExp(winPath(fullPath));
  });
  registerBabel({
    only: [only.join('|')],
    babelPreset: [babelPreset, { disableTransform: true }],
  });
}
