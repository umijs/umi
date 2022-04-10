import { parseModule } from '@umijs/bundler-utils';
import { getNpmClient } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';
import { parse } from '../../../compiled/ini';
import { osLocale } from '../../../compiled/os-locale';
import { expandJSPaths } from '../../commands/dev/watch';
import { createResolver, scan } from '../../libs/scan';
import { IApi } from '../../types';
import { getApiRoutes, getRoutes } from '../tmpFiles/routes';

export default (api: IApi) => {
  api.modifyAppData(async (memo) => {
    memo.routes = await getRoutes({
      api,
    });
    memo.apiRoutes = await getApiRoutes({
      api,
    });
    memo.hasSrcDir = api.paths.absSrcPath.endsWith('/src');
    memo.npmClient = api.userConfig.npmClient || getNpmClient();
    memo.umi = {
      version: require('../../../package.json').version,
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
    };
    memo.appJS = await getAppJsInfo();
    memo.locale = await osLocale();
    memo.vite = api.config.vite ? {} : undefined;
    memo.globalCSS = [
      'global.css',
      'global.less',
      'global.scss',
      'global.sass',
    ].reduce<string[]>((memo, key) => {
      if (existsSync(join(api.paths.absSrcPath, key))) {
        memo.push(join(api.paths.absSrcPath, key));
      }
      return memo;
    }, []);
    memo.globalJS = [
      'global.ts',
      'global.tsx',
      'global.jsx',
      'global.js',
    ].reduce<string[]>((memo, key) => {
      if (existsSync(join(api.paths.absSrcPath, key))) {
        memo.push(join(api.paths.absSrcPath, key));
      }
      return memo;
    }, []);

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

    return memo;
  });

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

  // Execute earliest, so that other onGenerateFiles can get it
  api.register({
    key: 'onGenerateFiles',
    async fn(args: any) {
      if (!args.isFirstTime) {
        api.appData.appJS = await getAppJsInfo();
      }
    },
    stage: Number.NEGATIVE_INFINITY,
  });

  // used in esmi and vite
  api.register({
    key: 'updateAppDataDeps',
    async fn() {
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
        const [_, exports] = await parseModule({
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
};
