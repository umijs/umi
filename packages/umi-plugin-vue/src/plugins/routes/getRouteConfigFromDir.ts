// https://github.com/umijs/umi/blob/master/packages/umi-build-dev/src/routes/getRouteConfigFromDir.js
import { readdirSync, statSync } from 'fs';
import { join, extname, basename, relative } from 'path';
import { winPath } from 'umi-utils';
import { findJSFile, isValidJS } from '../../utils';

export default function getRouteConfigFromDir(paths) {
  const { cwd, absPagesPath, absSrcPath, dirPath = '' } = paths;
  const absPath = join(absPagesPath, dirPath);
  const files = readdirSync(absPath);

  const absLayoutFile = findJSFile(absPagesPath, '_layout');
  if (absLayoutFile) {
    throw new Error('root _layout.vue is not supported, use layouts/index.vue instead');
  }

  const children = files
    .filter(file => {
      if (file.charAt(0) === '.' || file.charAt(0) === '_') return false;
      return true;
    })
    .sort(a => (a.charAt(0) === '$' ? 1 : -1))
    .reduce(handleFile.bind(null, paths, absPath), [])
    .map(a => {
      delete a.isParamsRoute;
      return a;
    });

  if (dirPath === '' && absSrcPath) {
    const globalLayoutFile =
      findJSFile(absSrcPath, 'layouts/index') || findJSFile(absSrcPath, 'layout/index');
    if (globalLayoutFile) {
      const wrappedRoutes = [];
      addRoute(
        wrappedRoutes,
        {
          path: '/',
          component: `./${relative(cwd, globalLayoutFile)}`,
          children,
        },
        {
          componentFile: globalLayoutFile,
        },
      );
      return wrappedRoutes;
    }
  }

  return children;
}

function handleFile(paths, absPath, memo, file) {
  const { cwd, absPagesPath, dirPath = '' } = paths;
  const absFilePath = join(absPath, file);
  const stats = statSync(absFilePath);
  const isParamsRoute = file.charAt(0) === '$';

  if (stats.isDirectory()) {
    const newDirPath = join(dirPath, file);
    // routes & _layout
    const children = getRouteConfigFromDir({
      ...paths,
      dirPath: newDirPath,
    });
    const absLayoutFile = findJSFile(join(absPagesPath, newDirPath), '_layout');
    if (absLayoutFile) {
      addRoute(
        memo,
        {
          path: normalizePath(newDirPath),
          component: `./${winPath(relative(cwd, absLayoutFile))}`,
          children,
        },
        {
          componentFile: absLayoutFile,
        },
      );
    } else {
      memo = memo.concat(children);
    }
  } else if (stats.isFile() && isValidJS(file)) {
    const bName = basename(file, extname(file));
    const path = normalizePath(join(dirPath, bName));
    addRoute(
      memo,
      {
        path,
        component: `./${winPath(relative(cwd, absFilePath))}`,
      },
      {
        componentFile: absFilePath,
      },
    );
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

function addRoute(memo, route, { componentFile }) {
  memo.push({
    ...route,
  });
}
