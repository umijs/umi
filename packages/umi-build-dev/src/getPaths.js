import { join } from 'path';
import { existsSync, statSync } from 'fs';

function test(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

function template(path) {
  return join(__dirname, '../template', path);
}

export default function(service) {
  const { cwd, config } = service;
  const outputPath = config.outputPath || './dist';

  let pagesPath = 'pages';
  if (process.env.PAGES_PATH) {
    pagesPath = process.env.PAGES_PATH;
  }
  if (test(join(cwd, 'src/page'))) {
    pagesPath = 'src/page';
  }
  if (test(join(cwd, 'src/pages'))) {
    pagesPath = 'src/pages';
  }
  if (test(join(cwd, 'page'))) {
    pagesPath = 'page';
  }
  const absPagesPath = join(cwd, pagesPath);
  const absSrcPath = join(absPagesPath, '../');

  const envAffix = process.env.NODE_ENV === 'development' ? '' : `-production`;
  const tmpDirPath = `${pagesPath}/.umi${envAffix}`;
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
    defaultEntryTplPath: template('entry.js.tpl'),
    defaultRouterTplPath: template('router.js.tpl'),
    defaultRegisterSWTplPath: template('registerServiceWorker.js'),
    defaultDocumentPath: template('document.ejs'),
  };
}
