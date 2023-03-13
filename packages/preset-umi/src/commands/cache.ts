import { join } from 'path';
import { IApi } from 'umi';
import { fsExtra } from 'umi/plugin-utils';

export default (api: IApi) => {
  api.describe({
    key: 'cache',
    config: {},
  });

  api.registerCommand({
    name: 'cache',
    description: 'run the script commands, manage umi cache',
    configResolveMode: 'loose',
    fn: ({ args }) => {
      if (args[0] === 'clean') {
        const absTmpFilePath = join(api.paths.absNodeModulesPath, '.cache');
        fsExtra.removeSync(absTmpFilePath);
      }
    },
  });
};
