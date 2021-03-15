import { lodash, routeToChunkName } from '@umijs/utils';
import { IRoute } from './types';

interface IOpts {
  routes: IRoute[];
  config: any;
  cwd?: string;
  isServer?: boolean;
}

const SEPARATOR = '^^^';
const EMPTY_PATH = '_';

// TODO:
// 1. support dynamic import (and levels)
// 2. require().default -> import in production? (for tree-shaking)
export default function ({ routes, config, cwd, isServer }: IOpts) {
  // 因为要往 routes 里加无用的信息，所以必须 deep clone 一下，避免污染
  const clonedRoutes = lodash.cloneDeep(routes);

  if (config.dynamicImport) {
    patchRoutes(clonedRoutes);
  }

  function patchRoutes(routes: IRoute[]) {
    routes.forEach(patchRoute);
  }

  function patchRoute(route: IRoute) {
    if (route.component && !isFunctionComponent(route.component)) {
      const webpackChunkName = routeToChunkName({
        route,
        cwd,
      });
      // 解决 SSR 开启动态加载后，页面闪烁问题
      if (isServer && config?.dynamicImport) {
        route._chunkName = webpackChunkName;
      }
      route.component = [
        route.component,
        webpackChunkName,
        route.path || EMPTY_PATH,
      ].join(SEPARATOR);
    }
    if (route.routes) {
      patchRoutes(route.routes);
    }
  }

  function isFunctionComponent(component: string) {
    return (
      /^\((.+)?\)(\s+)?=>/.test(component) ||
      /^function([^\(]+)?\(([^\)]+)?\)([^{]+)?{/.test(component)
    );
  }

  function replacer(key: string, value: any) {
    switch (key) {
      case 'component':
        if (isFunctionComponent(value)) return value;
        if (config.dynamicImport) {
          const [component, webpackChunkName] = value.split(SEPARATOR);
          let loading = '';
          if (config.dynamicImport.loading) {
            loading = `, loading: LoadingComponent`;
          }
          // server routes can't using import() for avoiding OOM when `dynamicImport`
          return isServer
            ? `require('${component}').default`
            : `dynamic({ loader: () => import(/* webpackChunkName: '${webpackChunkName}' */'${component}')${loading}})`;
        } else {
          return `require('${value}').default`;
        }
      case 'wrappers':
        const wrappers = value.map((wrapper: string) => {
          if (config.dynamicImport) {
            let loading = '';
            if (config.dynamicImport.loading) {
              loading = `, loading: LoadingComponent`;
            }
            return isServer
              ? `require('${wrapper}').default`
              : `dynamic({ loader: () => import(/* webpackChunkName: 'wrappers' */'${wrapper}')${loading}})`;
          } else {
            return `require('${wrapper}').default`;
          }
        });
        return `[${wrappers.join(', ')}]`;
      default:
        return value;
    }
  }

  return JSON.stringify(clonedRoutes, replacer, 2)
    .replace(/\"component\": (\"(.+?)\")/g, (global, m1, m2) => {
      return `"component": ${m2.replace(/\^/g, '"')}`;
    })
    .replace(/\"wrappers\": (\"(.+?)\")/g, (global, m1, m2) => {
      return `"wrappers": ${m2.replace(/\^/g, '"')}`;
    })
    .replace(/\\r\\n/g, '\r\n')
    .replace(/\\n/g, '\r\n');
}

function lastSlash(str: string) {
  return str[str.length - 1] === '/' ? str : `${str}/`;
}
