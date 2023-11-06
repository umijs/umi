import { existsSync, readFileSync } from 'fs';
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
  const tnpmRegistries = ['.alibaba-inc.', '.antgroup-inc.'];
  const tcnpmLockPath = join(opts.cwd, 'node_modules', '.package-lock.json');
  const chokidarPkg = require('chokidar/package.json');

  // detect tnpm/cnpm client
  // all situations:
  //   - npminstall mode + native fs => generate _resolved field in package.json
  //   - npminstall mode + rapid fs => generate .package-lock.json in node_modules
  //   - npm mode + native fs => generate .package-lock.json in node_modules
  //   - npm mode + rapid fs => generate .package-lock.json in node_modules
  // all conditions:
  //   - has _resolved field or .package-lock.json means tnpm/cnpm
  //   - _resolved field or .package-lock.json contains tnpm registry means tnpm
  if (chokidarPkg._resolved) {
    return tnpmRegistries.some((r) => chokidarPkg._resolved.includes(r))
      ? 'tnpm'
      : 'cnpm';
  } else if (existsSync(tcnpmLockPath)) {
    const tcnpmLock = readFileSync(tcnpmLockPath, 'utf-8');

    return tnpmRegistries.some((r) => tcnpmLock.includes(r)) ? 'tnpm' : 'cnpm';
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
  // pnpm install will not install devDependencies when NODE_ENV === 'production'
  // we should remove NODE_ENV to make sure devDependencies can be installed
  const { NODE_ENV: _, ...env } = process.env;
  const npm = sync(npmClient, [npmClient === 'yarn' ? '' : 'install'], {
    stdio: 'inherit',
    cwd,
    env,
  });
  if (npm.error) {
    throw npm.error;
  }
};
