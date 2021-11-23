import {
  addParentRoute,
  getConfigRoutes,
  getConventionRoutes,
} from '@umijs/core';
import { winPath } from '@umijs/utils';
import { existsSync } from 'fs';
import { isAbsolute, join } from 'path';
import { IApi } from '../../types';

// get route config
export async function getRoutes(opts: { api: IApi }) {
  let routes = null;
  if (opts.api.config.routes) {
    routes = getConfigRoutes({
      routes: opts.api.config.routes,
    });
  } else {
    routes = getConventionRoutes({
      base: opts.api.paths.absPagesPath,
      prefix: '',
    });
  }

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
      },
      routes,
    });
  }
  return routes;
}

export async function getRouteComponents(opts: {
  routes: Record<string, any>;
  prefix: string;
}) {
  const imports = Object.keys(opts.routes)
    .map((key) => {
      const route = opts.routes[key];
      if (!route.file) return `// ${key}: no file to import`;
      // TODO: support alias
      const path =
        isAbsolute(route.file) || route.file.startsWith('@/')
          ? route.file
          : `${opts.prefix}${route.file}`;
      return `'${key}': () => import('${winPath(path)}'),`;
    })
    .join('\n');
  return `{\n${imports}\n}`;
}
