export type NpmClient = 'npm' | 'cnpm' | 'tnpm' | 'yarn' | 'pnpm';
export const npmClients = ['pnpm', 'tnpm', 'cnpm', 'yarn', 'npm'];
export enum NpmClientEnum {
  pnpm = 'pnpm',
  tnpm = 'tnpm',
  cnpm = 'cnpm',
  yarn = 'yarn',
  npm = 'npm',
}
export const getNpmClient = (): NpmClient => {
  const userAgent = process.env.npm_config_user_agent;
  if (userAgent) {
    if (userAgent.includes('pnpm')) return 'pnpm';
    if (userAgent.includes('tnpm')) return 'tnpm';
    if (userAgent.includes('yarn')) return 'yarn';
    if (userAgent.includes('cnpm')) return 'cnpm';
  }
  return 'npm';
};

export const checkNpmClient = (npmClient: NpmClient): boolean => {
  const userAgent = process.env.npm_config_user_agent;
  return !!(userAgent && userAgent.includes(npmClient));
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
