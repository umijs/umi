import glob from 'glob';
import { join } from 'path';

const src = join(__dirname, './src');
const files = glob.sync('**/*.@(tsx)', { cwd: src });

export default {
  target: 'node',
  cjs: { type: 'babel', lazy: true },
  disableTypeCheck: true,
  browserFiles: files.map(filePath => join('src', filePath)),
};
