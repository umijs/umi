import { lodash, winPath } from '@umijs/utils';
import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { IServicePaths } from './types';

function isDirectoryAndExist(path: string) {
  return existsSync(path) && statSync(path).isDirectory();
}

function normalizeWithWinPath<T extends Record<any, string>>(obj: T) {
  return lodash.mapValues(obj, (value) => winPath(value));
}

export default function getServicePaths({
  cwd,
  config,
  env,
}: {
  cwd: string;
  config: any;
  env?: string;
}): IServicePaths {
  let absSrcPath = cwd;
  if (isDirectoryAndExist(join(cwd, 'src'))) {
    absSrcPath = join(cwd, 'src');
  }
  const absPagesPath = config.singular
    ? join(absSrcPath, 'page')
    : join(absSrcPath, 'pages');

  const tmpDir = ['.umi', env !== 'development' && env]
    .filter(Boolean)
    .join('-');
  return normalizeWithWinPath({
    cwd,
    absNodeModulesPath: join(cwd, 'node_modules'),
    absOutputPath: join(cwd, config.outputPath || './dist'),
    absSrcPath,
    absPagesPath,
    absTmpPath: join(absSrcPath, tmpDir),
  });
}
