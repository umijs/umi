import { lodash } from '@umijs/utils';
import { IRoute } from './types';

interface IOpts {
  routes: IRoute[];
}

const SEPARATOR = '^^^';

// TODO:
// 1. support dynamic import (and levels)
// 2. require().default -> import in production? (for tree-shaking)
// 3. support Routes?
export default function({ routes }: IOpts) {
  // 因为要往 routes 里加无用的信息，所以必须 deep clone 一下，避免污染
  const clonedRoutes = lodash.cloneDeep(routes);

  function replacer(key: string, value: string) {
    switch (key) {
      case 'component':
        if (/^\((.+)?\)(\s+)?=>/.test(value)) {
          return value;
        }
        if (/^function([^\(]+)?\(([^\)]+)?\)([^{]+)?{/.test(value)) {
          return value;
        }
        return `require('${value}').default`;
      default:
        return value;
    }
  }

  return JSON.stringify(clonedRoutes, replacer, 2)
    .replace(/\"component\": (\"(.+?)\")/g, (global, m1, m2) => {
      return `"component": ${m2.replace(/\^/g, '"')}`;
    })
    .replace(/\\r\\n/g, '\r\n')
    .replace(/\\n/g, '\r\n');
}
