import { parseModule } from '@umijs/bundler-utils';
import { lodash, winPath } from '@umijs/utils';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { basename, dirname, join } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import { importsToStr } from './importsToStr';
import { getRouteComponents, getRoutes } from './routes';

export default (api: IApi) => {
  api.describe({
    key: 'tmpFiles',
    config: {
      schema(Joi) {
        return Joi.boolean();
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

    // umi.ts
    api.writeTmpFile({
      noPluginDir: true,
      path: 'umi.ts',
      tplPath: join(TEMPLATES_DIR, 'umi.tpl'),
      context: {
        mountElementId: api.config.mountElementId,
        rendererPath,
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
        loadingComponent:
          existsSync(join(api.paths.absSrcPath, 'loading.tsx')) ||
          existsSync(join(api.paths.absSrcPath, 'loading.jsx')) ||
          existsSync(join(api.paths.absSrcPath, 'loading.js')),
      },
    });

    // EmptyRoutes.tsx
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/EmptyRoute.tsx',
      content: `
import { Outlet } from 'umi';
export default function EmptyRoute() {
  return <Outlet />;
}
      `,
    });

    // route.ts
    let routes;
    if (opts.isFirstTime) {
      routes = api.appData.routes;
    } else {
      routes = await getRoutes({
        api,
      });
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
        if (key.startsWith('__') || key.startsWith('absPath')) {
          delete clonedRoutes[id][key];
        }
      }
    }
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/route.tsx',
      tplPath: join(TEMPLATES_DIR, 'route.tpl'),
      context: {
        routes: JSON.stringify(clonedRoutes),
        routeComponents: await getRouteComponents({ routes, prefix }),
      },
    });

    // plugin.ts
    const plugins: string[] = await api.applyPlugins({
      key: 'addRuntimePlugin',
      initialValue: [
        // TODO: add tryFiles in @umijs/utils
        existsSync(join(api.paths.absSrcPath, 'app.ts')) &&
          join(api.paths.absSrcPath, 'app.ts'),
        existsSync(join(api.paths.absSrcPath, 'app.tsx')) &&
          join(api.paths.absSrcPath, 'app.tsx'),
        existsSync(join(api.paths.absSrcPath, 'app.jsx')) &&
          join(api.paths.absSrcPath, 'app.jsx'),
        existsSync(join(api.paths.absSrcPath, 'app.js')) &&
          join(api.paths.absSrcPath, 'app.js'),
      ]
        .filter(Boolean)
        .slice(0, 1),
    });
    const validKeys = await api.applyPlugins({
      key: 'addRuntimePluginKey',
      initialValue: [
        // TODO: support these methods
        // 'modifyClientRenderOpts',
        'patchRoutes',
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
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/plugin.ts',
      tplPath: join(TEMPLATES_DIR, 'plugin.tpl'),
      context: {
        plugins: plugins.map((plugin, index) => ({
          index,
          path: winPath(plugin),
        })),
        validKeys: validKeys,
      },
    });

    // history.ts
    api.writeTmpFile({
      noPluginDir: true,
      path: 'core/history.ts',
      tplPath: join(TEMPLATES_DIR, 'history.tpl'),
      context: {
        rendererPath,
      },
    });
  });

  async function getExports(opts: { path: string }) {
    const content = readFileSync(opts.path, 'utf-8');
    const [_, exports] = await parseModule({ content, path: opts.path });
    return exports || [];
  }

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
    const members = (await getExports(opts)) as string[];
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
      const exports = [];
      const exportMembers = ['default'];
      // @umijs/renderer-react
      exports.push('// @umijs/renderer-react');
      const rendererReactPath = winPath(
        dirname(require.resolve('@umijs/renderer-react/package.json')),
      );
      exports.push(
        `export { ${(
          await getExportsAndCheck({
            path: join(rendererReactPath, 'dist/index.js'),
            exportMembers,
          })
        ).join(', ')} } from '${rendererReactPath}';`,
      );
      // umi/client/client/plugin
      exports.push('// umi/client/client/plugin');
      const umiDir = process.env.UMI_DIR!;
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
      // plugins
      exports.push('// plugins');
      const plugins = readdirSync(api.paths.absTmpPath).filter((file) => {
        if (
          file.startsWith('plugin-') &&
          (existsSync(join(api.paths.absTmpPath, file, 'index.ts')) ||
            existsSync(join(api.paths.absTmpPath, file, 'index.tsx')))
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
          exports.push(
            `export { ${pluginExports.join(', ')} } from '${winPath(
              join(api.paths.absTmpPath, plugin),
            )}';`,
          );
        }
      }
      // plugins types.ts
      exports.push('// plugins types.d.ts');
      for (const plugin of plugins) {
        const file = winPath(join(api.paths.absTmpPath, plugin, 'types.d.ts'));
        if (existsSync(file)) {
          // 带 .ts 后缀的声明文件 会导致声明失效
          const noSuffixFile = file.replace(/\.ts$/, '');
          exports.push(`export * from '${noSuffixFile}';`);
        }
      }
      api.writeTmpFile({
        noPluginDir: true,
        path: 'exports.ts',
        content: exports.join('\n'),
      });
    },
    stage: Infinity,
  });
};
