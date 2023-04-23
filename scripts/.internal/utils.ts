import spawn from '@umijs/utils/compiled/cross-spawn';
import * as logger from '@umijs/utils/src/logger';
import type { SpawnSyncOptions } from 'child_process';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { PATHS } from './constants';

export function getPkgs(opts?: { base?: string }): string[] {
  const base = opts?.base || PATHS.PACKAGES;
  return readdirSync(base).filter((dir) => {
    return !dir.startsWith('.') && existsSync(join(base, dir, 'package.json'));
  });
}

export function eachPkg(
  pkgs: string[],
  fn: (opts: {
    name: string;
    dir: string;
    pkgPath: string;
    pkgJson: Record<string, any>;
  }) => void,
  opts?: { base?: string },
) {
  const base = opts?.base || PATHS.PACKAGES;
  pkgs.forEach((pkg) => {
    fn({
      name: pkg,
      dir: join(base, pkg),
      pkgPath: join(base, pkg, 'package.json'),
      pkgJson: require(join(base, pkg, 'package.json')),
    });
  });
}

export function assert(v: unknown, message: string) {
  if (!v) {
    logger.error(message);
    process.exit(1);
  }
}

export function setExcludeFolder(opts: {
  cwd: string;
  pkg: string;
  dirName?: string;
  folders?: string[];
}) {
  const dirName = opts.dirName || 'packages';
  const folders = opts.folders || ['dist', 'compiled', '.turbo'];
  if (!existsSync(join(opts.cwd, '.idea'))) return;
  const configPath = join(opts.cwd, '.idea', 'umi.iml');
  let content = readFileSync(configPath, 'utf-8');
  for (const folder of folders) {
    const excludeContent = `<excludeFolder url='file://$MODULE_DIR$/${dirName}/${opts.pkg}/${folder}' />`;
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

export function spawnSync(cmd: string, opts: SpawnSyncOptions) {
  const result = spawn.sync(cmd, {
    shell: true,
    stdio: 'inherit',
    ...opts,
  });
  if (result.status !== 0) {
    logger.error(`Execute command error (${cmd})`);
    process.exit(1);
  }
  return result;
}

export function toArray(v: unknown) {
  if (Array.isArray(v)) {
    return v;
  }
  return [v];
}
