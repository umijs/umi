import assert from 'assert';
import chalk from 'chalk';
import { existsSync } from 'fs';
import { join } from 'path';
import { getPathWithUrl } from './download';

const debug = require('debug')('umi-build-dev:blockPlugin');

export default api => {
  const { log, paths } = api;

  function generate(args = {}) {
    try {
      const url = args._[0];
      assert(
        url,
        `run ${chalk.cyan.underline('umi help block')} to checkout the usage`,
      );
      const MaterialGenerate = require('./block').default(api);
      debug(`get url ${url}`);
      const sourcePath = getPathWithUrl(url, log, args);
      const isUserUseYarn = existsSync(join(paths.cwd, 'yarn.lock'));
      if (isUserUseYarn) {
        log.log(
          'find yarn.lock in your project, use yarn as the default npm client',
        );
      }

      const defaultNpmClient = isUserUseYarn ? 'yarn' : 'npm';
      const {
        path,
        npmClient = defaultNpmClient,
        dryRun,
        skipDependencies,
        skipModifyRoutes,
      } = args;
      debug(
        `get local sourcePath: ${sourcePath} and npmClient: ${npmClient} and name: ${path}`,
      );
      const generate = new MaterialGenerate(process.argv.slice(4), {
        sourcePath,
        npmClient,
        path,
        dryRun,
        skipDependencies,
        skipModifyRoutes,
        env: {
          cwd: api.cwd,
        },
        resolved: __dirname,
      });

      generate
        .run(() => {})
        .catch(e => {
          debug(e);
          log.error(e.message);
        });
    } catch (e) {
      debug(e);
      log.error(`Use block failed, ${e.message}`);
    }
  }

  const details = `
Examples:

  ${chalk.gray('# get block `demo` which in umi official blocks')}
  umi block https://github.com/umijs/umi-blocks/tree/master/demo

  umi block demo ${chalk.gray('# a shortcut command')}

  umi block demo --path /users/settings/profile ${chalk.gray(
    '# add route to the layout',
  )}
  `.trim();

  api.registerCommand(
    'block',
    {
      description: 'get block',
      usage: `umi block <a github/gitlab/gitrepo url> [options]`,
      options: {
        '--path': "path name, default is name in block's package.json",
        '--branch':
          'git branch, this usually does not need when you use a github url with branch itself',
        '--dry-run':
          'for test, block would have done without actually installing and download anything',
        '--npm-client':
          'use special npm client, default is npm or yarn(when yarn.lock exist in you project)',
        '--skip-dependencies':
          'skip block dependencies install and conflict check',
        '--skip-modify-routes':
          'skip modify routes when you use conventional routes',
      },
      details,
    },
    generate,
  );
};
