import * as logger from '@umijs/utils/src/logger';
import { existsSync } from 'fs';
import getGitRepoInfo from 'git-repo-info';
import { join } from 'path';
import rimraf from 'rimraf';
import 'zx/globals';
import { assert, eachPkg, getPkgs } from './utils';

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

  // check npm ownership
  logger.event('check npm ownership');
  const whoami = (await $`npm whoami`).stdout.trim();
  await Promise.all(
    ['umi', '@umijs/core'].map(async (pkg) => {
      const owners = (await $`npm owner ls ${pkg}`).stdout
        .trim()
        .split('\n')
        .map((line) => {
          return line.split(' ')[0];
        });
      assert(owners.includes(whoami), `${pkg} is not owned by ${whoami}`);
    }),
  );

  // clean
  logger.event('clean');
  eachPkg(pkgs, ({ dir, name }) => {
    logger.info(`clean dist of ${name}`);
    rimraf.sync(join(dir, 'dist'));
  });

  // build packages
  logger.event('build packages');
  await $`npm run build:release`;
  await $`npm run build:extra`;

  // generate changelog
  // TODO
  logger.event('generate changelog');

  // bump version
  logger.event('bump version');
  await $`lerna version --exact --no-commit-hooks --no-git-tag-version --no-push --loglevel error`;
  const version = require('../lerna.json').version;

  // update example versions
  logger.event('update example versions');
  const examplesDir = join(__dirname, '../examples');
  const examples = fs.readdirSync(examplesDir).filter((dir) => {
    return (
      !dir.startsWith('.') && existsSync(join(examplesDir, dir, 'package.json'))
    );
  });
  examples.forEach((example) => {
    const pkg = require(join(
      __dirname,
      '../examples',
      example,
      'package.json',
    ));
    pkg.scripts['start'] = 'npm run dev';
    pkg.dependencies ||= {};
    if (pkg.dependencies['umi']) pkg.dependencies['umi'] = version;
    if (pkg.dependencies['@umijs/pro'])
      pkg.dependencies['@umijs/pro'] = version;
    if (pkg.dependencies['@umijs/plugins'])
      pkg.dependencies['@umijs/plugins'] = version;
    if (pkg.dependencies['@umijs/bundler-vite'])
      pkg.dependencies['@umijs/bundler-vite'] = version;
    // for mfsu-independent example update dep version
    if (pkg.devDependencies?.['@umijs/mfsu']) {
      pkg.devDependencies['@umijs/mfsu'] = version;
    }
    delete pkg.version;
    fs.writeFileSync(
      join(__dirname, '../examples', example, 'package.json'),
      JSON.stringify(pkg, null, 2),
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
  logger.event('git tag');
  await $`git tag v${version}`;

  // git push
  logger.event('git push');
  await $`git push origin ${branch} --tags`;

  // npm publish
  logger.event('pnpm publish');
  $.verbose = false;
  const innerPkgs = pkgs.filter(
    // do not publish father
    (pkg) => !['umi', 'pro', 'father'].includes(pkg),
  );
  let tag = 'latest';
  if (
    version.includes('-alpha.') ||
    version.includes('-beta.') ||
    version.includes('-rc.')
  ) {
    tag = 'next';
  }
  if (version.includes('-canary.')) tag = 'canary';
  await Promise.all(
    innerPkgs.map(async (pkg) => {
      await $`cd packages/${pkg} && npm publish --tag ${tag}`;
      logger.info(`+ ${pkg}`);
    }),
  );
  await $`cd packages/umi && npm publish --tag ${tag}`;
  logger.info(`+ umi`);
  await $`cd packages/pro && npm publish --tag ${tag}`;
  logger.info(`+ @umijs/pro`);
  $.verbose = true;

  // sync tnpm
  logger.event('sync tnpm');
  $.verbose = false;
  await Promise.all(
    pkgs.map(async (pkg) => {
      await $`tnpm sync ${pkg}`;
    }),
  );
  $.verbose = true;
})();
