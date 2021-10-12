import { importLazy, lodash, logger, portfinder, winPath } from '@umijs/utils';
import assert from 'assert';
import { existsSync, readFileSync } from 'fs';
import { basename, extname, join } from 'path';
import { DEFAULT_HOST, DEFAULT_PORT } from '../../constants';
import { IApi } from '../../types';
import { clearTmp } from '../../utils/clearTmp';
import {
  addUnWatch,
  createDebouncedHandler,
  expandJSPaths,
  unwatch,
  watch,
} from './watch';

const { dev }: typeof import('@umijs/bundler-webpack') = importLazy(
  '@umijs/bundler-webpack',
);

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
      // clear tmp except cache
      clearTmp(api.paths.absTmpPath);

      // generate files
      async function generate(files?: any) {
        api.applyPlugins({
          key: 'onGenerateFiles',
          args: {
            files,
          },
        });
      }
      await generate();
      const { absPagesPath, absSrcPath } = api.paths;
      const watcherPaths: string[] = await api.applyPlugins({
        key: 'addTmpGenerateWatcherPaths',
        initialValue: [
          absPagesPath,
          join(absSrcPath, 'layouts'),
          ...expandJSPaths(join(absSrcPath, 'app')),
        ],
      });
      lodash.uniq<string>(watcherPaths.map(winPath)).forEach((p: string) => {
        watch({
          path: p,
          addToUnWatches: true,
          onChange: createDebouncedHandler({
            timeout: 2000,
            async onChange(opts) {
              await generate(opts.files);
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
          // @ts-ignore
          onChangeTypes: [
            api.ConfigChangeType.reload,
            api.ConfigChangeType.regenerateTmpFiles,
          ],
          onChange(opts) {
            console.log(opts);
          },
        }),
      );

      // start dev server
      const entry = getEntry(api.cwd);
      assert(entry, `Build failed: entry not found.`);
      await dev({
        config: api.config,
        cwd: api.cwd,
        entry: {
          [getEntryKey(entry)]: entry,
        },
        port: api.appData.port,
        host: api.appData.host,
        beforeMiddlewares: [],
        afterMiddlewares: [],
      });
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

function getEntry(cwd: string) {
  return tryPaths([
    join(cwd, 'src/index.tsx'),
    join(cwd, 'src/index.ts'),
    join(cwd, 'index.tsx'),
    join(cwd, 'index.ts'),
  ]);
}

function tryPaths(paths: string[]) {
  for (const path of paths) {
    if (existsSync(path)) return path;
  }
}

function getEntryKey(path: string) {
  return basename(path, extname(path));
}
