import { importLazy, lodash, winPath } from '@umijs/utils';
import { existsSync, readdirSync } from 'fs';
import { basename, dirname, join } from 'path';
import { RUNTIME_TYPE_FILE_NAME } from 'umi';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import { getModuleExports } from './getModuleExports';
import { importsToStr } from './importsToStr';

const routesApi: typeof import('./routes') = importLazy(
  require.resolve('./routes'),
);

export default (api: IApi) => {
  const umiDir = process.env.UMI_DIR!;

  api.describe({
    key: 'tmpFiles',
    config: {
      schema({ zod }) {
        return zod.boolean();
      },
    },
  });

  api.onGenerateFiles(async (opts) => {
    const rendererPath = winPath(
      await api.applyPlugins({
        key: 'modifyRendererPath',
        initialValue: dirname(
          require.resolve('@umijs/renderer-react/package.json'),
        ),
      }),
    );
    const serverRendererPath = winPath(
      await api.applyPlugins({
        key: 'modifyServerRendererPath',
        initialValue: join(rendererPath, 'dist/server.js'),
      }),
    );

    // tsconfig.json
    const frameworkName = api.service.frameworkName;
    const srcPrefix = api.appData.hasSrcDir ? 'src/' : '';
    const umiTempDir = `${srcPrefix}.${frameworkName}`;
    const baseUrl = api.appData.hasSrcDir ? '../../' : '../';
    const isTs5 = api.appData.typescript.tsVersion?.startsWith('5');
    const isTslibInstalled = !!api.appData.typescript.tslibVersion;

    // x 1、basic config
    // x 2、alias
    // 3、language service platform
    // 4、typing
    let umiTsConfig = {
      compilerOptions: {
        target: 'esnext',
        module: 'esnext',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        moduleResolution: isTs5 ? 'bundler' : 'node',
        importHelpers: isTslibInstalled,
        noEmit: true,
        jsx: api.appData.framework === 'vue' ? 'preserve' : 'react-jsx',
        esModuleInterop: true,
        sourceMap: true,
        baseUrl,
        strict: true,
        resolveJsonModule: true,
        allowSyntheticDefaultImports: true,

        // Supported by vue only
        ...(api.appData.framework === 'vue'
          ? {
              // TODO Actually, it should be vite mode, but here it is written as vue only
              // Required in Vite https://vitejs.dev/guide/features.html#typescript
              isolatedModules: true,
            }
          : {}),

        paths: {
          '@/*': [`${srcPrefix}*`],
          '@@/*': [`${umiTempDir}/*`],
          [`${api.appData.umi.importSource}`]: [umiDir],
          [`${api.appData.umi.importSource}/typings`]: [
            `${umiTempDir}/typings`,
          ],
          ...(api.config.vite
            ? {
                '@fs/*': ['*'],
              }
            : {}),
        },
      },
      include: [
        `${baseUrl}.${frameworkName}rc.ts`,
        `${baseUrl}**/*.d.ts`,
        `${baseUrl}**/*.ts`,
        `${baseUrl}**/*.tsx`,
        api.appData.framework === 'vue' && `${baseUrl}**/*.vue`,
      ].filter(Boolean),
    };

    umiTsConfig = await api.applyPlugins({
      key: 'modifyTSConfig',
      type: api.ApplyPluginsType.modify,
      initialValue: umiTsConfig,
    });

    api.writeTmpFile({
      noPluginDir: true,
      path: 'tsconfig.json',
      content: JSON.stringify(umiTsConfig, null, 2),
    });

    // typings.d.ts
    // ref: https://github.com/vitejs/vite/blob/main/packages/vite/client.d.ts
    api.writeTmpFile({
      noPluginDir: true,
      path: 'typings.d.ts',
      content: `
type CSSModuleClasses = { readonly [key: string]: string }
declare module '*.css' {
  const classes: CSSModuleClasses
  export default classes
}
declare module '*.scss' {
  const classes: CSSModuleClasses
  export default classes
}
declare module '*.sass' {
  const classes: CSSModuleClasses
  export default classes
}
declare module '*.less' {
  const classes: CSSModuleClasses
  export default classes
}
declare module '*.styl' {
  const classes: CSSModuleClasses
  export default classes
}
declare module '*.stylus' {
  const classes: CSSModuleClasses
  export default classes
}

// images
declare module '*.jpg' {
  const src: string
  export default src
}
declare module '*.jpeg' {
  const src: string
  export default src
}
declare module '*.png' {
  const src: string
  export default src
}
declare module '*.gif' {
  const src: string
  export default src
}
declare module '*.svg' {
  ${
    api.config.svgr
      ? `
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<
  SVGSVGElement
  > & { title?: string }>;
`.trimStart()
      : ''
  }
  const src: string
  export default src
}
declare module '*.ico' {
  const src: string
  export default src
}
declare module '*.webp' {
  const src: string
  export default src
}
declare module '*.avif' {
  const src: string
  export default src
}

// media
declare module '*.mp4' {
  const src: string
  export default src
}
declare module '*.webm' {
  const src: string
  export default src
}
declare module '*.ogg' {
  const src: string
  export default src
}
declare module '*.mp3' {
  const src: string
  export default src
}
declare module '*.wav' {
  const src: string
  export default src
}
declare module '*.flac' {
  const src: string
  export default src
}
declare module '*.aac' {
  const src: string
  export default src
}

// fonts
declare module '*.woff' {
  const src: string
  export default src
}
declare module '*.woff2' {
  const src: string
  export default src
}
declare module '*.eot' {
  const src: string
  export default src
}
declare module '*.ttf' {
  const src: string
  export default src
}
declare module '*.otf' {
  const src: string
  export default src
}

// other
declare module '*.wasm' {
  const initWasm: (options: WebAssembly.Imports) => Promise<WebAssembly.Exports>
  export default initWasm
}
declare module '*.webmanifest' {
  const src: string
  export default src
}
declare module '*.pdf' {
  const src: string
  export default src
}
declare module '*.txt' {
  const src: string
  export default src
}
`.trimEnd(),
    });

    // umi.ts
    api.writeTmpFile({
      noPluginDir: true,
      path: 'umi.ts',
      tplPath: join(TEMPLATES_DIR, 'umi.tpl'),
      context: {
        mountElementId: api.config.mountElementId,
        rendererPath,
        publicPath: api.config.publicPath,
        runtimePublicPath: api.config.runtimePublicPath ? 'true' : 'false',
        entryCode: (
          await api.applyPlugins({
            key: 'addEntryCode',
            initialValue: [],
          })
        ).join('\n'),
        entryCodeAhead: (
          await api.applyPlugins({
            key: 'addEntryCodeAhead',
            initialValue: [],
          })
        ).join('\n'),
        polyfillImports: importsToStr(
          await api.applyPlugins({
            key: 'addPolyfillImports',
            initialValue: [],
          }),
        ).join('\n'),
        importsAhead: importsToStr(
          await api.applyPlugins({
            key: 'addEntryImportsAhead',
            initialValue: [
              api.appData.globalCSS.length && {
                source: api.appData.globalCSS[0],
              },
              api.appData.globalJS.length && {
                source: api.appData.globalJS[0],
              },
            ].filter(Boolean),
          }),
        ).join('\n'),
        imports: importsToStr(
          await api.applyPlugins({
            key: 'addEntryImports',
            initialValue: [],
          }),
        ).join('\n'),
        basename: api.config.base,
        historyType: api.config.history.type,
        hydrate: !!api.config.ssr,
        reactRouter5Compat: !!api.config.reactRouter5Compat,
        loadingComponent: api.appData.globalLoading,
      },
    });

    // EmptyRoute.tsx
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/EmptyRoute.tsx',
      // https://github.com/umijs/umi/issues/8782
      // Empty <Outlet /> needs to pass through outlet context, otherwise nested route will not get context value.
      content: `
import React from 'react';
import { Outlet, useOutletContext } from 'umi';
export default function EmptyRoute() {
  const context = useOutletContext();
  return <Outlet context={context} />;
}
      `,
    });

    // route.ts
    let routes: any;
    if (opts.isFirstTime) {
      routes = api.appData.routes;
    } else {
      routes = await routesApi.getRoutes({
        api,
      });
      // refresh route data, prevent route data outdated
      // this can immediately get the latest `icon`... props in routes config
      api.appData.routes = routes;
    }

    const hasSrc = api.appData.hasSrcDir;
    // @/pages/
    const pages = basename(
      api.config.conventionRoutes?.base || api.paths.absPagesPath,
    );
    const prefix = hasSrc ? `../../../src/${pages}/` : `../../${pages}/`;
    const clonedRoutes = lodash.cloneDeep(routes);
    for (const id of Object.keys(clonedRoutes)) {
      for (const key of Object.keys(clonedRoutes[id])) {
        const route = clonedRoutes[id];
        // Remove __ prefix props, absPath props and file props
        if (key.startsWith('__') || ['absPath', 'file'].includes(key)) {
          delete route[key];
        }
      }
    }

    // header imports
    const headerImports: string[] = [];

    // trim quotes
    let routesString = JSON.stringify(clonedRoutes);
    if (api.config.clientLoader) {
      // "clientLoaders['foo']" > clientLoaders['foo']
      routesString = routesString.replace(/"(clientLoaders\[.*?)"/g, '$1');
      // import: client loader
      headerImports.push(`import clientLoaders from './loaders.js';`);
    }
    // routeProps is enabled for conventional routes
    // e.g. dumi 需要用到约定式路由但又不需要 routeProps
    if (!api.userConfig.routes && api.isPluginEnable('routeProps')) {
      // routeProps":"routeProps['foo']" > ...routeProps['foo']
      routesString = routesString.replace(
        /"routeProps":"(routeProps\[.*?)"/g,
        '...$1',
      );
      // import: route props
      headerImports.push(`import routeProps from './routeProps';`);
      // prevent override internal route props
      headerImports.push(`
if (process.env.NODE_ENV === 'development') {
  Object.entries(routeProps).forEach(([key, value]) => {
    const internalProps = ['path', 'id', 'parentId', 'isLayout', 'isWrapper', 'layout', 'clientLoader'];
    Object.keys(value).forEach((prop) => {
      if (internalProps.includes(prop)) {
        throw new Error(
          \`[UmiJS] route '\${key}' should not have '\${prop}' prop, please remove this property in 'routeProps'.\`
        )
      }
    })
  })
}
`);
    }

    // import: react
    if (api.appData.framework === 'react') {
      headerImports.push(`import React from 'react';`);
    }

    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/route.tsx',
      tplPath: join(TEMPLATES_DIR, 'route.tpl'),
      context: {
        headerImports: headerImports.join('\n'),
        routes: routesString,
        routeComponents: await routesApi.getRouteComponents({
          routes,
          prefix,
          api,
        }),
      },
    });

    // plugin.ts
    const plugins: string[] = await api.applyPlugins({
      key: 'addRuntimePlugin',
      initialValue: [api.appData.appJS?.path].filter(Boolean),
    });

    function checkDuplicatePluginKeys(arr: string[]) {
      const duplicates: string[] = [];
      arr.reduce<Record<string, boolean>>((prev, curr) => {
        if (prev[curr]) {
          duplicates.push(curr);
        } else {
          prev[curr] = true;
        }
        return prev;
      }, {});
      if (duplicates.length) {
        throw new Error(
          `The plugin key cannot be duplicated. (${duplicates.join(', ')})`,
        );
      }
    }

    const validKeys = await api.applyPlugins({
      key: 'addRuntimePluginKey',
      initialValue: [
        'patchRoutes',
        'patchClientRoutes',
        'modifyContextOpts',
        'modifyClientRenderOpts',
        'rootContainer',
        'innerProvider',
        'i18nProvider',
        'accessProvider',
        'dataflowProvider',
        'outerProvider',
        'render',
        'onRouteChange',
      ],
    });

    checkDuplicatePluginKeys(validKeys);

    const appPluginRegExp = /(\/|\\)app.(ts|tsx|jsx|js)$/;
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/plugin.ts',
      tplPath: join(TEMPLATES_DIR, 'plugin.tpl'),
      context: {
        plugins: plugins.map((plugin, index) => ({
          index,
          // 在 app.ts 中，如果使用了 defineApp 方法，会存在 export default 的情况
          hasDefaultExport: appPluginRegExp.test(plugin),
          path: winPath(plugin),
        })),
        validKeys,
        // Inject code for vite only
        isViteMode: !!api.config.vite,
      },
    });

    // umi.server.ts
    if (api.config.ssr) {
      const umiPluginPath = winPath(join(umiDir, 'client/client/plugin.js'));
      const umiServerPath = winPath(require.resolve('@umijs/server/dist/ssr'));
      const routesWithServerLoader = Object.keys(routes).reduce<
        { id: string; path: string }[]
      >((memo, id) => {
        if (routes[id].hasServerLoader) {
          memo.push({
            id,
            path: routes[id].__absFile,
          });
        }
        return memo;
      }, []);
      api.writeTmpFile({
        noPluginDir: true,
        path: 'umi.server.ts',
        tplPath: join(TEMPLATES_DIR, 'server.tpl'),
        context: {
          routes: JSON.stringify(clonedRoutes, null, 2).replace(
            /"component": "await import\((.*)\)"/g,
            '"component": await import("$1")',
          ),
          routesWithServerLoader,
          umiPluginPath,
          serverRendererPath,
          umiServerPath,
          validKeys,
          assetsPath: winPath(
            join(api.paths.absOutputPath, 'build-manifest.json'),
          ),
          env: JSON.stringify(api.env),
        },
      });
    }

    // history.ts
    // only react generates because the preset-vue override causes vite hot updates to fail
    if (api.appData.framework === 'react') {
      const { historyWithQuery, reactRouter5Compat } = api.config;
      const historyPath = historyWithQuery
        ? winPath(dirname(require.resolve('@umijs/history/package.json')))
        : rendererPath;
      api.writeTmpFile({
        noPluginDir: true,
        path: 'core/history.ts',
        tplPath: join(TEMPLATES_DIR, 'history.tpl'),
        context: {
          historyPath,
          reactRouter5Compat,
        },
      });
      api.writeTmpFile({
        noPluginDir: true,
        path: 'core/historyIntelli.ts',
        tplPath: join(TEMPLATES_DIR, 'historyIntelli.tpl'),
        context: {
          historyPath,
          reactRouter5Compat,
        },
      });
    }
  });

  function checkMembers(opts: {
    path: string;
    members: string[];
    exportMembers: string[];
  }) {
    const conflicts = lodash.intersection(opts.exportMembers, opts.members);
    if (conflicts.length) {
      throw new Error(
        `Conflict members: ${conflicts.join(', ')} in ${opts.path}`,
      );
    }
  }

  async function getExportsAndCheck(opts: {
    path: string;
    exportMembers: string[];
  }) {
    const members = (await getModuleExports({ file: opts.path })) as string[];
    checkMembers({
      members,
      exportMembers: opts.exportMembers,
      path: opts.path,
    });
    opts.exportMembers.push(...members);
    return members;
  }

  // Generate @@/exports.ts
  api.register({
    key: 'onGenerateFiles',
    fn: async () => {
      const rendererPath = winPath(
        await api.applyPlugins({
          key: 'modifyRendererPath',
          initialValue: dirname(
            require.resolve('@umijs/renderer-react/package.json'),
          ),
        }),
      );

      const exports: string[] = [];
      const beforeExports: string[] = [];
      const afterExports: string[] = [];
      const exportMembers = ['default'];
      // @umijs/renderer-react
      exports.push('// @umijs/renderer-*');

      exports.push(
        `export { ${(
          await getExportsAndCheck({
            path: join(rendererPath, 'dist/index.js'),
            exportMembers,
          })
        ).join(', ')} } from '${rendererPath}';`,
      );
      exports.push(`export type { History } from '${rendererPath}'`);
      // umi/client/client/plugin
      exports.push('// umi/client/client/plugin');
      const umiPluginPath = winPath(join(umiDir, 'client/client/plugin.js'));
      exports.push(
        `export { ${(
          await getExportsAndCheck({
            path: umiPluginPath,
            exportMembers,
          })
        ).join(', ')} } from '${umiPluginPath}';`,
      );
      // @@/core/history.ts
      exports.push(`export { history, createHistory } from './core/history';`);
      checkMembers({
        members: ['history', 'createHistory'],
        exportMembers,
        path: '@@/core/history.ts',
      });
      // @@/core/terminal.ts
      if (api.service.config.terminal !== false) {
        exports.push(`export { terminal } from './core/terminal';`);
        checkMembers({
          members: ['terminal'],
          exportMembers,
          path: '@@/core/terminal.ts',
        });
      }
      if (api.config.test !== false && api.appData.framework === 'react') {
        if (
          process.env.NODE_ENV === 'test' ||
          // development is for TestBrowser's type
          process.env.NODE_ENV === 'development'
        ) {
          // `TestBrowser` is a circular dependency, we export it last
          afterExports.push(
            `// test`,
            `export { TestBrowser } from './testBrowser';`,
          );
        }
      }
      if (api.appData.framework === 'react') {
        exports.push('// react ssr');
        if (api.config.ssr) {
          exports.push(
            `export { useServerInsertedHTML } from './core/serverInsertedHTMLContext';`,
          );
        } else {
          exports.push(
            `export const useServerInsertedHTML: Function = () => {};`,
          );
        }
      }
      // plugins
      beforeExports.push('// plugins');
      const allPlugins = readdirSync(api.paths.absTmpPath).filter((file) =>
        file.startsWith('plugin-'),
      );
      const plugins = allPlugins.filter((file) => {
        if (
          existsSync(join(api.paths.absTmpPath, file, 'index.ts')) ||
          existsSync(join(api.paths.absTmpPath, file, 'index.tsx'))
        ) {
          return true;
        }
      });

      for (const plugin of plugins) {
        let file: string;
        if (existsSync(join(api.paths.absTmpPath, plugin, 'index.ts'))) {
          file = join(api.paths.absTmpPath, plugin, 'index.ts');
        }
        if (existsSync(join(api.paths.absTmpPath, plugin, 'index.tsx'))) {
          file = join(api.paths.absTmpPath, plugin, 'index.tsx');
        }
        const pluginExports = await getExportsAndCheck({
          path: file!,
          exportMembers,
        });
        if (pluginExports.length) {
          beforeExports.push(
            `export { ${pluginExports.join(', ')} } from '${winPath(
              join(api.paths.absTmpPath, plugin),
            )}';`,
          );
        }
      }

      // plugins types.ts
      beforeExports.push('// plugins types.d.ts');
      for (const plugin of allPlugins) {
        const file = winPath(join(api.paths.absTmpPath, plugin, 'types.d.ts'));
        if (existsSync(file)) {
          // 带 .ts 后缀的声明文件 会导致声明失效
          const noSuffixFile = file.replace(/\.ts$/, '');
          beforeExports.push(`export * from '${noSuffixFile}';`);
        }
      }
      // plugins runtimeConfig.d.ts
      let pluginIndex = 0;
      const beforeImport = [];
      let runtimeConfigType =
        'export type RuntimeConfig = IDefaultRuntimeConfig';

      for (const plugin of allPlugins) {
        const runtimeConfigFile = winPath(
          join(api.paths.absTmpPath, plugin, RUNTIME_TYPE_FILE_NAME),
        );
        if (existsSync(runtimeConfigFile)) {
          const noSuffixRuntimeConfigFile = runtimeConfigFile.replace(
            /\.ts$/,
            '',
          );
          beforeImport.push(
            `import type { IRuntimeConfig as Plugin${pluginIndex} } from '${noSuffixRuntimeConfigFile}'`,
          );
          runtimeConfigType += ` & Plugin${pluginIndex}`;
          pluginIndex += 1;
        }
      }
      api.writeTmpFile({
        noPluginDir: true,
        path: 'core/defineApp.ts',
        tplPath: join(TEMPLATES_DIR, 'defineApp.tpl'),
        context: {
          beforeImport: beforeImport.join('\n'),
          runtimeConfigType,
        },
      });
      // FIXME: if exported after plugins, circular dependency:
      //        `app.ts -> exports.ts -> plugin -> core/plugin.ts -> app.ts`
      //        we will get a `defineApp` of `undefined`
      // https://github.com/umijs/umi/issues/9702
      // https://github.com/umijs/umi/issues/10412
      beforeExports.unshift(
        // `app.ts` should be in the first, otherwise it will be circular dependency
        `// defineApp`,
        `export { defineApp } from './core/defineApp'`,
        // https://javascript.plainenglish.io/leveraging-type-only-imports-and-exports-with-typescript-3-8-5c1be8bd17fb
        `export type { RuntimeConfig } from './core/defineApp'`,
      );
      api.writeTmpFile({
        noPluginDir: true,
        path: 'exports.ts',
        content: [...beforeExports, ...exports, ...afterExports].join('\n'),
      });
    },
    stage: 10000,
  });
};
