import { addParentRoute, getConventionRoutes } from '@umijs/core';
import { existsSync } from 'fs';
import { isAbsolute, join } from 'path';

// get route config
export async function getRoutes(opts: {
  config: Record<string, any>;
  absSrcPage: string;
  absPagesPath: string;
}) {
  let routes = null;
  if (opts.config.routes) {
    // TODO: support config routes
  } else {
    routes = getConventionRoutes({ base: opts.absPagesPath });
  }

  const absLayoutPath = join(opts.absSrcPage, 'layouts/index.tsx');
  if (existsSync(absLayoutPath)) {
    addParentRoute({
      addToAll: true,
      target: {
        id: '@@/global-layout',
        path: '/',
        file: absLayoutPath,
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
      // TODO: support alias
      const path = isAbsolute(route.file)
        ? route.file
        : `${opts.prefix}${route.file}`;
      return `'${key}': () => import('${path}'),`;
    })
    .join('\n');
  return `{\n${imports}\n}`;
}
