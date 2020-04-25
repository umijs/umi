import { existsSync } from 'fs';
import { join } from 'path';
import { IApi, utils } from 'umi';
import { matchPath } from '@umijs/runtime';

const { signale } = utils;

const isDynamicRoute = (path: string): boolean =>
  !!path?.split('/')?.some?.(snippet => snippet.startsWith(':'));

export default (api: IApi) => {
  api.describe({
    key: 'exportStatic',
    config: {
      schema(joi) {
        return joi.object({
          htmlSuffix: joi.boolean(),
          dynamicRoot: joi.boolean(),
          // TODO
          extraRoutes: joi.array().items(joi.string()).description('extra Routes for dynamic routes'),
        });
      },
    },
  });

  api.modifyConfig((memo) => {
    if (memo.exportStatic?.dynamicRoot) {
      memo.runtimePublicPath = true;
    }
    return memo;
  });

  api.onPatchRoute(({ route }) => {
    if (!api.config.exportStatic?.htmlSuffix) return;
    if (route.path) {
      route.path = addHtmlSuffix(route.path, !!route.routes);
    }
  });

  api.onPatchRoutes(({ routes }) => {
    if (!api.config.exportStatic) return;
    // copy / to /index.html
    let rootIndex = null;
    routes.forEach((route, index) => {
      if (route.path === '/' && route.exact) {
        rootIndex = index;
      }
    });
    if (rootIndex !== null) {
      routes.splice(rootIndex, 0, {
        ...routes[rootIndex],
        path: '/index.html',
      });
    }
  });

  // modify export html using routes
  api.modifyRouteMap(async (memo, { html }) => {
    if (api.config.exportStatic) {
      const routeMap = await html.getRouteMap();
      return routeMap;
    }
    return memo;
  });

  api.modifyBuildContent(async (memo, { route }) => {
    const { absOutputPath } = api.paths;
    const serverFilePath = join(absOutputPath || '', 'umi.server.js');
    const { ssr } = api.config;
    if (ssr && existsSync(serverFilePath) && !isDynamicRoute(route.path || '')) {
      try {
        // do server-side render
        const render = require(serverFilePath);
        const { html }  = await render({
          path: route.path,
          htmlTemplate: memo,
        });
        signale.success(`${route.path} render success`);
        return html;
      } catch (e) {
        signale.fatal(`${route.path} render failed`, e);
        throw e;
      }
    }
    return memo;
  });

  function addHtmlSuffix(path: string, hasRoutes: boolean) {
    if (path === '/') return path;
    if (hasRoutes) {
      return path.endsWith('/') ? path : `${path}(.html)?`;
    } else {
      return path.endsWith('/') ? `${path.slice(0, -1)}.html` : `${path}.html`;
    }
  }
};
