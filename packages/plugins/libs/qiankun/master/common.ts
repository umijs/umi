// @ts-nocheck
/* eslint-disable */
/**
 * @author Kuitos
 * @since 2019-06-20
 */

import React from 'react';
import { Navigate, type IRouteProps } from 'umi';
import { defaultMicroAppRouteMode, MicroAppRouteMode } from './constants';
import { getMicroAppRouteComponent } from './getMicroAppRouteComponent';
import type { MicroAppRoute } from './types';

export const defaultMountContainerId = 'root-subapp';

// @formatter:off
export const noop = () => {};
// @formatter:on

export function toArray<T>(source: T | T[]): T[] {
  return Array.isArray(source) ? source : [source];
}

function testPathWithStaticPrefix(pathPrefix: string, realPath: string) {
  if (pathPrefix.endsWith('/')) {
    return realPath.startsWith(pathPrefix);
  }

  const pathRegex = new RegExp(`^${pathPrefix}([/?])+.*$`, 'g');
  const normalizedPath = `${realPath}/`;
  return pathRegex.test(normalizedPath);
}

// function testPathWithDynamicRoute(dynamicRoute: string, realPath: string) {
//   // FIXME 这个是旧的使用方式才会调到的 api，先临时这么苟一下消除报错，引导用户去迁移吧
//   const pathToRegexp = require('path-to-regexp');
//   return pathToRegexp(dynamicRoute, { strict: true, end: false }).test(
//     realPath,
//   );
// }
//
// export function testPathWithPrefix(pathPrefix: string, realPath: string) {
//   return (
//     testPathWithStaticPrefix(pathPrefix, realPath) ||
//     testPathWithDynamicRoute(pathPrefix, realPath)
//   );
// }

export function patchMicroAppRoute(
  route: MicroAppRoute,
  masterOptions: {
    base: string;
    masterHistoryType: string;
    routeBindingAlias: string;
  },
) {
  const { base, masterHistoryType, routeBindingAlias } = masterOptions;
  // 当配置了 routeBindingAlias 时，优先从 routeBindingAlias 里取配置，但同时也兼容使用了默认的 microApp 方式
  const microAppName = route[routeBindingAlias] || route.microApp;
  const microAppProps =
    route[`${routeBindingAlias}Props`] || route.microAppProps || {};
  if (microAppName) {
    if (route.children?.length) {
      const childrenRouteHasComponent = route.children.some(
        (r: any) => r.element,
      );
      if (childrenRouteHasComponent) {
        throw new Error(
          `[@umijs/plugin-qiankun]: You can not attach micro app ${microAppName} to route ${route.path} whose children has own component!`,
        );
      }
    }

    const { mode = defaultMicroAppRouteMode } = route;
    // 在前缀模式下，自动追加通配符，匹配子应用的路由
    if (mode === MicroAppRouteMode.PREPEND && !route.path.endsWith('/*')) {
      route.path = route.path.replace(/\/?$/, '/*');
    }

    const { settings = {}, ...componentProps } = microAppProps;
    const routeProps = {
      // 兼容以前的 settings 配置
      settings: route.settings || settings || {},
      ...componentProps,
    };
    const opts = {
      appName: microAppName,
      base,
      routePath: route.path,
      routeMode: route.mode,
      masterHistoryType,
      routeProps,
    };
    route.element = React.createElement(getMicroAppRouteComponent(opts), null);
  } else if (route.redirect) {
    // patchClientRoutes 插入的 redirect 不会被转换，所以这里需要手动处理成重定向组件
    route.element = React.createElement(Navigate, {
      to: route.redirect,
      replace: true,
    });
  }
}

const recursiveSearch = (
  routes: IRouteProps[],
  path: string,
  parentPath: string,
): [IRouteProps, IRouteProps[], number, string] | null => {
  for (let i = 0; i < routes.length; i++) {
    if (routes[i].path === path) {
      return [routes[i], routes, i, parentPath];
    }
    if (routes[i].children && routes[i].children?.length) {
      const found = recursiveSearch(
        routes[i].children || [],
        path,
        routes[i].path,
      );
      if (found) {
        return found;
      }
    }
  }
  return null;
};

export function insertRoute(routes: IRouteProps[], microAppRoute: IRouteProps) {
  const mod =
    microAppRoute.appendChildTo || microAppRoute.insert
      ? 'appendChildTo'
      : microAppRoute.insertBefore
      ? 'insertBefore'
      : undefined;
  const target =
    microAppRoute.appendChildTo ||
    microAppRoute.insert ||
    microAppRoute.insertBefore;
  const [found, foundParentRoutes = [], index = 0, parentPath] =
    recursiveSearch(routes, target, '/') || [];
  if (found) {
    switch (mod) {
      case 'appendChildTo':
        if (
          !microAppRoute.path ||
          !found.path ||
          !microAppRoute.path.startsWith(found.path)
        ) {
          throw new Error(
            `[plugin-qiankun]: path "${microAppRoute.path}" need to starts with "${found.path}"`,
          );
        }
        found.exact = false;
        found.children = found.children || [];
        found.children.push(microAppRoute);
        break;
      case 'insertBefore':
        if (
          !microAppRoute.path ||
          !found.path ||
          !microAppRoute.path.startsWith(parentPath)
        ) {
          throw new Error(
            `[plugin-qiankun]: path "${microAppRoute.path}" need to starts with "${parentPath}"`,
          );
        }
        foundParentRoutes.splice(index, 0, microAppRoute);
        break;
    }
  } else {
    throw new Error(`[plugin-qiankun]: path "${target}" not found`);
  }
}
