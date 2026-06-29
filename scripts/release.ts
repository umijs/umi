import * as logger from '@umijs/utils/src/logger';
import { existsSync } from 'fs';
import getGitRepoInfo from 'git-repo-info';
import { join } from 'path';
import rimraf from 'rimraf';
import 'zx/globals';
import { PATHS } from './.internal/constants';
import { assert, eachPkg, getPkgs } from './.internal/utils';

(async () => {
  const { branch } = getGitRepoInfo();
  logger.info(`branch: ${branch}`);
  const pkgs = getPkgs();
  logger.info(`pkgs: ${pkgs.join(', ')}`);

  // check git status
  logger.event('check git status');
  const isGitClean = (await $`git status --porcelain`).stdout.trim().length;
  assert(!isGitClean, 'git status is not clean');

  // check git remote update
  logger.event('check git remote update');
  await $`git fetch`;
  const gitStatus = (await $`git status --short --branch`).stdout.trim();
  assert(!gitStatus.includes('behind'), `git status is behind remote`);

  // check npm registry
  logger.event('check npm registry');
  const registry = (await $`npm config get registry`).stdout.trim();
  assert(
    registry === 'https://registry.npmjs.org/',
    'npm registry is not https://registry.npmjs.org/',
  );

  // check package changed
  logger.event('check package changed');
  const changed = (await $`lerna changed --loglevel error`).stdout.trim();
  assert(changed, `no package is changed`);

  // check package.json
  logger.event('check package.json info');
  await $`npm run check:packageFiles`;

  // clean
  logger.event('clean');
  eachPkg(pkgs, ({ dir, name }) => {
    logger.info(`clean dist of ${name}`);
    rimraf.sync(join(dir, 'dist'));
  });

  // build packages
  logger.event('build packages');
  await $`npm run build:release`;

  // bump version
  logger.event('bump version');
  await $`lerna version --exact --no-commit-hooks --no-git-tag-version --no-push --loglevel error`;
  const version = require(PATHS.LERNA_CONFIG).version;
  let tag = 'latest';
  if (
    version.includes('-alpha.') ||
    version.includes('-beta.') ||
    version.includes('-rc.')
  ) {
    tag = 'next';
  }
  if (version.includes('-canary.')) tag = 'canary';

  // update example versions
  logger.event('update example versions');
  const examplesDir = PATHS.EXAMPLES;
  const examples = fs.readdirSync(examplesDir).filter((dir) => {
    return (
      !dir.startsWith('.') && existsSync(join(examplesDir, dir, 'package.json'))
    );
  });
  examples.forEach((example) => {
    const pkg = require(join(examplesDir, example, 'package.json'));
    pkg.scripts ||= {};
    pkg.scripts['start'] = 'npm run dev';
    delete pkg.version;
    fs.writeFileSync(
      join(examplesDir, example, 'package.json'),
      `${JSON.stringify(pkg, null, 2)}\n`,
    );
  });

  // update pnpm lockfile
  logger.event('update pnpm lockfile');
  $.verbose = false;
  await $`pnpm i`;
  $.verbose = true;

  // commit
  logger.event('commit');
  await $`git commit --all --message "release: ${version}"`;

  // git tag
  if (tag !== 'canary') {
    logger.event('git tag');
    await $`git tag v${version}`;
  }

  // git push
  logger.event('git push');
  await $`git push origin ${branch} --tags`;

  logger.ready(
    `release commit pushed, GitHub Actions will publish with tag ${tag}`,
  );
})();
