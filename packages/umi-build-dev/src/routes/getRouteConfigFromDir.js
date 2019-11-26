import { readdirSync, statSync, readFileSync } from 'fs';
import { join, extname, basename, relative } from 'path';
import { winPath, findJS } from 'umi-utils';
import assert from 'assert';
import getYamlConfig from './getYamlConfig';

const debug = require('debug')('umi-build-dev:getRouteConfigFromDir');
const JS_EXTNAMES = ['.js', '.jsx', '.ts', '.tsx'];

export function sortRoutes(routes) {
  const paramsRoutes = [];
  const exactRoutes = [];
  const layoutRoutes = [];

  routes.forEach(route => {
    const { _isParamsRoute, exact } = route;
    if (_isParamsRoute) {
      paramsRoutes.push(route);
    } else if (exact) {
      exactRoutes.push(route);
    } else {
      layoutRoutes.push(route);
    }
  });

  assert(paramsRoutes.length <= 1, `We should not have multiple dynamic routes under a directory.`);

  return [...exactRoutes, ...layoutRoutes, ...paramsRoutes].reduce((memo, route) => {
    if (route._toMerge) {
      memo = memo.concat(route.routes);
    } else {
      delete route._isParamsRoute;
      memo.push(route);
    }
    return memo;
  }, []);
}

export default function getRouteConfigFromDir(paths) {
  const { cwd, absPagesPath, absSrcPath, dirPath = '' } = paths;
  const absPath = join(absPagesPath, dirPath);
  const files = readdirSync(absPath);

  const absLayoutFile = findJS(absPagesPath, '_layout');
  if (absLayoutFile) {
    throw new Error('root _layout.js is not supported, use layouts/index.js instead');
  }

  const routes = sortRoutes(
    files
      .filter(file => {
        if (
          file.charAt(0) === '.' ||
          file.charAt(0) === '_' ||
          /\.(test|spec|d)\.(j|t)sx?$/.test(file)
        )
          return false;
        return true;
      })
      .reduce(handleFile.bind(null, paths, absPath), []),
  );

  if (dirPath === '' && absSrcPath) {
    const globalLayoutFile =
      findJS(absSrcPath, 'layouts/index') || findJS(absSrcPath, 'layout/index');
    if (globalLayoutFile) {
      const wrappedRoutes = [];
      addRoute(
        wrappedRoutes,
        {
          path: '/',
          component: `./${winPath(relative(cwd, globalLayoutFile))}`,
          routes,
        },
        {
          componentFile: globalLayoutFile,
        },
      );
      return wrappedRoutes;
    }
  }

  return routes;
}

function handleFile(paths, absPath, memo, file) {
  const { cwd, absPagesPath, dirPath = '' } = paths;
  const absFilePath = join(absPath, file);
  const stats = statSync(absFilePath);
  const isParamsRoute = file.charAt(0) === '$';

  if (stats.isDirectory()) {
    const newDirPath = join(dirPath, file);
    // routes & _layout
    const routes = getRouteConfigFromDir({
      ...paths,
      dirPath: newDirPath,
    });
    const absLayoutFile = findJS(join(absPagesPath, newDirPath), '_layout');
    if (absLayoutFile) {
      addRoute(
        memo,
        {
          path: normalizePath(newDirPath),
          exact: false,
          component: `./${winPath(relative(cwd, absLayoutFile))}`,
          routes,
          _isParamsRoute: isParamsRoute,
        },
        {
          componentFile: absLayoutFile,
        },
      );
    } else {
      memo.push({
        _toMerge: true,
        path: normalizePath(newDirPath),
        exact: true,
        _isParamsRoute: isParamsRoute,
        routes,
      });
    }
  } else if (stats.isFile() && isValidJS(file)) {
    const bName = basename(file, extname(file));
    const path = normalizePath(join(dirPath, bName));
    addRoute(
      memo,
      {
        path,
        exact: true,
        component: `./${winPath(relative(cwd, absFilePath))}`,
        _isParamsRoute: isParamsRoute,
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
  const code = readFileSync(componentFile, 'utf-8');
  debug(`parse yaml from ${componentFile}`);
  const config = getYamlConfig(code, componentFile);
  ['path', 'exact', 'component', 'routes'].forEach(key => {
    assert(!(key in config), `Unexpected key ${key} in file ${componentFile}`);
  });
  memo.push({
    ...route,
    ...config,
  });
}

function isValidJS(file) {
  return JS_EXTNAMES.includes(extname(file));
}
