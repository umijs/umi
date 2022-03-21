import { chalk } from '@umijs/utils';
import assert from 'assert';
import { readFileSync } from 'fs';
import { IApi } from '../types';

export default (api: IApi) => {
  api.describe({
    key: 'verifyCommit',
    config: {
      schema(Joi) {
        return Joi.object({
          scope: Joi.array().items(Joi.string()),
          allowEmoji: Joi.boolean(),
        });
      },
    },
  });

  api.registerCommand({
    name: 'verify-commit',
    fn({ args }) {
      api.logger.info('verify-commit');

      const msgPath = args._[0];
      assert(msgPath, 'msgPath is required');

      let msg = readFileSync(msgPath!, 'utf-8').trim();
      msg = removeComment(msg);

      // ref:
      // https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit-message-header
      const emoji = `(((\ud83c[\udf00-\udfff])|(\ud83d[\udc00-\ude4f\ude80-\udeff])|[\u2600-\u2B55]) )?`;
      const scope = api.config.verifyCommit?.scope || [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'workflow',
        'build',
        'ci',
        'chore',
        'types',
        'wip',
        'release',
        'dep',
        'example',
        'Merge',
      ];
      const commitRE = new RegExp(
        `^${
          api.config.verifyCommit?.allowEmoji ? emoji : ''
        }(revert: )?(${scope.join('|')})(\\(.+\\))?: .{1,50}`,
      );
      if (!commitRE.test(msg)) {
        console.log();
        console.log(`Error: ${chalk.red(`Invalid commit message format.`)}`);
        console.log();
        console.log(
          `Proper commit message format is required for automated changelog generation.`,
        );
        console.log(`Examples:`);
        console.log();
        console.log(chalk.green(`  chore(release): update changelog`));
        console.log(
          chalk.green(`  fix(core): handle events on blur (close #28)`),
        );
        console.log();
        process.exit(1);
      }
    },
  });
};

function removeComment(msg: string) {
  return msg.replace(/^#.*[\n\r]*/gm, '');
}
