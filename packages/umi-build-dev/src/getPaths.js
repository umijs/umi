import { join } from 'path';
import { existsSync, statSync } from 'fs';

function test(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

export default function(opts = {}) {
  const { cwd, tmpDirectory, outputPath } = opts;

  let pagesPath = 'pages';
  if (test(join(cwd, 'src/page'))) {
    pagesPath = 'src/page';
  }
  if (test(join(cwd, 'src/pages'))) {
    pagesPath = 'src/pages';
  }

  const envAffix =
    process.env.NODE_ENV === 'development' ? '' : `-${process.env.NODE_ENV}`;
  const tmpDirPath = `${pagesPath}/${tmpDirectory}${envAffix}`;

  return {
    cwd,
    outputPath,
    absOutputPath: join(cwd, outputPath),
    pagesPath,
    absPagesPath: join(cwd, pagesPath),
    tmpDirPath,
    absTmpDirPath: join(cwd, tmpDirPath),
  };
}
