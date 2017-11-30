import { join } from 'path';
import { existsSync, statSync } from 'fs';

function test(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

export default function(opts = {}) {
  const { cwd, tmpDirectory } = opts;

  let pagesPath = 'pages';
  if (test(join(cwd, 'src/page'))) {
    pagesPath = 'src/page';
  }
  if (test(join(cwd, 'src/pages'))) {
    pagesPath = 'src/pages';
  }
  const absPagesPath = join(cwd, pagesPath);
  const absTmpDirPath = join(absPagesPath, tmpDirectory);

  return {
    cwd,
    pagesPath,
    absPagesPath,
    absTmpDirPath,
  };
}
