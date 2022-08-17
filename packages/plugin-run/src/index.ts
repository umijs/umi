import { crossSpawn } from '@umijs/utils';
import { join } from 'path';
import { IApi } from 'umi';

export default (api: IApi) => {
  api.registerCommand({
    name: 'run',
    fn: ({ args }) => {
      const cwd = process.cwd();
      const path = join(cwd, args._[0]);
      crossSpawn('esno', [path], {
        stdio: 'inherit',
      });
    },
  });
};
