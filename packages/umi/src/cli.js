import chalk from 'chalk';
import { join, dirname } from 'path';
import { existsSync } from 'fs';
import yParser from 'yargs-parser';
import buildDevOpts from './buildDevOpts';

const script = process.argv[2];
const args = yParser(process.argv.slice(3));
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
    require(`./scripts/${script}`);
    break;
  case 'test':
    require(`./scripts/${script}`);
    break;
  default: {
    const Service = require('umi-build-dev/lib/Service').default;
    new Service(buildDevOpts(args)).run(script, args);
    break;
  }
}
