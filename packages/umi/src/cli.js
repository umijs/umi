import { dirname } from 'path';
import yParser from 'yargs-parser';
import signale from 'signale';
import semver from 'semver';
import buildDevOpts from './buildDevOpts';

let script = process.argv[2];
const args = yParser(process.argv.slice(3));

// Node version check
const nodeVersion = process.versions.node;
if (semver.satisfies(nodeVersion, '<6.5')) {
  signale.error(`Node version must >= 6.5, but got ${nodeVersion}`);
  process.exit(1);
}

// Notify update when process exits
const updater = require('update-notifier');
const pkg = require('../package.json');
updater({ pkg }).notify({ defer: true });

process.env.UMI_DIR = dirname(require.resolve('../package'));
process.env.UMI_VERSION = pkg.version;

switch (script) {
  case 'build':
  case 'dev':
  case 'test':
    require(`./scripts/${script}`);
    break;
  case '-v':
  case '--version':
    script = 'version';
  case '-h':
  case '--help':
    script = 'help';
  default: {
    const Service = require('umi-build-dev/lib/Service').default;
    new Service(buildDevOpts(args)).run(script, args);
    break;
  }
}
