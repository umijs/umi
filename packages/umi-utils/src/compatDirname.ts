import { dirname, join } from 'path';
import { existsSync } from 'fs';
import winPath from './winPath';

/**
 * Find module path
 * @param path module name
 * @param cwd process cwd
 * @param fallback
 */
export default function(path: string, cwd: string, fallback?: any): any {
  const pkg = findPkg(path, cwd);
  if (pkg) return pkg;

  if (cwd !== process.cwd()) {
    const pkg = findPkg(path, process.cwd());
    if (pkg) return pkg;
  }

  return fallback;
}

/**
 * Find module path
 * @param path module name
 * @param cwd
 */
function findPkg(path: string, cwd: string): string {
  const pkgPath = join(cwd, 'package.json');
  const library = path.split('/')[0];
  if (existsSync(pkgPath)) {
    const { dependencies = {}, devDependencies = {} } = require(pkgPath); // eslint-disable-line
    if (dependencies[library] || devDependencies[library]) {
      const pkgPath = dirname(join(cwd, 'node_modules', path));
      if (existsSync(pkgPath)) {
        return winPath(pkgPath);
      }
    }
  }
}
