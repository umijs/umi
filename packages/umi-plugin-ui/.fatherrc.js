import glob from 'glob';
import { join } from 'path';
import slash from 'slash2';

const src = join(__dirname, 'src', 'plugins');
const files = glob.sync('**/*.@(tsx|jsx)', { cwd: src });
const browserFiles = files.map(filePath => slash(join('src', 'plugins', filePath)));

export default {
  target: 'node',
  cjs: { type: 'babel', lazy: true },
  browserFiles,
  disableTypeCheck: true,
};
