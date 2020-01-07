import { join } from 'path';
import { existsSync, statSync } from 'fs';
import { winPath } from '@umijs/utils';

function isDirectoryAndExist(path: string) {
  return existsSync(path) && statSync(path).isDirectory();
}

function normalizeWithWinPath(obj: object) {
  return Object.keys(obj).reduce((memo, key) => {
    memo[key] = winPath(obj[key]);
    return memo;
  }, {});
}

export default function({
  cwd,
  config,
  env,
}: {
  cwd: string;
  config: any;
  env: string | undefined;
}) {
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
    aliasedTmpPath: `@/${tmpDir}`,
  });
}
