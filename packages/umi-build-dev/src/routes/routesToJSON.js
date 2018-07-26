import { join, relative } from 'path';
import isAbsolute from 'path-is-absolute';
import clone from 'lodash.clonedeep';
import winPath from '../winPath';
import normalizeEntry from '../normalizeEntry';

let targetLevel = null;
let level = 0;

export default (rawRoutes, service, requestedMap, env) => {
  // clone 一份数据，避免 patchRoute 修改到原始的 routes 配置
  const routes = clone(rawRoutes);

  if (process.env.CODE_SPLITTING_LEVEL) {
    targetLevel = process.env.CODE_SPLITTING_LEVEL;
  } else {
    targetLevel = 1;
    const rootRoute = routes.filter(route => route.path === '/')[0];
    if (rootRoute && rootRoute.routes) {
      targetLevel = 2;
    }
  }

  const { config, applyPlugins, paths } = service;

  patchRoutes(routes);

  const { loading } = config;
  let loadingOpts = '';
  if (loading) {
    loadingOpts = ` loading: require('${winPath(
      join(paths.cwd, loading),
    )}').default `;
  }

  return JSON.stringify(
    routes,
    (key, value) => {
      switch (key) {
        case 'component':
          if (value.startsWith('() =>')) {
            return value;
          }

          const [component, webpackChunkName, path] = value.split('^^');
          const importPath = isAbsolute(component)
            ? component
            : winPath(relative(paths.tmpDirPath, component));

          let ret;
          let isCompiling = false;
          const compilingPath = winPath(paths.absCompilingComponentPath);

          if (env === 'production' && !config.disableDynamicImport) {
            // 按需加载
            ret = `dynamic(() => import(/* webpackChunkName: ^${webpackChunkName}^ */'${importPath}'), {${loadingOpts}})`;
          } else {
            // 非按需加载
            if (
              env === 'production' ||
              // 无 socket 时按需编译体验很差，所以禁用
              process.env.SOCKET_SERVER === 'none' ||
              process.env.COMPILE_ON_DEMAND === 'none' ||
              !process.env.COMPILE_ON_DEMAND ||
              !path ||
              requestedMap[path]
            ) {
              ret = `require('${importPath}').default`;
            } else {
              isCompiling = true;
              let newPath = null;
              if (config.exportStatic && config.exportStatic.htmlSuffix) {
                newPath = path.replace('(.html)?', '');
              }
              ret = `() => React.createElement(require('${compilingPath}').default, { route: '${newPath ||
                path}' })`;
            }
          }

          if (applyPlugins) {
            ret = applyPlugins.call(service, 'modifyRouteComponent', {
              initialValue: ret,
              args: {
                isCompiling,
                pageJSFile: importPath,
                importPath,
                webpackChunkName,
                config,
              },
            });
          }

          return ret;
        case 'Route':
          return `require('${winPath(join(paths.cwd, value))}').default`;
        default:
          return value;
      }
    },
    2,
  );
};

function patchRoutes(routes, webpackChunkName) {
  level += 1;
  routes.forEach(route => {
    patchRoute(route, webpackChunkName);
  });
  level -= 1;
}

function patchRoute(route, webpackChunkName) {
  if (route.component && !route.component.startsWith('() =>')) {
    if (!webpackChunkName || level <= targetLevel) {
      webpackChunkName = normalizeEntry(route.component || 'common_component');
    }
    route.component = [
      route.component || 'common_component',
      webpackChunkName,
      route.path,
    ].join('^^');
  }
  if (route.routes) {
    // 只在一级路由做按需编译
    patchRoutes(route.routes, webpackChunkName);
  }
}
