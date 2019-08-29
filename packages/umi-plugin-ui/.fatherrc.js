import glob from 'glob';
import { winPath } from 'umi-utils';
import { join } from 'path';

const src = join(winPath(__dirname), 'src', 'plugins');
const files = glob.sync('**/*.@(tsx|jsx)', { cwd: winPath(src) });
const browserFiles = files.map(filePath => join('src', 'plugins', withPath(filePath)));

export default {
  target: 'node',
  cjs: { type: 'babel', lazy: true },
  browserFiles,
  disableTypeCheck: true,
};
