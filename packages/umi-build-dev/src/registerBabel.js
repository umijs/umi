import { join } from 'path';
import isAbsolute from 'path-is-absolute';
import registerBabel from 'af-webpack/registerBabel';
import flatten from 'lodash.flatten';
import { winPath } from 'umi-utils';
import { CONFIG_FILES } from './constants';

let files = null;

function initFiles() {
  if (files) return;
  const env = process.env.UMI_ENV;
  files = [
    ...flatten(
      CONFIG_FILES.map(file => [
        file,
        ...(env ? [file.replace(/\.js$/, `.${env}.js`)] : []),
        file.replace(/\.js$/, `.local.js`),
      ]),
    ),
  ];
}

export function addBabelRegisterFiles(extraFiles) {
  initFiles();
  files.push(...extraFiles);
}

export default function(opts = {}) {
  initFiles();
  const { cwd } = opts;
  const only = files.map(f => {
    const fullPath = isAbsolute(f) ? f : join(cwd, f);
    return winPath(fullPath);
  });
  registerBabel({
    only: [new RegExp(`${only.join('|')}`)],
    babelPreset: [
      require.resolve('babel-preset-umi'),
      { disableTransform: true },
    ],
  });
}
