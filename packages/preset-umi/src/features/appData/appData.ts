import { getNpmClient } from '@umijs/utils';
import { existsSync } from 'fs';
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
    memo.appJSPath = getAppJsPath();
    return memo;
  });

  // Execute earliest, so that other onGenerateFiles can get it
  api.register({
    key: 'onGenerateFiles',
    fn(args: any) {
      if (!args.isFirstTime) {
        api.appData.appJSPath = getAppJsPath();
      }
    },
    stage: Number.NEGATIVE_INFINITY,
  });

  function getAppJsPath() {
    for (const file of expandJSPaths(join(api.paths.absSrcPath, 'app'))) {
      if (existsSync(file)) {
        return file;
      }
    }
    return null;
  }
};
