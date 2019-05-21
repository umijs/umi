import { join } from 'path';
import { existsSync, statSync } from 'fs';
import { IConfig } from 'umi-types';

function test(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

interface IOpts {
  cwd: string;
  config: IConfig;
}

export default function(opts: IOpts) {
  const { cwd, config } = opts;
  const outputPath = config.outputPath || './dist';

  let pagesPath = 'pages';
  if (process.env.PAGES_PATH) {
    pagesPath = process.env.PAGES_PATH;
  } else {
    if (test(join(cwd, 'src/page'))) {
      pagesPath = 'src/page';
    }
    if (test(join(cwd, 'src/pages'))) {
      pagesPath = 'src/pages';
    }
    if (test(join(cwd, 'page'))) {
      pagesPath = 'page';
    }
  }

  const absPagesPath = join(cwd, pagesPath);
  const absSrcPath = join(absPagesPath, '../');

  const envAffix = process.env.NODE_ENV === 'development' ? '' : `-production`;
  const tmpDirPath = process.env.UMI_TEMP_DIR
    ? `${process.env.UMI_TEMP_DIR}${envAffix}`
    : `${pagesPath}/.umi${envAffix}`;

  const absTmpDirPath = join(cwd, tmpDirPath);

  return {
    cwd,
    outputPath,
    absOutputPath: join(cwd, outputPath),
    absNodeModulesPath: join(cwd, 'node_modules'),
    pagesPath,
    absPagesPath,
    absSrcPath,
    tmpDirPath,
    absTmpDirPath,
    absRouterJSPath: join(absTmpDirPath, 'router.js'),
    absLibraryJSPath: join(absTmpDirPath, 'umi.js'),
    absRegisterSWJSPath: join(absTmpDirPath, 'registerServiceWorker.js'),
    absPageDocumentPath: join(absPagesPath, 'document.ejs'),
  };
}
