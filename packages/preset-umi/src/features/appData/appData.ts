import { parseModule } from '@umijs/bundler-utils';
import { getNpmClient } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { expandJSPaths } from '../../commands/dev/watch';
import { createResolver, scan } from '../../libs/scan';
import { IApi } from '../../types';
import { getRoutes } from '../tmpFiles/routes';

export default (api: IApi) => {
  api.modifyAppData(async (memo) => {
    memo.routes = await getRoutes({
      api,
    });
    memo.hasSrcDir = api.paths.absSrcPath.endsWith('/src');
    memo.npmClient = api.userConfig.npmClient || getNpmClient();
    memo.umi = {
      version: require('../../../package.json').version,
    };
    memo.react = {
      version: require(join(api.config.alias.react, 'package.json')).version,
    };
    memo.appJS = await getAppJsInfo();
    memo.vite = api.args.vite ? {} : undefined;

    return memo;
  });

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
