import { getExportProps, isReactComponent } from '@umijs/ast';
import { getFile, winPath } from '@umijs/utils';
import assert from 'assert';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { basename, extname, join, relative } from 'path';
import { IConfig } from '..';
import { IRoute } from './types';

interface IOpts {
  root: string;
  relDir?: string;
  componentPrefix?: string;
  config: IConfig;
}

// 考虑多种情况：
// 可能是目录，没有后缀，比如 [post]/add.tsx
// 可能是文件，有后缀，比如 [id].tsx
// [id$] 是可选动态路由
const RE_DYNAMIC_ROUTE = /^\[(.+?)\]/;

function getFiles(root: string) {
  if (!existsSync(root)) return [];
  return readdirSync(root).filter((file) => {
    const absFile = join(root, file);
    const fileStat = statSync(absFile);
    const isDirectory = fileStat.isDirectory();
    const isFile = fileStat.isFile();
    if (
      isDirectory &&
      ['components', 'component', 'utils', 'util'].includes(file)
    ) {
      return false;
    }
    if (file.charAt(0) === '.') return false;
    if (file.charAt(0) === '_') return false;
    // exclude test file
    if (/\.(test|spec|e2e)\.(j|t)sx?$/.test(file)) return false;
    // d.ts
    if (/\.d\.ts$/.test(file)) return false;
    if (isFile) {
      if (!/\.(j|t)sx?$/.test(file)) return false;
      const content = readFileSync(absFile, 'utf-8');
      try {
        if (!isReactComponent(content)) return false;
      } catch (e) {
        throw new Error(
          `Parse conventional route component ${absFile} failed, ${e.message}`,
        );
      }
    }
    return true;
  });
}

function fileToRouteReducer(opts: IOpts, memo: IRoute[], file: string) {
  const { root, relDir = '' } = opts;
  const absFile = join(root, relDir, file);
  const stats = statSync(absFile);
  const __isDynamic = RE_DYNAMIC_ROUTE.test(file);

  if (stats.isDirectory()) {
    const relFile = join(relDir, file);
    const layoutFile = getFile({
      base: join(root, relFile),
      fileNameWithoutExt: '_layout',
      type: 'javascript',
    });
    const route = {
      path: normalizePath(relFile, opts),
      routes: getRoutes({
        ...opts,
        relDir: join(relFile),
      }),
      __isDynamic,
      ...(layoutFile
        ? {
            component: layoutFile.path,
          }
        : {
            exact: true,
            __toMerge: true,
          }),
    };
    memo.push(normalizeRoute(route, opts));
  } else {
    const bName = basename(file, extname(file));
    memo.push(
      normalizeRoute(
        {
          path: normalizePath(join(relDir, bName), opts),
          exact: true,
          component: absFile,
          __isDynamic,
        },
        opts,
      ),
    );
  }
  return memo;
}

function normalizeRoute(route: IRoute, opts: IOpts) {
  let props: unknown = undefined;
  if (route.component) {
    try {
      props = getExportProps(readFileSync(route.component, 'utf-8'));
    } catch (e) {
      throw new Error(
        `Parse conventional route component ${route.component} failed, ${e.message}`,
      );
    }
    route.component = winPath(relative(join(opts.root, '..'), route.component));
    route.component = `${opts.componentPrefix || '@/'}${route.component}`;
  }
  return {
    ...route,
    ...(typeof props === 'object' ? props : {}),
  };
}

function normalizePath(path: string, opts: IOpts) {
  path = winPath(path)
    .split('/')
    .map((p) => {
      // dynamic route
      p = p.replace(RE_DYNAMIC_ROUTE, ':$1');

      // :post$ => :post?
      if (p.endsWith('$')) {
        p = p.slice(0, -1) + '?';
      }
      return p;
    })
    .join('/');

  path = `/${path}`;

  // /index/index -> /
  if (path === '/index/index') {
    path = '/';
  }

  // /xxxx/index -> /xxxx/
  path = path.replace(/\/index$/, '/');

  // remove the last slash
  // e.g. /abc/ -> /abc
  if (path !== '/' && path.slice(-1) === '/') {
    path = path.slice(0, -1);
  }

  return path;
}

function normalizeRoutes(routes: IRoute[]): IRoute[] {
  const paramsRoutes: IRoute[] = [];
  const exactRoutes: IRoute[] = [];
  const layoutRoutes: IRoute[] = [];

  routes.forEach((route) => {
    const { __isDynamic, exact } = route;
    delete route.__isDynamic;
    if (__isDynamic) {
      paramsRoutes.push(route);
    } else if (exact) {
      exactRoutes.push(route);
    } else {
      layoutRoutes.push(route);
    }
  });

  assert(
    paramsRoutes.length <= 1,
    `We should not have multiple dynamic routes under a directory.`,
  );

  return [...exactRoutes, ...layoutRoutes, ...paramsRoutes].reduce(
    (memo, route) => {
      if (route.__toMerge && route.routes) {
        memo = memo.concat(route.routes);
      } else {
        memo.push(route);
      }
      return memo;
    },
    [] as IRoute[],
  );
}

export default function getRoutes(opts: IOpts) {
  const { root, relDir = '', config } = opts;
  const files = getFiles(join(root, relDir));
  const routes = normalizeRoutes(
    files.reduce(fileToRouteReducer.bind(null, opts), []),
  );

  if (!relDir) {
    const globalLayoutFile = getFile({
      base: root,
      fileNameWithoutExt: `../${config.singular ? 'layout' : 'layouts'}/index`,
      type: 'javascript',
    });
    if (globalLayoutFile) {
      return [
        normalizeRoute(
          {
            path: '/',
            component: globalLayoutFile.path,
            routes,
          },
          opts,
        ),
      ];
    }
  }

  return routes;
}
