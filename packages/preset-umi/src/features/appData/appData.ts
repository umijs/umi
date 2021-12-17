import { parseModule } from '@umijs/bundler-utils';
import { getNpmClient } from '@umijs/utils';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { expandJSPaths } from '../../commands/dev/watch';
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
