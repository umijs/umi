import { escapeRegExp } from '@umijs/deps/compiled/lodash';
import winPath from './winPath/winPath';

function lastSlash(str: string) {
  return str[str.length - 1] === '/' ? str : `${str}/`;
}

interface IOpts {
  route: any;
  cwd?: string;
}
type IRouteToChunkName = (opts: IOpts) => string | undefined;

/**
 * transform route component into webpack chunkName
 * @param param0
 */
export const routeToChunkName: IRouteToChunkName = (
  { route, cwd } = { route: {} },
) => {
  return typeof route.component === 'string'
    ? route.component
        .replace(
          new RegExp(`^${escapeRegExp(lastSlash(winPath(cwd || '/')))}`),
          '',
        )
        .replace(/^.(\/|\\)/, '')
        .replace(/(\/|\\)/g, '__')
        .replace(/\.jsx?$/, '')
        .replace(/\.tsx?$/, '')
        .replace(/^src__/, '')
        .replace(/\.\.__/g, '')
        // 约定式路由的 [ 会导致 webpack 的 code splitting 失败
        // ref: https://github.com/umijs/umi/issues/4155
        .replace(/[\[\]]/g, '')
        // 插件层的文件也可能是路由组件，比如 plugin-layout 插件
        .replace(/^.umi-production__/, 't__')
        .replace(/^pages__/, 'p__')
        .replace(/^page__/, 'p__')
    : '';
};
