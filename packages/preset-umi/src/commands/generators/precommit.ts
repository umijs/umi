import { GeneratorType } from '@umijs/core';
import { logger, execa } from '@umijs/utils';
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
      const cliName = api.appData.umi.cliName;

      h.addDevDeps({
        husky: '^8',
        prettier: '^2',
        typescript: '^4',
        'lint-staged': '^13',
      });

      h.addScript('prepare', 'husky install');

      // create .lintstagedrc
      if (
        !existsSync(join(api.cwd, '.lintstagedrc')) &&
        !api.pkg['lint-staged']
      ) {
        writeFileSync(
          join(api.cwd, '.lintstagedrc'),
          `
{
  "*.{md,json}": [
    "prettier --cache --write"
  ],
  "*.{js,jsx}": [
    "${cliName} lint --fix --eslint-only",
    "prettier --cache --write"
  ],
  "*.{css,less}": [
    "${cliName} lint --fix --stylelint-only",
    "prettier --cache --write"
  ],
  "*.ts?(x)": [
    "${cliName} lint --fix --eslint-only",
    "prettier --cache --parser=typescript --write"
  ]
}
`.trimStart(),
        );
        logger.info('Write .lintstagedrc');
      }

      // create .husky
      if (!existsSync(join(api.cwd, '.husky'))) {
        mkdirSync(join(api.cwd, '.husky'));
        logger.info('Create .husky');
      }

      // create commit-msg
      if (!existsSync(join(api.cwd, '.husky/commit-msg'))) {
        writeFileSync(
          join(api.cwd, '.husky/commit-msg'),
          `
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
  
npx --no-install ${cliName} verify-commit $1
`.trimStart(),
        );
        logger.info('Write commit-msg');
        if (process.platform !== 'win32') {
          execa.execaCommandSync('chmod +x .husky/commit-msg');
        }
      }

      // create pre-commit
      if (!existsSync(join(api.cwd, '.husky/pre-commit'))) {
        writeFileSync(
          join(api.cwd, '.husky/pre-commit'),
          `
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
  
npx --no-install lint-staged --quiet
`.trimStart(),
        );
        logger.info('Write pre-commit');
        if (process.platform !== 'win32') {
          execa.execaCommandSync('chmod +x .husky/pre-commit');
        }
      }

      h.installDeps();
    },
  });
};
