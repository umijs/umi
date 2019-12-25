import { readdirSync } from 'fs';
import { join } from 'path';

const headPkgs = ['utils', 'runtime'];
const pkgs = readdirSync(join(__dirname, 'packages')).filter(
  pkg => pkg.charAt(0) !== '.' && !headPkgs.includes(pkg),
);

export default {
  target: 'node',
  cjs: { type: 'babel', lazy: true },
  disableTypeCheck: true,
  // utils must build before core
  pkgs: [...headPkgs, ...pkgs],
};
