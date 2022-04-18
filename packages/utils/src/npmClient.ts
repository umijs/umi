import { existsSync } from 'fs';
import { join } from 'path';

export type NpmClient = 'npm' | 'cnpm' | 'tnpm' | 'yarn' | 'pnpm';
export const npmClients = ['pnpm', 'tnpm', 'cnpm', 'yarn', 'npm'];
export enum NpmClientEnum {
  pnpm = 'pnpm',
  tnpm = 'tnpm',
  cnpm = 'cnpm',
  yarn = 'yarn',
  npm = 'npm',
}
export const getNpmClient = (opts: { cwd: string }): NpmClient => {
  const chokidarPkg = require('chokidar/package.json');
  if (chokidarPkg.__npminstall_done) {
    return chokidarPkg._resolved.includes('registry.npm.alibaba-inc.com')
      ? 'tnpm'
      : 'cnpm';
  }
  const chokidarPath = require.resolve('chokidar');
  if (
    chokidarPath.includes('.pnpm') ||
    existsSync(join(opts.cwd, 'node_modules', '.pnpm'))
  ) {
    return 'pnpm';
  }
  if (
    existsSync(join(opts.cwd, 'yarn.lock')) ||
    existsSync(join(opts.cwd, 'node_modules', '.yarn-integrity'))
  ) {
    return 'yarn';
  }
  return 'npm';
};

export const installWithNpmClient = ({
  npmClient,
  cwd,
}: {
  npmClient: NpmClient;
  cwd?: string;
}): void => {
  const { sync } = require('../compiled/cross-spawn');
  const npm = sync(npmClient, [npmClient === 'yarn' ? '' : 'install'], {
    stdio: 'inherit',
    cwd,
  });
  if (npm.error) {
    throw npm.error;
  }
};
