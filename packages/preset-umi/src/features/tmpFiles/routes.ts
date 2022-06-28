import {
  addParentRoute,
  getConfigRoutes,
  getConventionRoutes,
} from '@umijs/core';
import { resolve, tryPaths, winPath } from '@umijs/utils';
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
      routes[id].__content = readFileSync(file, 'utf-8');
      routes[id].__absFile = winPath(file);
      routes[id].__isJSFile = isJSFile;
      if (opts.api.config.ssr || opts.api.config.clientLoader) {
        routes[id].__exports =
          isJSFile && existsSync(file)
            ? await getModuleExports({
                file,
              })
            : [];
      }
      if (opts.api.config.ssr) {
        routes[id].hasServerLoader =
          routes[id].__exports.includes('serverLoader');
      }
      if (opts.api.config.clientLoader) {
        routes[id].__hasClientLoader =
          routes[id].__exports.includes('clientLoader');
        routes[id].clientLoader = `clientLoaders['${id}']`;
      }
    }
  }

  // layout routes
  const absSrcPath = opts.api.paths.absSrcPath;

  const absLayoutPath = tryPaths([
    join(opts.api.paths.absSrcPath, 'layouts/index.tsx'),
    join(opts.api.paths.absSrcPath, 'layouts/index.vue'),
    join(opts.api.paths.absSrcPath, 'layouts/index.jsx'),
    join(opts.api.paths.absSrcPath, 'layouts/index.js'),
  ]);

  const layouts = (
    await opts.api.applyPlugins({
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
    })
  ).map((layout: { file: string }) => {
    // prune local path prefix, avoid mix in outputs
    layout.file = layout.file.replace(
      new RegExp(`^${winPath(absSrcPath)}`),
      '@',
    );
    return layout;
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

      return useSuspense
        ? `'${key}': React.lazy(() => import(/* webpackChunkName: "${key.replace(
            /[\/-]/g,
            '_',
          )}" */'${winPath(path)}')),`
        : `'${key}': () => import(/* webpackChunkName: "${key.replace(
            /[\/-]/g,
            '_',
          )}" */'${winPath(path)}'),`;
    })
    .join('\n');
  return `{\n${imports}\n}`;
}
