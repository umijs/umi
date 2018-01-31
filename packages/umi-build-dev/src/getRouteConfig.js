import { readdirSync, readFileSync, statSync, existsSync } from 'fs';
import { join, extname, basename, relative } from 'path';
import assert from 'assert';
import { ROUTE_FILES, ROUTES_CONFIG_FILE } from './constants';

const DOT_JS = '.js';
const EXT_NAMES = ['.js', '.jsx', '.ts', '.tsx'];

export default function(paths, config = {}) {
  const routeConfigFile = routesConfigExists(paths.cwd);
  const routes = routeConfigFile
    ? getRoutesByConfig(routeConfigFile)
    : getRoutesByPagesDir(paths);

  if (config.exportStatic) {
    routes.forEach(route => {
      if (route.path.indexOf(':') > -1) {
        throw new Error(
          `Variable path ${route.path} don\'t work with exportStatic`,
        );
      }
      if (
        typeof config.exportStatic === 'object' &&
        config.exportStatic.htmlSuffix
      ) {
        route.path = addHtmlSuffix(route.path);
      }
    });
  }

  return routes;
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
  return routesConfig;
}

function variablePath(path) {
  return path.replace(/\$/g, ':');
}

function getRoutesByPagesDir(paths, dirPath = '') {
  const { cwd, absPagesPath } = paths;

  let ret = [];
  const path = join(absPagesPath, dirPath);
  if (existsSync(path)) {
    const files = readdirSync(path);

    files.forEach(file => {
      // 包含 ., .., 以及其他 dotfile
      if (file.charAt(0) === '.') return;
      const filePath = join(path, file);
      const stats = statSync(filePath);
      const ext = extname(file);

      if (stats.isFile() && EXT_NAMES.indexOf(ext) > -1) {
        const fullPath = join(dirPath, basename(file, ext));
        ret.push({
          path: `/${variablePath(fullPath)}`.replace(/\/index$/, '/'),
          exact: true,
          component: `./${relative(cwd, filePath)}`,
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
              path: `/${variablePath(fullPath)}`.replace(/\/index$/, '/'),
              exact: true,
              component: `./${relative(
                cwd,
                join(absPagesPath, fullPath, routeFile),
              )}`,
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
  }

  return ret;
}
