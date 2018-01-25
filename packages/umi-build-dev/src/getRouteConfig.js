import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join, extname, basename, relative } from 'path';
import assert from 'assert';
import { ROUTE_FILES, ROUTES_CONFIG_FILE } from './constants';

const DOT_JS = '.js';
const EXT_NAMES = ['.js', '.jsx', '.ts', '.tsx'];

export default function(paths, dirPath = '') {
  const routeConfigFile = routesConfigExists(paths.cwd);
  if (routeConfigFile) {
    return getRoutesByConfig(routeConfigFile);
  } else {
    return getRoutesByPagesDir(paths, dirPath);
  }
}

function routesConfigExists(root) {
  for (const routeConfig of ROUTES_CONFIG_FILE) {
    if (existsSync(join(root, routeConfig))) {
      return join(root, routeConfig);
    }
  }
}

function addHtmlSuffix(path) {
  return path.slice(-1) === '/' ? path : `${path}.html`;
}

function getRoutesByConfig(routesConfigFile) {
  const routesConfig = JSON.parse(readFileSync(routesConfigFile));
  assert(
    Array.isArray(routesConfig),
    `router config must be Array, but got ${routesConfig}`,
  );
  return routesConfig.map(route => {
    return {
      ...route,
      path: addHtmlSuffix(route.path),
    };
  });
}

function getRoutesByPagesDir(paths, dirPath = '') {
  const { cwd, absPagesPath } = paths;

  const path = join(absPagesPath, dirPath);
  const files = readdirSync(path);
  let ret = [];

  files.forEach(file => {
    // 包含 ., .., 以及其他 dotfile
    if (file.charAt(0) === '.') return;
    const filePath = join(path, file);
    const stats = statSync(filePath);
    const ext = extname(file);

    if (stats.isFile() && EXT_NAMES.indexOf(ext) > -1) {
      const fullPath = join(dirPath, basename(file, ext));
      ret.push({
        path: addHtmlSuffix(`/${fullPath}`),
        exact: true,
        component: relative(cwd, filePath),
      });
    } else if (stats.isDirectory()) {
      let routerFound = false;
      const fullPath = join(dirPath, file);
      for (const routeFile of ROUTE_FILES) {
        if (existsSync(join(absPagesPath, fullPath, routeFile))) {
          if (existsSync(join(absPagesPath, `${fullPath}${DOT_JS}`))) {
            throw new Error(
              `路由冲突，src/page 目录下同时存在 "${fullPath}${DOT_JS}" 和 "${join(
                fullPath,
                routeFile,
              )}"，两者指向同一路由。`,
            );
          }
          ret.push({
            path: addHtmlSuffix(`/${fullPath}`),
            exact: true,
            component: relative(cwd, join(absPagesPath, fullPath, routeFile)),
          });
          routerFound = true;
          break;
        }
      }

      if (!routerFound) {
        ret = ret.concat(getRoutesByPagesDir(paths, fullPath));
      }
    }
  });

  return ret;
}
