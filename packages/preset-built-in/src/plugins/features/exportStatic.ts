import { existsSync } from 'fs';
import { join } from 'path';
import { IApi, IRoute } from '@umijs/types';
import { deepmerge, lodash, rimraf } from '@umijs/utils';
import pathToRegexp from 'path-to-regexp';

import { isDynamicRoute } from '../utils';

export default (api: IApi) => {
  api.describe({
    key: 'exportStatic',
    config: {
      schema(joi) {
        return joi.object({
          htmlSuffix: joi.boolean(),
          dynamicRoot: joi.boolean(),
          // 不能通过直接 patch 路由的方式，拿不到 match.[id]，是一个 render paths 的概念
          extraPaths: joi
            .function()
            .description('extra render paths only enable in ssr'),
        });
      },
    },
    enableBy: api.EnableBy.config,
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
    if (api.env === 'production') {
      const routeMap = await html.getRouteMap();
      const { exportStatic } = api.config;
      // for dynamic routes
      // TODO: test case
      if (lodash.isFinite(exportStatic?.extraPaths)) {
        const extraPaths = await exportStatic?.extraPaths();
        extraPaths?.forEach((path) => {
          const match = routeMap.find(({ route }: { route: IRoute }) => {
            return route.path && pathToRegexp(route.path).exec(path);
          });
          if (match) {
            const newPath = deepmerge(match, {
              route: {
                path,
              },
              file: html.getHtmlPath(path),
            });
            routeMap.push(newPath);
          }
        });
      }
      return routeMap;
    }
    return memo;
  });

  api.modifyBuildContent(async (memo, { route }) => {
    if (api.env === 'production') {
      const { absOutputPath } = api.paths;
      const serverFilePath = join(absOutputPath || '', 'umi.server.js');
      const { ssr } = api.config;
      if (ssr && existsSync(serverFilePath) && !isDynamicRoute(route!.path)) {
        try {
          // do server-side render
          const render = require(serverFilePath);
          const { html } = await render({
            path: route.path,
            htmlTemplate: memo,
          });
          api.logger.info(`${route.path} render success`);
          return html;
        } catch (e) {
          api.logger.error(`${route.path} render failed`, e);
          throw e;
        }
      }
    }
    return memo;
  });

  api.onBuildComplete(({ err }) => {
    if (!err && api.config?.ssr && process.env.RM_SERVER_FILE !== 'none') {
      // remove umi.server.js
      const { absOutputPath } = api.paths;
      const serverFilePath = join(absOutputPath || '', 'umi.server.js');
      if (existsSync(serverFilePath)) {
        rimraf.sync(serverFilePath);
      }
    }
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
