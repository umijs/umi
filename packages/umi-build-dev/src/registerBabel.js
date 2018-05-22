import { join } from 'path';
import isAbsolute from 'path-is-absolute';
import registerBabel from 'af-webpack/registerBabel';
import flatten from 'lodash.flatten';
import { getEnv } from './UserConfig';
import { CONFIG_FILES } from './constants';
import winPath from './winPath';

let files = null;

function initFiles() {
  if (files) return;
  const env = getEnv();
  files = [
    ...flatten(
      CONFIG_FILES.map(file => [file, file.replace(/\.js$/, `.${env}.js`)]),
    ),
    'webpack.config.js',
    '.webpackrc.js',
  ];
}

export function addBabelRegisterFiles(extraFiles) {
  initFiles();
  files.push(...extraFiles);
}

export default function(babelPreset, opts = {}) {
  initFiles();
  const { cwd } = opts;
  const only = files.map(f => {
    const fullPath = isAbsolute(f) ? f : join(cwd, f);
    return winPath(fullPath);
  });
  registerBabel({
    only: [only.join('|')],
    babelPreset: [babelPreset, { disableTransform: true }],
  });
}
