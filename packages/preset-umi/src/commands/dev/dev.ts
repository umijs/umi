import type { RequestHandler } from '@umijs/bundler-webpack';
import { lodash, logger, portfinder, winPath } from '@umijs/utils';
import { readFileSync } from 'fs';
import { basename, join } from 'path';
import { DEFAULT_HOST, DEFAULT_PORT } from '../../constants';
import { IApi } from '../../types';
import { clearTmp } from '../../utils/clearTmp';
import { lazyImportFromCurrentPkg } from '../../utils/lazyImportFromCurrentPkg';
import { createRouteMiddleware } from './createRouteMiddleware';
import { faviconMiddleware } from './faviconMiddleware';
import { getBabelOpts } from './getBabelOpts';
import { printMemoryUsage } from './printMemoryUsage';
import {
  addUnWatch,
  createDebouncedHandler,
  expandJSPaths,
  unwatch,
  watch,
} from './watch';

const bundlerWebpack: typeof import('@umijs/bundler-webpack') =
  lazyImportFromCurrentPkg('@umijs/bundler-webpack');
const bundlerVite: typeof import('@umijs/bundler-vite') =
  lazyImportFromCurrentPkg('@umijs/bundler-vite');

export default (api: IApi) => {
  api.describe({
    enableBy() {
      return api.name === 'dev';
    },
  });

  api.registerCommand({
    name: 'dev',
    description: 'dev server for development',
    details: `
umi dev

# dev with specified port
PORT=8888 umi dev
`,
    async fn() {
      const enableVite = !!api.config.vite;

      // clear tmp except cache
      clearTmp(api.paths.absTmpPath);

      // check package.json
      await api.applyPlugins({
        key: 'onCheckPkgJSON',
        args: {
          origin: null,
          current: api.appData.pkg,
        },
      });

      // clean cache if umi version not matched
      // const umiJSONPath = join(api.paths.absTmpPath, 'umi.json');
      // if (existsSync(umiJSONPath)) {
      //   const originVersion = require(umiJSONPath).version;
      //   if (originVersion !== api.appData.umi.version) {
      //     logger.info(`Delete cache folder since umi version updated.`);
      //     rimraf.sync(api.paths.absTmpPath);
      //   }
      // }
      // fsExtra.outputFileSync(
      //   umiJSONPath,
      //   JSON.stringify({ version: api.appData.umi.version }),
      // );

      // generate files
      async function generate(opts: { isFirstTime?: boolean; files?: any }) {
        await api.applyPlugins({
          key: 'onGenerateFiles',
          args: {
            files: opts.files || null,
            isFirstTime: opts.isFirstTime,
          },
        });
      }
      await generate({
        isFirstTime: true,
      });
      const { absPagesPath, absSrcPath } = api.paths;
      const watcherPaths: string[] = await api.applyPlugins({
        key: 'addTmpGenerateWatcherPaths',
        initialValue: [
          absPagesPath,
          !api.config.routes && api.config.conventionRoutes?.base,
          join(absSrcPath, 'layouts'),
          ...expandJSPaths(join(absSrcPath, 'loading')),
          ...expandJSPaths(join(absSrcPath, 'app')),
        ].filter(Boolean),
      });
      lodash.uniq<string>(watcherPaths.map(winPath)).forEach((p: string) => {
        watch({
          path: p,
          addToUnWatches: true,
          onChange: createDebouncedHandler({
            timeout: 2000,
            async onChange(opts) {
              await generate({ files: opts.files, isFirstTime: false });
            },
          }),
        });
      });

      // watch package.json change
      const pkgPath = join(api.cwd, 'package.json');
      watch({
        path: pkgPath,
        addToUnWatches: true,
        onChange() {
          const origin = api.appData.pkg;
          api.appData.pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
          api.applyPlugins({
            key: 'onCheckPkgJSON',
            args: {
              origin,
              current: api.appData.pkg,
            },
          });
          api.applyPlugins({
            key: 'onPkgJSONChanged',
            args: {
              origin,
              current: api.appData.pkg,
            },
          });
        },
      });

      // watch config change
      addUnWatch(
        api.service.configManager!.watch({
          schemas: api.service.configSchemas,
          onChangeTypes: api.service.configOnChanges,
          async onChange(opts) {
            await api.applyPlugins({
              key: 'onCheckConfig',
              args: {
                config: api.config,
                userConfig: api.userConfig,
              },
            });
            const { data } = opts;
            if (data.changes[api.ConfigChangeType.reload]) {
              logger.event(
                `config ${data.changes[api.ConfigChangeType.reload].join(
                  ', ',
                )} changed, restart server...`,
              );
              api.restartServer();
              return;
            }
            if (data.changes[api.ConfigChangeType.regenerateTmpFiles]) {
              logger.event(
                `config ${data.changes[
                  api.ConfigChangeType.regenerateTmpFiles
                ].join(', ')} changed, regenerate tmp files...`,
              );
              await generate({ isFirstTime: false });
            }
            for (const fn of data.fns) {
              fn();
            }
          },
        }),
      );

      // watch plugin change
      const pluginFiles: string[] = [
        join(api.cwd, 'plugin.ts'),
        join(api.cwd, 'plugin.js'),
      ];
      pluginFiles.forEach((filePath: string) => {
        watch({
          path: filePath,
          addToUnWatches: true,
          onChange() {
            logger.event(`${basename(filePath)} changed, restart server...`);
            api.restartServer();
          },
        });
      });

      await api.applyPlugins({
        key: 'onBeforeCompiler',
      });

      // start dev server
      const beforeMiddlewares = await api.applyPlugins({
        key: 'addBeforeMiddlewares',
        initialValue: [],
      });
      const middlewares = await api.applyPlugins({
        key: 'addMiddlewares',
        initialValue: [],
      });
      const {
        babelPreset,
        beforeBabelPlugins,
        beforeBabelPresets,
        extraBabelPlugins,
        extraBabelPresets,
      } = await getBabelOpts({ api });
      const chainWebpack = async (memo: any, args: Object) => {
        await api.applyPlugins({
          key: 'chainWebpack',
          type: api.ApplyPluginsType.modify,
          initialValue: memo,
          args,
        });
      };
      const modifyWebpackConfig = async (memo: any, args: Object) => {
        return await api.applyPlugins({
          key: 'modifyWebpackConfig',
          initialValue: memo,
          args,
        });
      };
      const modifyViteConfig = async (memo: any, args: Object) => {
        return await api.applyPlugins({
          key: 'modifyViteConfig',
          initialValue: memo,
          args,
        });
      };
      const debouncedPrintMemoryUsage = lodash.debounce(printMemoryUsage, 5000);
      const opts = {
        config: api.config,
        cwd: api.cwd,
        entry: {
          umi: join(api.paths.absTmpPath, 'umi.ts'),
        },
        port: api.appData.port,
        host: api.appData.host,
        ...(enableVite
          ? { modifyViteConfig }
          : { babelPreset, chainWebpack, modifyWebpackConfig }),
        beforeBabelPlugins,
        beforeBabelPresets,
        extraBabelPlugins,
        extraBabelPresets,
        beforeMiddlewares: ([] as RequestHandler[]).concat([
          ...beforeMiddlewares,
          faviconMiddleware,
        ]),
        afterMiddlewares: middlewares.concat(createRouteMiddleware({ api })),
        onDevCompileDone(opts: any) {
          debouncedPrintMemoryUsage();
          api.appData.bundleStatus.done = true;
          api.applyPlugins({
            key: 'onDevCompileDone',
            args: opts,
          });
        },
        onProgress(opts: any) {
          api.appData.bundleStatus.progresses = opts.progresses;
        },
        onMFSUProgress(opts: any) {
          api.appData.mfsuBundleStatus = {
            ...api.appData.mfsuBundleStatus,
            ...opts,
          };
        },
        mfsuWithESBuild: api.config.mfsu?.esbuild,
        cache: {
          buildDependencies: [
            api.pkgPath,
            api.service.configManager!.mainConfigFile || '',
          ].filter(Boolean),
        },
      };
      if (enableVite) {
        await bundlerVite.dev(opts);
      } else {
        await bundlerWebpack.dev(opts);
      }
    },
  });

  api.modifyAppData(async (memo) => {
    memo.port = await portfinder.getPortPromise({
      port: parseInt(String(process.env.PORT || DEFAULT_PORT), 10),
    });
    memo.host = process.env.HOST || DEFAULT_HOST;
    return memo;
  });

  api.registerMethod({
    name: 'restartServer',
    fn() {
      logger.info(`Restart dev server with port ${api.appData.port}...`);
      unwatch();
      process.send?.({
        type: 'RESTART',
        payload: {
          port: api.appData.port,
        },
      });
    },
  });
};
