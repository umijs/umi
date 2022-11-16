import { GeneratorType } from '@umijs/core';
import { logger } from '@umijs/utils';
import { existsSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { IApi } from '../../types';
import { GeneratorHelper } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'generator:precommit',
  });

  api.registerGenerator({
    key: 'precommit',
    name: 'Generate Precommit',
    description: 'Generate precommit boilerplate code',
    type: GeneratorType.generate,
    fn: async () => {
      const h = new GeneratorHelper(api);

      h.addDevDeps({
        husky: '^8',
        prettier: '^2',
        typescript: '^4',
        'lint-staged': '^13',
      });

      h.addScripts({
        prepare: 'husky install',
      });

      // 添加 .lintstagedrc
      writeFileSync(
        join(api.cwd, '.lintstagedrc'),
        `
{
  "*.{md,json}": [
    "prettier --cache --write"
  ],
  "*.{js,jsx}": [
    "umi lint --fix --eslint-only",
    "prettier --cache --write"
  ],
  "*.{css,less}": [
    "umi lint --fix --stylelint-only",
    "prettier --cache --write"
  ],
  "*.ts?(x)": [
    "umi lint --fix --eslint-only",
    "prettier --cache --parser=typescript --write"
  ]
}
`.trimStart(),
      );
      logger.info('Write .lintstagedrc');

      if (!existsSync(join(api.cwd, '.husky'))) {
        mkdirSync(join(api.cwd, '.husky'));
        logger.info('Create .husky');
      }

      writeFileSync(
        join(api.cwd, '.husky/commit-msg'),
        `
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no-install umi verify-commit $1
`.trimStart(),
      );
      logger.info('Write commit-msg');

      writeFileSync(
        join(api.cwd, '.husky/pre-commit'),
        `
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no-install lint-staged --quiet
`.trimStart(),
      );
      logger.info('Write pre-commit');

      h.installDeps();
    },
  });
};
