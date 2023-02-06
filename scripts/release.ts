import * as logger from '@umijs/utils/src/logger';
import { existsSync } from 'fs';
import getGitRepoInfo from 'git-repo-info';
import { Octokit } from 'octokit';
import open from 'open';
import { join } from 'path';
import qs from 'qs';
import rimraf from 'rimraf';
import 'zx/globals';
import { PATHS } from './.internal/constants';
import { assert, eachPkg, getPkgs } from './.internal/utils';

(async () => {
  const { branch } = getGitRepoInfo();
  logger.info(`branch: ${branch}`);
  const pkgs = getPkgs();
  logger.info(`pkgs: ${pkgs.join(', ')}`);
  const pkgsJsonPath = pkgs.map((pkg) =>
    join(PATHS.PACKAGES, pkg, 'package.json'),
  );

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
  try {
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
  } catch (e: any) {
    // only throw ownership error
    if (e.message.includes('is not owned by')) {
      throw e;
    }
  }

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
  // await $`npm run build:extra`;
  //
  // logger.event('check client code change');
  // const isGitCleanAfterClientBuild = (
  //   await $`git status --porcelain`
  // ).stdout.trim().length;
  // assert(!isGitCleanAfterClientBuild, 'client code is updated');

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
  const allPkgsName = pkgsJsonPath.map((p) => require(p).name);
  examples.forEach((example) => {
    const pkg = require(join(examplesDir, example, 'package.json'));
    pkg.scripts ||= {};
    pkg.scripts['start'] = 'npm run dev';
    // change deps version
    setDepsVersion({
      pkg,
      version,
      deps: allPkgsName,
    });
    delete pkg.version;
    fs.writeFileSync(
      join(examplesDir, example, 'package.json'),
      `${JSON.stringify(pkg, null, 2)}\n`,
    );
  });

  // check independent package version
  // 有点问题，先注释掉
  // 选 y 后，preset-umi 的 package.json 的 version 应该是新版本的，在这里被改回去了
  PATHS.INDEPENDENT_PACKAGES;
  checkIndependentPackageChanged;
  // logger.event('check independent package version');
  // for await (const fromPkg of PATHS.INDEPENDENT_PACKAGES) {
  //   await checkIndependentPackageChanged({
  //     pkgDirPath: fromPkg,
  //     updateTo: pkgsJsonPath,
  //   });
  // }

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

  // npm publish
  logger.event('pnpm publish');
  $.verbose = false;
  const innerPkgs = pkgs.filter((pkg) => !['umi', 'max'].includes(pkg));
  const canReleaseNotes = !['canary', 'rc', 'beta', 'alpha'].find((item) =>
    version.includes(item),
  );
  // FIXME: getReleaseNotes don't work with 404 error
  if (false && canReleaseNotes) {
    // get release notes
    logger.event('get release notes');
    const { releaseNotes } = await getReleaseNotes(version);

    // generate changelog
    logger.event('generate changelog');
    generateChangelog(releaseNotes);

    // release by GitHub
    logger.event('release by github');
    releaseByGithub(releaseNotes, version);
  }

  // check 2fa config
  let otpArg: string[] = [];
  if (
    (await $`npm profile get "two-factor auth"`).toString().includes('writes')
  ) {
    let code = '';
    do {
      // get otp from user
      code = await question('This operation requires a one-time password: ');
      // generate arg for zx command
      // why use array? https://github.com/google/zx/blob/main/docs/quotes.md
      otpArg = ['--otp', code];
    } while (code.length !== 6);
  }

  await Promise.all(
    innerPkgs.map(async (pkg) => {
      await $`cd packages/${pkg} && npm publish --tag ${tag} ${otpArg}`;
      logger.info(`+ ${pkg}`);
    }),
  );
  await $`cd packages/umi && npm publish --tag ${tag} ${otpArg}`;
  logger.info(`+ umi`);
  await $`cd packages/max && npm publish --tag ${tag} ${otpArg}`;
  logger.info(`+ @umijs/max`);
  $.verbose = true;

  // sync tnpm
  logger.event('sync tnpm');
  $.verbose = false;
  await Promise.all(
    pkgs.map(async (pkg) => {
      const { name } = require(path.join(PATHS.PACKAGES, pkg, 'package.json'));
      logger.info(`sync ${name}`);
      await $`tnpm sync ${name}`;
    }),
  );
  $.verbose = true;
})();

function setDepsVersion(opts: {
  deps: string[];
  pkg: Record<string, any>;
  version: string;
}) {
  const { deps, pkg, version } = opts;
  pkg.dependencies ||= {};
  deps.forEach((dep) => {
    if (pkg?.dependencies?.[dep]) {
      pkg.dependencies[dep] = version;
    }
    if (pkg?.devDependencies?.[dep]) {
      pkg.devDependencies[dep] = version;
    }
  });
  return pkg;
}

export async function getReleaseNotes(version: string) {
  const GITHUB_TOKEN_FILE = '.github_token';
  const OWNER = 'umijs';
  const REPO = 'umi';
  const token = fs
    .readFileSync(path.join(__dirname, '..', GITHUB_TOKEN_FILE), 'utf-8')
    .trim();
  const octokit = new Octokit({
    auth: token,
  });
  const releaseNotesRes = await octokit.request(
    `POST /repos/${OWNER}/${REPO}/releases/generate-notes`,
    {
      tag_name: `v${version}`,
    },
  );
  const releaseNotes = releaseNotesRes.data.body;
  return { releaseNotes };
}

function releaseByGithub(releaseNotes: string, version: string) {
  const releaseParams = {
    tag: version,
    title: `v${version}`,
    body: releaseNotes,
    prerelease: false,
  };
  open(
    `https://github.com/umijs/umi/releases/new?${qs.stringify(releaseParams)}`,
  );
}

function generateChangelog(releaseNotes: string) {
  const CHANGELOG_PATH = join(PATHS.ROOT, 'TMP_CHANGELOG.md');
  const hasFile = fs.existsSync(CHANGELOG_PATH);
  let newStr = '';
  if (hasFile) {
    const str = fs.readFileSync(CHANGELOG_PATH, 'utf-8');
    const arr = str.split('# umi changelog');
    newStr = `# umi changelog\n\n${releaseNotes}${arr[1]}`;
  } else {
    newStr = `# umi changelog\n\n${releaseNotes}`;
  }
  fs.writeFileSync(CHANGELOG_PATH, newStr);
}

async function checkIndependentPackageChanged(opts: {
  pkgDirPath: string;
  updateTo?: string[];
}) {
  console.log(
    chalk.grey(`> Check independent version packages weather need publish.`),
  );
  const { pkgDirPath, updateTo = [] } = opts;
  $.verbose = false;
  const latestTag = (await $`git describe --abbrev=0 --tags`).stdout.trim();
  const diff = (
    await $`git diff ${latestTag} --name-only ${pkgDirPath}`
  ).stdout.trim();
  $.verbose = true;
  if (!diff?.length) {
    return;
  }
  const answer = await question(
    `Changes detected in ${chalk.bold.yellow(
      path.relative(PATHS.ROOT, pkgDirPath),
    )} since ${chalk.bold.blue(latestTag)}.
Check published package and update version if necessary.
Continue? (n/y) `,
  );
  if (answer.toLowerCase() !== 'y') {
    console.log(chalk.red(`> Cancelled, please check version and publish.`));
    process.exit(0);
  }
  // update version to packages/*
  const pkgJson = require(path.join(pkgDirPath, 'package.json'));
  const { name, version } = pkgJson;
  const newVersion = `^${version}`;
  updateTo.forEach((p) => {
    const targetPkgPath = p.endsWith('package.json')
      ? p
      : path.join(p, 'package.json');
    const targetPkg = require(targetPkgPath);
    const depProd = targetPkg?.dependencies?.[name];
    const depDev = targetPkg?.devDependencies?.[name];
    let updated = false;
    if (depProd && depProd !== newVersion) {
      targetPkg.dependencies[name] = newVersion;
      updated = true;
    }
    if (depDev && depDev !== newVersion) {
      targetPkg.devDependencies[name] = newVersion;
      updated = true;
    }
    if (updated) {
      fs.writeFileSync(
        targetPkgPath,
        `${JSON.stringify(targetPkg, null, 2)}\n`,
      );
      console.log(
        `Auto updated package ${chalk.bold.cyan(
          name,
        )} version ${chalk.bold.blue(newVersion)} to ${chalk.bold.green(
          path.relative(PATHS.ROOT, targetPkgPath),
        )}`,
      );
    }
  });
  console.log(chalk.grey(`> Check independent version packages end.`));
}
