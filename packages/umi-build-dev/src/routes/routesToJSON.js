import { join, relative } from 'path';
import isAbsolute from 'path-is-absolute';
import winPath from '../winPath';
import normalizeEntry from '../normalizeEntry';

let targetLevel = null;
let level = 0;

export default (routes, service, env) => {
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

  // TODO: 这里和 umi-plugin-react 强绑定了
  let loadingOpts = '';
  if (config.react && config.react.loadingComponent) {
    loadingOpts = ` loading: require('${winPath(
      join(paths.absSrcPath, config.react.loadingComponent),
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

          // TODO: 这里强依赖了 umi-plugin-react 的配置项
          if (
            env === 'production' &&
            config.react &&
            config.react.dynamicImport
          ) {
            // 按需加载
            ret = `dynamic(() => import(/* webpackChunkName: ^${webpackChunkName}^ */'${importPath}'), {${loadingOpts}})`;
          } else {
            // 非按需加载
            ret = `require('${importPath}').default`;
          }

          if (applyPlugins) {
            ret = applyPlugins.call(service, 'modifyRouteComponent', {
              initialValue: ret,
              args: {
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
