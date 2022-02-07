import { readJsonSync } from '../compiled/fs-extra';

export const getCorejsVersion = (pkgPath: string) => {
  const pkg = readJsonSync(pkgPath, { encoding: 'utf-8' });
  const version =
    pkg.dependencies['core-js']?.split('.').slice(0, 2).join('.') || '3';
  return version;
};
