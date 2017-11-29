import { join } from 'path';
import { existsSync, statSync } from 'fs';

function isDirectory(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

export default function(opts = {}) {
  const { cwd, tmpDirectory } = opts;

  const pagesPath = isDirectory(join(cwd, 'pages')) ? 'pages' : 'src/page';
  const absPagesPath = join(cwd, pagesPath);
  const absTmpDirPath = join(absPagesPath, tmpDirectory);

  return {
    cwd,
    pagesPath,
    absPagesPath,
    absTmpDirPath,
  };
}
