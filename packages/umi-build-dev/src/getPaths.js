import { join } from 'path';
import { existsSync, statSync } from 'fs';

function test(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

function template(path) {
  return join(__dirname, '../template', path);
}

export default function(service) {
  const { cwd, tmpDirectory, outputPath, libraryName } = service;

  let pagesPath = 'pages';
  if (test(join(cwd, 'src/page'))) {
    pagesPath = 'src/page';
  }
  if (test(join(cwd, 'src/pages'))) {
    pagesPath = 'src/pages';
  }
  const absPagesPath = join(cwd, pagesPath);
  const absSrcPath = join(absPagesPath, '../');
  const absLayoutPath = join(absSrcPath, 'layouts/index.js');

  const envAffix = process.env.NODE_ENV === 'development' ? '' : `-production`;
  const tmpDirPath = `${pagesPath}/${tmpDirectory}${envAffix}`;
  const absTmpDirPath = join(cwd, tmpDirPath);

  return {
    cwd,
    outputPath,
    absOutputPath: join(cwd, outputPath),
    pagesPath,
    absPagesPath,
    tmpDirPath,
    absTmpDirPath,
    absLayoutPath,
    absRouterJSPath: join(absTmpDirPath, 'router.js'),
    absLibraryJSPath: join(absTmpDirPath, `${libraryName}.js`),
    absRegisterSWJSPath: join(absTmpDirPath, 'registerServiceWorker.js'),
    absPageDocumentPath: join(absPagesPath, 'document.ejs'),
    defaultEntryTplPath: template('entry.js'),
    defaultRouterTplPath: template('router.js'),
    defaultRegisterSWTplPath: template('registerServiceWorker.js'),
    defaultDocumentPath: template('document.ejs'),
  };
}
