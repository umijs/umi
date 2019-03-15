import { dirname, join } from 'path';
import { existsSync } from 'fs';

export default function(path, cwd, fallback) {
  const pkg = findPkg(path, cwd);
  if (pkg) return pkg;

  if (cwd !== process.cwd()) {
    const pkg = findPkg(path, process.cwd());
    if (pkg) return pkg;
  }

  return fallback;
}

function findPkg(path, cwd) {
  const pkgPath = join(cwd, 'package.json');
  const library = path.split('/')[0];
  if (existsSync(pkgPath)) {
    const { dependencies = {}, devDependencies = {} } = require(pkgPath); // eslint-disable-line
    if (dependencies[library] || devDependencies[library]) {
      const pkgPath = dirname(join(cwd, 'node_modules', path));
      if (existsSync(pkgPath)) {
        return pkgPath;
      }
    }
  }
}
