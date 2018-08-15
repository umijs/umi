import spawn from 'cross-spawn';
import chalk from 'chalk';
import { join, dirname } from 'path';
import { existsSync } from 'fs';

const script = process.argv[2];
const args = process.argv.slice(3);

// Node version check
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
const pkg = require('../package.json');
updater({ pkg }).notify({ defer: true });

function runScript(script, args, isFork) {
  if (isFork) {
    const child = spawn.sync(
      'node',
      [require.resolve(`./scripts/${script}`)].concat(args),
      { stdio: 'inherit' }, // eslint-disable-line
    );
    process.exit(child.status);
  } else {
    require(`./scripts/${script}`);
  }
}

process.env.UMI_DIR = dirname(require.resolve('../package'));

switch (script) {
  case '-v':
  case '--version':
    console.log(pkg.version);
    if (existsSync(join(__dirname, '../.local'))) {
      console.log(chalk.cyan('@local'));
    }
    break;
  case 'build':
  case 'dev':
    require('atool-monitor').emit();
    runScript(script, args, /* isFork */ true);
    break;
  case 'test':
    runScript(script, args);
    break;
  default: {
    const Service = require('umi-build-dev/lib/Service').default;
    new Service(require('../lib/buildDevOpts').default()).run(
      script,
      require('yargs-parser')(process.argv.slice(3)),
    );
    break;
  }
}
