import {
  addParentRoute,
  getConfigRoutes,
  getConventionRoutes,
} from '@umijs/core';
import { resolve, winPath } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
import { isAbsolute, join } from 'path';
import { IApi } from '../../types';

// get api routs
export async function getApiRoutes(opts: { api: IApi }) {
  const routes = getConventionRoutes({
    base: opts.api.paths.absApiRoutesPath,
    prefix: '',
  });

  function localPath(path: string) {
    if (path.charAt(0) !== '.') {
      return `./${path}`;
    }
    {
      return path;
    }
  }

  for (const id of Object.keys(routes)) {
    if (routes[id].file) {
      // TODO: cache for performance
      const file = isAbsolute(routes[id].file)
        ? routes[id].file
        : resolve.sync(localPath(routes[id].file), {
            basedir: opts.api.paths.absApiRoutesPath,
            extensions: ['.js', '.jsx', '.tsx', '.ts'],
          });
      routes[id].__content = readFileSync(file, 'utf-8');
    }
  }

  return routes;
}

// get route config
export async function getRoutes(opts: { api: IApi }) {
  let routes = null;
  if (opts.api.config.routes) {
    routes = getConfigRoutes({
      routes: opts.api.config.routes,
    });
  } else {
    routes = getConventionRoutes({
      base:
        opts.api.config.conventionRoutes?.base || opts.api.paths.absPagesPath,
      exclude: opts.api.config.conventionRoutes?.exclude,
      prefix: '',
    });
  }

  function localPath(path: string) {
    if (path.charAt(0) !== '.') {
      return `./${path}`;
    }
    {
      return path;
    }
  }

  for (const id of Object.keys(routes)) {
    if (routes[id].file) {
      // TODO: cache for performance
      const file = isAbsolute(routes[id].file)
        ? routes[id].file
        : resolve.sync(localPath(routes[id].file), {
            basedir:
              opts.api.config.conventionRoutes?.base ||
              opts.api.paths.absPagesPath,
            extensions: ['.js', '.jsx', '.tsx', '.ts'],
          });
      routes[id].__content = readFileSync(file, 'utf-8');
    }
  }

  // layout routes
  const absLayoutPath = join(opts.api.paths.absSrcPath, 'layouts/index.tsx');
  const layouts = await opts.api.applyPlugins({
    key: 'addLayouts',
    initialValue: [
      existsSync(absLayoutPath) && {
        id: '@@/global-layout',
        file: absLayoutPath,
      },
    ].filter(Boolean),
  });
  for (const layout of layouts) {
    addParentRoute({
      addToAll: true,
      target: {
        id: layout.id,
        path: '/',
        file: layout.file,
        parentId: undefined,
        absPath: '/',
      },
      routes,
      test: layout.test,
    });
  }

  // patch routes
  for (const id of Object.keys(routes)) {
    await opts.api.applyPlugins({
      key: 'onPatchRoute',
      args: {
        route: routes[id],
      },
    });
  }

  routes = await opts.api.applyPlugins({
    key: 'modifyRoutes',
    initialValue: routes,
  });

  return routes;
}

export async function getRouteComponents(opts: {
  routes: Record<string, any>;
  prefix: string;
}) {
  const imports = Object.keys(opts.routes)
    .map((key) => {
      const route = opts.routes[key];
      if (!route.file) {
        return `'${key}': () => import('./EmptyRoute'),`;
      }
      // e.g.
      // component: () => <h1>foo</h1>
      // component: (() => () => <h1>foo</h1>)()
      if (route.file.startsWith('(')) {
        return `'${key}': () => Promise.resolve(${route.file}),`;
      }
      const path =
        isAbsolute(route.file) || route.file.startsWith('@/')
          ? route.file
          : `${opts.prefix}${route.file}`;
      return `'${key}': () => import('${winPath(path)}'),`;
    })
    .join('\n');
  return `{\n${imports}\n}`;
}
