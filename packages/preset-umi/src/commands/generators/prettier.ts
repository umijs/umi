import { GeneratorType } from '@umijs/core';
import { logger } from '@umijs/utils';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';
import { GeneratorHelper } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'generator:prettier',
  });

  api.registerGenerator({
    key: 'prettier',
    name: 'Enable Prettier',
    description: 'Setup Prettier Configurations',
    type: GeneratorType.enable,
    checkEnable: () => {
      // 存在 .prettierrc，不开启
      return !existsSync(join(api.cwd, '.prettierrc'));
    },
    fn: async () => {
      const h = new GeneratorHelper(api);

      h.addDevDeps({
        prettier: '^2',
        'prettier-plugin-organize-imports': '^2',
        'prettier-plugin-packagejson': '^2',
      });

      // 2、添加 .prettierrc 和 .prettierignore
      writeFileSync(
        join(api.cwd, '.prettierrc'),
        `
{
  "printWidth": 80,
  "singleQuote": true,
  "trailingComma": "all",
  "proseWrap": "never",
  "overrides": [{ "files": ".prettierrc", "options": { "parser": "json" } }],
  "plugins": ["prettier-plugin-organize-imports", "prettier-plugin-packagejson"]
}
`.trimLeft(),
      );
      logger.info('Write .prettierrc');
      writeFileSync(
        join(api.cwd, '.prettierignore'),
        `
node_modules
.umi
.umi-production
`.trimLeft(),
      );
      logger.info('Write .prettierignore');

      h.installDeps();
    },
  });
};
