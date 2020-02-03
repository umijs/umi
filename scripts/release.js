const { yParser, execa, chalk } = require('@umijs/utils');
const exec = require('./utils/exec');
const getPackages = require('./utils/getPackages');

const cwd = process.cwd();
const args = yParser(process.argv);
const lernaCli = require.resolve('lerna/cli');

function printErrorAndExit(message) {
  console.error(chalk.red(message));
  process.exit(1);
}

async function release() {
  // Check npm registry
  const userRegistry = execa.sync('npm', ['config', 'get', 'registry']).stdout;
  if (userRegistry.includes('https://registry.yarnpkg.com/')) {
    printErrorAndExit(
      `Release failed, please use ${chalk.blue('npm run release')}.`,
    );
  }
  if (!userRegistry.includes('https://registry.npmjs.org/')) {
    const registry = chalk.blue('https://registry.npmjs.org/');
    printErrorAndExit(`Release failed, npm registry must be ${registry}.`);
  }

  // Get updated packages
  const updatedStdout = execa.sync(lernaCli, ['updated']).stdout;
  const updated = updatedStdout
    .split('\n')
    .map(pkg => {
      if (pkg === 'umi') return pkg;
      else return pkg.split('/')[1];
    })
    .filter(Boolean);

  if (!updated.length) {
    printErrorAndExit('Release failed, no updated package is updated.');
  }

  if (!args.publishOnly) {
    // Clean

    // Build
    if (!args.skipBuild) {
      await exec('npm', ['run', 'build']);
    }

    // Bump version
    // Commit
    // Git tag
    // Push
    await exec(lernaCli, [
      'version',
      '--exact',
      '--message',
      'release: v%v',
      // '--no-commit-hooks',
      // '--no-git-tag-version',
      // '--no-push',
    ]);
  }

  // Publish
  // Umi must be the latest.
  const pkgs = args.publishOnly ? getPackages() : updated;
  const currVersion = require('../lerna').version;
  const isNext = isNextVersion(version);
  pkgs
    .sort(a => {
      return a === 'umi' ? 1 : -1;
    })
    .forEach(pkg => {
      const cwd = join(cwd, 'packages', pkg);
      const { name, version } = require(join(cwd, 'package.json'));
      if (version === currVersion) {
        console.log(`Publish package ${name} ${isNext ? 'with next tag' : ''}`);
        const cliArgs = isNext ? ['publish', '--tag', 'next'] : ['publish'];
        const { stdout } = execa.sync('npm', cliArgs, {
          cwd,
        });
        console.log(stdout);
      }
    });
}

release().catch(err => {
  console.error(err);
  process.exit(1);
});
