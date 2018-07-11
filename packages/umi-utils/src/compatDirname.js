import { dirname, join } from 'path';
import { existsSync } from 'fs';

export default function(path, cwd, fallback) {
  const pkgPath = join(cwd, 'package.json');
  const library = path.split('/')[0];
  if (existsSync(pkgPath)) {
    const { dependencies = {} } = require(pkgPath); // eslint-disable-line
    if (dependencies[library]) {
      return dirname(join(cwd, 'node_modules', path));
    }
  }
  return fallback;
}
