import * as logger from '@umijs/utils/src/logger';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

export function getPkgs(): string[] {
  return readdirSync(join(__dirname, '../packages')).filter((dir) => {
    return (
      !dir.startsWith('.') &&
      existsSync(join(__dirname, '../packages', dir, 'package.json'))
    );
  });
}

export function eachPkg(
  pkgs: string[],
  fn: (opts: { pkg: string; pkgPath: string }) => void,
) {
  pkgs.forEach((pkg) => {
    fn({
      pkg,
      pkgPath: join(__dirname, '../packages', pkg),
    });
  });
}

export function assert(v: unknown, message: string) {
  if (!v) {
    logger.error(message);
    process.exit(1);
  }
}
