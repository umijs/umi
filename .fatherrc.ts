import { readdirSync } from 'fs';
import { join } from 'path';

const pkgs = readdirSync(join(__dirname, 'packages')).filter(
  pkg => pkg.charAt(0) !== '.' && pkg !== 'utils',
);

export default {
  target: 'node',
  cjs: { type: 'babel', lazy: true },
  disableTypeCheck: true,
  pkgs: ['utils', ...pkgs],
};
