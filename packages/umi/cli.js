const spawn = require('cross-spawn');
const chalk = require('chalk');
const { join, dirname } = require('path');
const { existsSync } = require('fs');
const yParser = require('yargs-parser');
const Service = require('umi-build-dev/lib/Service').default;

const script = process.argv[2];
const rawArgs = process.argv.slice(3);
const args = yParser(rawArgs);

const nodeVersion = process.versions.node;
const versions = nodeVersion.split('.');
const major = versions[0];
const minor = versions[1];

if (major * 10 + minor * 1 < 65) {
  console.log(`Node version must >= 6.5, but got ${major}.${minor}`);
  process.exit(1);
}

// Notify update when process exits
const updater = require('update-notifier');
const pkg = require('./package.json');
updater({ pkg: pkg }).notify({ defer: true });

function runScript(script, rawArgs, isFork) {
  if (isFork) {
    const child = spawn.sync(
      'node',
      [require.resolve(`./lib/scripts/${script}`)].concat(rawArgs),
      { stdio: 'inherit' }, // eslint-disable-line
    );
    process.exit(child.status);
  } else {
    require(`./lib/scripts/${script}`);
  }
}

process.env.UMI_DIR = dirname(require.resolve('./package'));

const scriptAlias = {
  g: 'generate', // eslint-disable-line
};
const aliasedScript = scriptAlias[script] || script;

switch (aliasedScript) {
  case '-v':
  case '--version':
    console.log(pkg.version);
    if (existsSync(join(__dirname, './.local'))) {
      console.log(chalk.cyan('@local'));
    }
    break;
  case 'build':
  case 'dev':
    require('atool-monitor').emit();
    runScript(aliasedScript, rawArgs, /* isFork */ true);
    break;
  case 'test':
    runScript(aliasedScript, rawArgs);
    break;
  default:
    new Service(require('./lib/buildDevOpts').default(args)).run(script, args);
    break;
}
