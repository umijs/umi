import { GeneratorType } from '@umijs/core';
import { installWithNpmClient, logger } from '@umijs/utils';
import assert from 'assert';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';

export default (api: IApi) => {
  api.registerGenerator({
    key: 'prettier',
    name: 'Enable Prettier',
    description: 'Setup Prettier Configurations',
    type: GeneratorType.enable,
    checkEnable: (opts) => {
      const { api } = opts;
      // 存在 .prettierrc，不开启
      return !existsSync(join(api.paths.cwd, '.prettierrc'));
    },
    fn: async () => {
      // 1、修改 package.json，加上 prettier 和插件
      api.pkg.devDependencies = {
        ...api.pkg.devDependencies,
        prettier: '^2',
        'prettier-plugin-organize-imports': '^2',
        'prettier-plugin-packagejson': '^2',
      };
      writeFileSync(api.pkgPath, JSON.stringify(api.pkg, null, 2));
      logger.info('Write package.json');
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
      // 3、执行 npm install
      const npmClient = api.userConfig.npmClient;
      assert(npmClient, `npmClient is required in your config.`);
      installWithNpmClient({
        npmClient,
      });
      logger.info(`Install dependencies with ${npmClient}`);
    },
  });
};
