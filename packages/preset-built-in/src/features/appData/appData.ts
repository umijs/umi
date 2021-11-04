import { getNpmClient } from '@umijs/utils';
import { IApi } from '../../types';
import { getRoutes } from '../tmpFiles/routes';

export default (api: IApi) => {
  api.modifyAppData(async (memo) => {
    // routes
    memo.routes = await getRoutes({
      config: api.config,
      absSrcPage: api.paths.absSrcPath,
      absPagesPath: api.paths.absPagesPath,
    });
    // hasSrcDir
    memo.hasSrcDir = api.paths.absSrcPath.endsWith('/src');
    // npmClient
    memo.npmClient = api.userConfig.npmClient || getNpmClient();

    return memo;
  });
};
