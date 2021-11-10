import { getNpmClient } from '@umijs/utils';
import { join } from 'path';
import { IApi } from '../../types';
import { getRoutes } from '../tmpFiles/routes';

export default (api: IApi) => {
  api.modifyAppData(async (memo) => {
    memo.routes = await getRoutes({
      config: api.config,
      absSrcPage: api.paths.absSrcPath,
      absPagesPath: api.paths.absPagesPath,
    });
    memo.hasSrcDir = api.paths.absSrcPath.endsWith('/src');
    memo.npmClient = api.userConfig.npmClient || getNpmClient();
    memo.umi = {
      version: require('../../../package.json').version,
    };
    memo.react = {
      version: require(join(api.config.alias.react, 'package.json')).version,
    };

    return memo;
  });
};
