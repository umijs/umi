import { lodash, winPath } from '@umijs/utils';
import { IRoute } from './types';

interface IOpts {
  routes: IRoute[];
  config: any;
  cwd?: string;
}

const SEPARATOR = '^^^';
const EMPTY_PATH = '_';

// TODO:
// 1. support dynamic import (and levels)
// 2. require().default -> import in production? (for tree-shaking)
export default function({ routes, config, cwd }: IOpts) {
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
      const webpackChunkName = route.component
        .replace(new RegExp(`^${lastSlash(winPath(cwd || '/'))}`), '')
        .replace(/^.(\/|\\)/, '')
        .replace(/(\/|\\)/g, '__')
        .replace(/\.jsx?$/, '')
        .replace(/\.tsx?$/, '')
        .replace(/^src__/, '')
        .replace(/^pages__/, 'p__')
        .replace(/^page__/, 'p__');
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
          const [component, webpackChunkName, path] = value.split(SEPARATOR);
          let loading = '';
          if (config.dynamicImport.loading) {
            loading = `, loading: require('${config.dynamicImport.loading}').default`;
          }
          return `dynamic({ loader: () => import(/* webpackChunkName: '${webpackChunkName}' */'${component}')${loading}})`;
        } else {
          return `require('${value}').default`;
        }
      case 'wrappers':
        const wrappers = value.map((wrapper: string) => {
          return `require('${wrapper}').default`;
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
