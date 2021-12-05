import * as logger from '@umijs/utils/src/logger';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
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

export function setExcludeFolder(opts: any) {
  if (!existsSync(join(opts.cwd, '.idea'))) return;
  const configPath = join(opts.cwd, '.idea', 'umi-next.iml');
  let content = readFileSync(configPath, 'utf-8');
  const folders = ['dist', 'compiled'];
  for (const folder of folders) {
    const excludeContent = `<excludeFolder url='file://$MODULE_DIR$/packages/${opts.pkg}/${folder}' />`;
    const replaceMatcher = `<content url="file://$MODULE_DIR$">`;
    if (!content.includes(excludeContent)) {
      content = content.replace(
        replaceMatcher,
        `${replaceMatcher}\n      ${excludeContent}`,
      );
    }
  }
  writeFileSync(configPath, content, 'utf-8');
}
