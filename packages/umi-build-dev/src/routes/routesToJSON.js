import { join, relative } from 'path';
import winPath from '../winPath';
import normalizeEntry from '../normalizeEntry';

export default (routes, service, requestedMap, env) => {
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
          const importPath =
            component.charAt(0) === '/'
              ? component
              : winPath(relative(paths.tmpDirPath, component));

          let ret;
          let isCompiling = false;
          const compilingPath = winPath(paths.absCompilingComponentPath);

          if (env === 'production' && !config.disabledynamicimport) {
            // 按需加载
            ret = `dynamic(() => import(/* webpackChunkName: ^${webpackChunkName}^ */'${importPath}'), {${loadingOpts}})`;
          } else {
            // 非按需加载
            if (
              env === 'production' ||
              // 无 socket 时按需编译体验很差，所以禁用
              process.env.SOCKET_SERVER === 'none' ||
              process.env.COMPILE_ON_DEMAND === 'none' ||
              !path ||
              requestedMap[path]
            ) {
              ret = `require('${importPath}').default`;
            } else {
              isCompiling = true;
              ret = `() => React.createElement(require('${compilingPath}').default, { route: '${path}' })`;
            }
          }

          if (applyPlugins) {
            applyPlugins.call(service, 'modifyRouteComponent', {
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
  routes.forEach(route => {
    patchRoute(route, webpackChunkName);
  });
}

function patchRoute(route, webpackChunkName) {
  if (route.component && !route.component.startsWith('() =>')) {
    if (!webpackChunkName) {
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
