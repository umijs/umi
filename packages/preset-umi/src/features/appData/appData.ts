import { getNpmClient, importLazy, winPath } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { parse } from '../../../compiled/ini';
import { osLocale } from '../../../compiled/os-locale';
import { expandCSSPaths, expandJSPaths } from '../../commands/dev/watch';
import type { IApi, IOnGenerateFiles } from '../../types';
import { getOverridesCSS } from '../overrides/overrides';

export default (api: IApi) => {
  const routesApi: typeof import('../tmpFiles/routes') = importLazy(
    require.resolve('../tmpFiles/routes'),
  );
  const bundlerUtils: typeof import('@umijs/bundler-utils') = importLazy(
    require.resolve('@umijs/bundler-utils'),
  );

  api.modifyAppData(async (memo) => {
    memo.routes = await routesApi.getRoutes({
      api,
    });
    memo.apiRoutes = await routesApi.getApiRoutes({
      api,
    });
    memo.hasSrcDir = api.paths.absSrcPath.endsWith('/src');
    memo.npmClient = api.userConfig.npmClient || getNpmClient({ cwd: api.cwd });
    memo.umi = {
      version: require('../../../package.json').version,
      name: 'Umi',
      importSource: 'umi',
      cliName: 'umi',
    };
    memo.bundleStatus = {
      done: false,
    };
    if (api.config.mfsu !== false) {
      memo.mfsuBundleStatus = {
        done: false,
      };
    }
    memo.react = {
      version: require(join(api.config.alias.react, 'package.json')).version,
      path: api.config.alias.react,
    };
    memo['react-dom'] = {
      version: require(join(api.config.alias['react-dom'], 'package.json'))
        .version,
      path: api.config.alias['react-dom'],
    };
    memo.appJS = await getAppJsInfo();
    memo.locale = await osLocale();
    memo.vite = api.config.vite ? {} : undefined;
    const { globalCSS, globalJS, overridesCSS, globalLoading } =
      getGlobalFiles();
    memo.globalCSS = globalCSS;
    memo.globalJS = globalJS;
    memo.overridesCSS = overridesCSS;
    memo.globalLoading = globalLoading;
    memo.bundler = 'webpack';

    const gitDir = findGitDir(api.paths.cwd);
    if (gitDir) {
      const git: Record<string, string> = {};
      const configPath = join(gitDir, 'config');
      if (existsSync(configPath)) {
        const config = readFileSync(configPath, 'utf-8');
        const url = parse(config)['remote "origin"']?.url;
        if (url) {
          git.originUrl = url;
        }
      }
      memo.git = git;
    }

    memo.framework = 'react';

    // load ts info
    const tsPkg = tryLoadDepPkg({
      name: 'typescript',
      from: api.cwd,
    });
    const tslibPkg = tryLoadDepPkg({
      name: 'tslib',
      from: api.cwd,
    });
    memo.typescript = {
      tsVersion: tsPkg?.version,
      tslibVersion: tslibPkg?.version,
    };

    return memo;
  });

  // Execute earliest, so that other onGenerateFiles can get it
  api.register({
    key: 'onGenerateFiles',
    async fn(args: IOnGenerateFiles) {
      if (!args.isFirstTime) {
        api.appData.appJS = await getAppJsInfo();
        const { globalCSS, globalJS, overridesCSS, globalLoading } =
          getGlobalFiles();
        api.appData.globalCSS = globalCSS;
        api.appData.globalJS = globalJS;
        api.appData.overridesCSS = overridesCSS;
        api.appData.globalLoading = globalLoading;
      }
    },
    stage: Number.NEGATIVE_INFINITY,
  });

  // used in esmi and vite
  api.register({
    key: 'updateAppDataDeps',
    async fn() {
      const { createResolver, scan } = await import('../../libs/scan.js');
      const resolver = createResolver({
        alias: api.config.alias,
      });

      api.appData.deps = await scan({
        entry: join(api.paths.absTmpPath, 'umi.ts'),
        externals: api.config.externals,
        resolver,
      });

      // FIXME: force include react & react-dom
      if (api.appData.deps['react']) {
        api.appData.deps['react'].version = api.appData.react.version;
      }
      api.appData.deps['react-dom'] = {
        version: api.appData.react.version,
        matches: ['react-dom'],
        subpaths: [],
      };
    },
  });

  async function getAppJsInfo() {
    for (const path of expandJSPaths(join(api.paths.absSrcPath, 'app'))) {
      if (existsSync(path)) {
        const [_, exports] = await bundlerUtils.parseModule({
          path,
          content: readFileSync(path, 'utf-8'),
        });
        return {
          path,
          exports,
        };
      }
    }
    return null;
  }

  function getGlobalFiles() {
    const absSrcPath = api.paths.absSrcPath;
    const existsAndPushFile = (memo: string[], file: string) => {
      if (existsSync(file)) {
        memo.push(file);
      }
      return memo;
    };

    const globalCSS = expandCSSPaths(join(absSrcPath, 'global')).reduce<
      string[]
    >(existsAndPushFile, []);

    const globalJS = expandJSPaths(join(absSrcPath, 'global')).reduce<string[]>(
      existsAndPushFile,
      [],
    );

    const loadingFile = expandJSPaths(join(absSrcPath, 'loading')).find(
      existsSync,
    );
    const globalLoading = loadingFile ? winPath(loadingFile) : undefined;

    const overridesCSS = [getOverridesCSS(api.paths.absSrcPath)].filter(
      Boolean,
    ) as string[];

    return {
      globalCSS,
      globalJS,
      overridesCSS,
      globalLoading,
    };
  }
};

function findGitDir(dir: string): string | null {
  if (dir === resolve('/')) {
    return null;
  }
  if (existsSync(join(dir, '.git'))) {
    return join(dir, '.git');
  }
  const parent: string | null = findGitDir(join(dir, '..'));
  if (parent) {
    return parent;
  }
  return null;
}

function tryLoadDepPkg(opts: { name: string; from: string }) {
  const { name, from } = opts;
  try {
    return require(require.resolve(`${name}/package.json`, {
      paths: [from],
    }));
  } catch {}
}
