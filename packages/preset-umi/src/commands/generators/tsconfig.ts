import { GeneratorType } from '@umijs/core';
import { logger } from '@umijs/utils';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';
import { GeneratorHelper } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'generator:tsconfig',
  });

  api.registerGenerator({
    key: 'tsconfig',
    name: 'Enable Typescript',
    description: 'Setup tsconfig.json',
    type: GeneratorType.enable,
    checkEnable: () => {
      return !existsSync(join(api.paths.cwd, 'tsconfig.json'));
    },
    disabledDescription:
      'tsconfig has been enabled; you can remove tsconfig.json then run this again to re-setup',
    fn: async () => {
      const h = new GeneratorHelper(api);

      h.addDevDeps({
        typescript: '^4',
      });

      writeFileSync(
        join(api.cwd, 'tsconfig.json'),
        `
{
  "extends": "./${api.appData.hasSrcDir ? 'src/' : ''}.umi/tsconfig.json"
}
`.trimStart(),
      );
      logger.info('Write tsconfig.json');

      h.installDeps();
    },
  });
};
