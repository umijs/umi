import { getConventionRoutes } from '@umijs/core';

// get route config
export async function getRoutes(opts: { base: string }) {
  const routes = getConventionRoutes({
    base: opts.base,
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
      return `'${key}': () => import('${opts.prefix}${route.file}'),`;
    })
    .join('\n');
  return `{\n${imports}\n}`;
}
