import { IApi } from '@umijs/types';
import { join } from 'path';
import { existsSync } from 'fs';
import { chalk } from '@umijs/utils';

export default (api: IApi) => {
  api.registerCommand({
    name: 'version',
    description: 'show umi version',
    fn: async function () {
      const pkg = require(join(process.env.UMI_DIR || '', 'package.json'));
      [
        `umi@${pkg.version}`,
        `${process.platform} ${process.arch}`,
        `node@${process.version}`,
      ].forEach((version) => {
        console.log(version);
      });
      if (existsSync(join(process.env.UMI_DIR || '', '.local'))) {
        console.log(chalk.cyan('@local'));
      }
    },
  });
};
