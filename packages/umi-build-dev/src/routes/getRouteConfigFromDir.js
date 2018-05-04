import { readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename, relative } from 'path';
import winPath from '../winPath';

const JS_EXTNAMES = ['.js', '.jsx', '.ts', '.tsx'];

export default function getRouteConfigFromDir(paths) {
  const { cwd, absPagesPath, absSrcPath, dirPath = '' } = paths;
  const absPath = join(absPagesPath, dirPath);
  const files = readdirSync(absPath);

  const absLayoutFile = findJSFile(absPagesPath, '_layout');
  if (absLayoutFile) {
    throw new Error(
      'root _layout.js is not supported, use layouts/index.js instead',
    );
  }

  const routes = files
    .filter(file => {
      if (file.charAt(0) === '.' || file.charAt(0) === '_') return false;
      return true;
    })
    .sort(a => (a.charAt(0) === '$' ? 1 : -1))
    .reduce(handleFile.bind(null, paths, absPath), []);

  if (dirPath === '' && absSrcPath) {
    const globalLayoutFile = findJSFile(absSrcPath, 'layouts/index');
    if (globalLayoutFile) {
      return [
        {
          path: '/',
          component: `./${relative(cwd, globalLayoutFile)}`,
          routes,
        },
      ];
    }
  }

  return routes;
}

function handleFile(paths, absPath, memo, file) {
  const { cwd, absPagesPath, dirPath = '' } = paths;
  const absFilePath = join(absPath, file);
  const stats = statSync(absFilePath);

  if (stats.isDirectory()) {
    const newDirPath = join(dirPath, file);

    // xxxx/page.(t|j)sx?
    const absPageFile = findJSFile(join(absPagesPath, newDirPath), 'page');
    if (absPageFile) {
      const absConflictFile = findJSFile(absPagesPath, newDirPath);
      if (absConflictFile) {
        throw new Error(
          `
Routes conflict:

  - ${absPageFile}
  - ${absConflictFile}
        `.trim(),
        );
      }
      addRoute(memo, {
        path: normalizePath(newDirPath),
        exact: true,
        component: `./${relative(cwd, absPageFile)}`,
      });
    } else {
      // routes & _layout
      const routes = getRouteConfigFromDir({
        ...paths,
        dirPath: newDirPath,
      });
      const absLayoutFile = findJSFile(
        join(absPagesPath, newDirPath),
        '_layout',
      );
      if (absLayoutFile) {
        addRoute(memo, {
          path: normalizePath(newDirPath),
          exact: false,
          component: `./${relative(cwd, absLayoutFile)}`,
          routes,
        });
      } else {
        memo = memo.concat(routes);
      }
    }
  } else if (stats.isFile() && isValidJS(file)) {
    const bName = basename(file, extname(file));
    const path = normalizePath(join(dirPath, bName));
    addRoute(memo, {
      path,
      exact: true,
      component: `./${relative(cwd, absFilePath)}`,
    });
  }

  return memo;
}

function normalizePath(path) {
  let newPath = `/${winPath(path)
    .split('/')
    .map(path => path.replace(/^\$/, ':').replace(/\$$/, '?'))
    .join('/')}`;

  // /index/index -> /
  if (newPath === '/index/index') {
    newPath = '/';
  }
  // /xxxx/index -> /xxxx/
  newPath = newPath.replace(/\/index$/, '/');

  // remove the last slash
  // e.g. /abc/ -> /abc
  if (newPath !== '/' && newPath.slice(-1) === '/') {
    newPath = newPath.slice(0, -1);
  }

  return newPath;
}

function findJSFile(baseDir, fileNameWithoutExtname) {
  for (const extname of JS_EXTNAMES) {
    const fileName = `${fileNameWithoutExtname}${extname}`;
    const absFilePath = join(baseDir, fileName);
    if (existsSync(absFilePath)) {
      return absFilePath;
    }
  }
}

function addRoute(memo, route) {
  memo.push(route);
}

function isValidJS(file) {
  return JS_EXTNAMES.includes(extname(file));
}
