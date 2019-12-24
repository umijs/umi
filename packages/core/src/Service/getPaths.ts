import { join } from 'path';
import { existsSync, statSync } from 'fs';
import { winPath } from '@umijs/utils/src';

function isDirectoryAndExist(path: string) {
  return existsSync(path) && statSync(path).isDirectory();
}

function normalizeWithWinPath(obj: object) {
  return Object.keys(obj).reduce((memo, key) => {
    memo[key] = winPath(memo[key]);
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

  return normalizeWithWinPath({
    cwd,
    absNodeModulesPath: join(cwd, 'node_modules'),
    absOutputPath: join(cwd, config.outputPath || './dist'),
    absSrcPath,
    absPagesPath,
    absTmpPath: join(
      absSrcPath,
      ['.umi', env !== 'development' && env].filter(Boolean).join('-'),
    ),
  });
}
