import { join } from 'path';
import { existsSync } from 'fs';

interface IOpts {
  root: string;
}

const MONOREPO_FILE = ['pnpm-workspace.yaml', 'lerna.json'];
export function isMonorepo(opts: IOpts) {
  const pkgPath = join(opts.root, 'package.json');
  let pkg: Record<string, any> = {};
  try {
    pkg = require(pkgPath);
  } catch (e) {}
  const pkgExist = existsSync(pkgPath);
  return (
    pkgExist &&
    (MONOREPO_FILE.some((file) => {
      return existsSync(join(opts.root, file));
    }) ||
      // npm workspaces
      pkg?.workspaces)
  );
}
