import {
  addParentRoute,
  getConfigRoutes,
  getConventionRoutes,
} from '@umijs/core';
import { isMonorepo, lodash, resolve, tryPaths, winPath } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
import { isAbsolute, join } from 'path';
import { IApi } from '../../types';
import { getModuleExports } from './getModuleExports';

// get api routes
export async function getApiRoutes(opts: { api: IApi }) {
  const routes = getConventionRoutes({
    base: opts.api.paths.absApiRoutesPath,
    prefix: '',
  });

  function localPath(path: string) {
    if (path.charAt(0) !== '.') {
      return `./${path}`;
    }
    {
      return path;
    }
  }

  for (const id of Object.keys(routes)) {
    if (routes[id].file) {
      // TODO: cache for performance
      const file = isAbsolute(routes[id].file)
        ? routes[id].file
        : resolve.sync(localPath(routes[id].file), {
            basedir: opts.api.paths.absApiRoutesPath,
            extensions: ['.js', '.jsx', '.tsx', '.ts'],
          });
      routes[id].__content = readFileSync(file, 'utf-8');
    }
  }

  return routes;
}

// get route config
export async function getRoutes(opts: {
  api: IApi;
}): Promise<Record<string, any>> {
  let routes = null;
  if (opts.api.config.routes) {
    routes = getConfigRoutes({
      routes: opts.api.config.routes,
      onResolveComponent(component) {
        if (isAbsolute(component)) {
          return component;
        }
        if (component.startsWith('@/')) {
          component = component.replace('@/', '../');
        }
        component = winPath(
          resolve.sync(localPath(component), {
            basedir: opts.api.paths.absPagesPath,
            extensions: ['.js', '.jsx', '.tsx', '.ts', '.vue'],
          }),
        );
        component = component.replace(
          winPath(`${opts.api.paths.absSrcPath}/`),
          '@/',
        );
        return component;
      },
    });
  } else {
    routes = getConventionRoutes({
      base:
        opts.api.config.conventionRoutes?.base || opts.api.paths.absPagesPath,
      exclude: opts.api.config.conventionRoutes?.exclude,
      prefix: '',
    });
  }

  function localPath(path: string) {
    if (path.charAt(0) !== '.') {
      return `./${path}`;
    } else {
      return path;
    }
  }

  // layout routes
  const absLayoutPath =
    opts.api.config?.conventionLayout === false
      ? false
      : tryPaths([
          join(opts.api.paths.absSrcPath, 'layouts/index.tsx'),
          join(opts.api.paths.absSrcPath, 'layouts/index.vue'),
          join(opts.api.paths.absSrcPath, 'layouts/index.jsx'),
          join(opts.api.paths.absSrcPath, 'layouts/index.js'),
        ]);

  const layouts = await opts.api.applyPlugins({
    key: 'addLayouts',
    initialValue: [
      absLayoutPath && {
        id: '@@/global-layout',
        file: winPath(absLayoutPath),
        test(route: any) {
          return route.layout !== false;
        },
      },
    ].filter(Boolean),
  });
  for (const layout of layouts) {
    addParentRoute({
      addToAll: true,
      target: {
        id: layout.id,
        path: '/',
        file: layout.file,
        parentId: undefined,
        absPath: '/',
        isLayout: true,
      },
      routes,
      test: layout.test,
    });
  }

  // collect ssr info
  for (const id of Object.keys(routes)) {
    if (routes[id].file) {
      // TODO: cache for performance
      let file = routes[id].file;
      const basedir =
        opts.api.config.conventionRoutes?.base || opts.api.paths.absPagesPath;

      if (!isAbsolute(file)) {
        if (file.startsWith('@/')) {
          file = file.replace('@/', '../');
        }
        file = resolve.sync(localPath(file), {
          basedir,
          extensions: ['.js', '.jsx', '.tsx', '.ts', '.vue'],
        });
      }

      const isJSFile = /.[jt]sx?$/.test(file);
      // layout route 这里不需要这些属性
      if (!routes[id].isLayout) {
        routes[id].__content = readFileSync(file, 'utf-8');
        routes[id].__isJSFile = isJSFile;
      }
      routes[id].__absFile = winPath(file);

      const enableSSR = opts.api.config.ssr;
      const enableClientLoader = opts.api.config.clientLoader;
      const enableRouteProps = !opts.api.userConfig.routes;
      const needCollectExports =
        enableSSR || enableClientLoader || enableRouteProps;
      if (needCollectExports) {
        const exports =
          isJSFile && existsSync(file)
            ? await getModuleExports({
                file,
              })
            : [];
        if (enableSSR) {
          routes[id].hasServerLoader = exports.includes('serverLoader');
          routes[id].hasMetadataLoader = exports.includes('metadataLoader');
        }
        if (enableClientLoader && exports.includes('clientLoader')) {
          routes[id].clientLoader = `clientLoaders['${id}']`;
        }
        if (enableRouteProps && exports.includes('routeProps')) {
          routes[id].routeProps = `routeProps['${id}']`;
        }
      }
    }
  }

  // patch routes
  for (const id of Object.keys(routes)) {
    await opts.api.applyPlugins({
      key: 'onPatchRoute',
      args: {
        route: routes[id],
      },
    });
  }

  routes = await opts.api.applyPlugins({
    key: 'modifyRoutes',
    initialValue: routes,
  });

  return routes;
}

export async function getRouteComponents(opts: {
  routes: Record<string, any>;
  prefix: string;
  api: IApi;
}) {
  const imports = Object.keys(opts.routes)
    .map((key) => {
      const useSuspense = opts.api.appData.framework === 'react' ? true : false; // opts.api.appData.react.version.startsWith('18.');
      const route = opts.routes[key];
      if (!route.file) {
        // 测试环境还不支持 import ，所以用 require
        if (process.env.NODE_ENV === 'test') {
          return `'${key}': require( './EmptyRoute').default,`;
        }
        return useSuspense
          ? `'${key}': React.lazy(() => import( './EmptyRoute')),`
          : `'${key}': () => import( './EmptyRoute'),`;
      }
      if (route.hasClientLoader) {
        route.file = join(
          opts.api.paths.absTmpPath,
          'pages',
          route.id.replace(/[\/\-]/g, '_') + '.js',
        );
      }
      // e.g.
      // component: () => <h1>foo</h1>
      // component: (() => () => <h1>foo</h1>)()
      if (route.file.startsWith('(')) {
        return useSuspense
          ? // Compatible with none default route exports
            // e.g. https://github.com/umijs/umi/blob/0d40a07bf28b0760096cbe2f22da4d639645b937/packages/plugins/src/qiankun/master.ts#L55
            `'${key}': React.lazy(
              () => Promise.resolve(${route.file}).then(e => e?.default ? e : ({ default: e }))
            ),`
          : `'${key}': () => Promise.resolve(${route.file}),`;
      }

      const path =
        isAbsolute(route.file) || route.file.startsWith('@/')
          ? route.file
          : `${opts.prefix}${route.file}`;

      const webpackChunkName = componentToChunkName(path, opts.api.cwd);

      // 测试环境还不支持 import ，所以用 require
      if (process.env.NODE_ENV === 'test') {
        return `'${key}': require('${winPath(path)}').default,`;
      }

      // ref: https://github.com/umijs/umi/issues/11466
      if (opts.api.config.routeLoader?.moduleType === 'cjs') {
        return useSuspense
          ? `'${key}': React.lazy(() => Promise.resolve(require('${winPath(
              path,
            )}'))),`
          : `'${key}': () => Promise.resolve(require('${winPath(path)}')),`;
      }
      return useSuspense
        ? `'${key}': React.lazy(() => import(/* webpackChunkName: "${webpackChunkName}" */'${winPath(
            path,
          )}')),`
        : `'${key}': () => import(/* webpackChunkName: "${webpackChunkName}" */'${winPath(
            path,
          )}'),`;
    })
    .join('\n');
  return `{\n${imports}\n}`;
}

function lastSlash(str: string) {
  return str[str.length - 1] === '/' ? str : `${str}/`;
}

function getProjectRootCwd(cwd: string) {
  const splittedCwd = cwd.split('/');

  // try to find root cwd for monorepo project, only support >= 3 level depth
  for (let level = -1; level >= -3; level -= 1) {
    const rootCwd = splittedCwd.slice(0, level).join('/');

    // break if no parent dir
    if (!rootCwd) break;

    // check monorepo for parent dir
    if (isMonorepo({ root: rootCwd })) {
      return rootCwd;
    }
  }

  return cwd;
}

/**
 *
 * transform component into webpack chunkName
 * @export
 * @param {string} component component path
 * @param {string} [cwd] current root path
 * @return {*}  {string}
 */
export function componentToChunkName(
  component: string,
  cwd: string = '/',
): string {
  cwd = winPath(cwd);

  return typeof component === 'string'
    ? component
        .replace(
          new RegExp(
            `^(${
              // match app cwd first
              lodash.escapeRegExp(lastSlash(cwd))
            }|${
              // then try to match monorepo root cwd, because route files may be in root node_modules (such as dumi)
              lodash.escapeRegExp(lastSlash(getProjectRootCwd(cwd)))
            })`,
          ),
          '',
        )
        // 丢弃 .pnpm 下的多层 node_modules 避免 chunkName 过长
        // ex. node_modules/.pnpm/dumi@2.1.19_xxxx/node_modules/dumi/dist/client/pages/404
        .replace(/.+(node_modules(\/|\\))/, '$1')
        // 丢弃 tnpm 目录下的软链结构避免 chunkName 过长
        // ex. node_modules/_@umijs_utils@4.0.83@@umijs/utils/dist/index.js
        .replace(/(\/|\\)_@?([^@]+@){2}/, '$1')
        .replace(/^.(\/|\\)/, '')
        .replace(/(\/|\\)/g, '__')
        // 转换 node_modules 目录中的 @ 符号，它在 URL 上会被转义，可能导致 CDN 托管失败
        .replace(/@/g, '_')
        .replace(/\.jsx?$/, '')
        .replace(/\.tsx?$/, '')
        .replace(/\.vue?$/, '')
        .replace(/^src__/, '')
        .replace(/\.\.__/g, '')
        // 约定式路由的 [ 会导致 webpack 的 code splitting 失败
        // ref: https://github.com/umijs/umi/issues/4155
        .replace(/[\[\]]/g, '')
        // node_modules 文件名在 gh-pages 是默认忽略的，会导致访问 404
        .replace(/^node_modules__/, 'nm__')
        // 插件层的文件也可能是路由组件，比如 plugin-layout 插件
        .replace(/^.umi-production__/, 't__')
        // 避免产出隐藏文件（比如 .dumi/theme）下的路由组件
        .replace(/^\./, '')
        .replace(/^pages__/, 'p__')
    : '';
}
