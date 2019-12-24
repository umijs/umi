import { join } from 'path';
import { existsSync, statSync } from 'fs';

function isDirectoryAndExist(path: string) {
  return existsSync(path) && statSync(path).isDirectory();
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

  return {
    cwd,
    absNodeModulesPath: join(cwd, 'node_modules'),
    absOutputPath: join(cwd, config.outputPath || './dist'),
    absSrcPath,
    absPagesPath,
    absTmpPath: join(
      absSrcPath,
      ['.umi', env !== 'development' && env].filter(Boolean).join('-'),
    ),
  };
}
