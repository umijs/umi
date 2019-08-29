import glob from 'glob';
import slash2 from 'slash2';
import { join } from 'path';

const src = join(slash2(__dirname), 'src', 'plugins');
const files = glob.sync('**/*.@(tsx|jsx)', { cwd: slash2(src) });
const browserFiles = files.map(filePath => join('src', 'plugins', slash2(filePath)));

export default {
  target: 'node',
  cjs: { type: 'babel', lazy: true },
  browserFiles,
  disableTypeCheck: true,
};
