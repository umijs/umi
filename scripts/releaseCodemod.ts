import { logger } from '@umijs/utils';
import getGitRepoInfo from 'git-repo-info';
import { join } from 'path';
import 'zx/globals';

function assert(v: unknown, message: string) {
  if (!v) {
    logger.error(message);
    process.exit(1);
  }
}

(async () => {
  const cwd = process.cwd();
  const pkg = '@umijs/codemod';
  const dirName = 'codemod';
  const { branch } = getGitRepoInfo();
  logger.info(`branch: ${branch}`);
  logger.info(`cwd: ${cwd}`);

  // check git status
  logger.event('check git status');
  const isGitClean = (await $`git status --porcelain`).stdout.trim().length;
  assert(!isGitClean, 'git status is not clean');

  // check git remote update
  logger.event('check git remote update');
  await $`git fetch`;
  const gitStatus = (await $`git status --short --branch`).stdout.trim();
  assert(!gitStatus.includes('behind'), `git status is behind remote`);

  // check npm ownership
  logger.event('check npm ownership');
  const whoami = (await $`npm whoami`).stdout.trim();
  const owners = (await $`npm owner ls ${pkg}`).stdout
    .trim()
    .split('\n')
    .map((line) => {
      return line.split(' ')[0];
    });
  assert(owners.includes(whoami), `${pkg} is not owned by ${whoami}`);

  // bump version
  logger.event(`bump version of ${pkg}`);
  const pkgPath = join(cwd, dirName);
  logger.info(
    `current version: ${require(join(pkgPath, 'package.json')).version}`,
  );
  const version = await question(`What's next version? `);
  await $`cd ${pkgPath} && npm version ${version}`;

  // npm publish
  logger.event('npm publish');
  $.verbose = false;
  await $`cd ${pkgPath} && npm publish`;
  logger.info(`+ ${pkg}@${version}`);
  $.verbose = true;

  // commit
  logger.event('commit');
  await $`git commit --all --message "release: ${pkg}@${version}"`;

  // git push
  logger.event('git push');
  await $`git push origin ${branch}`;
})();
