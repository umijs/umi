import { dirname } from 'path';
import yParser from 'yargs-parser';
import signale from 'signale';
import buildDevOpts from './buildDevOpts';

let script = process.argv[2];
const args = yParser(process.argv.slice(3));
// Node version check
const nodeVersion = process.versions.node;
const versions = nodeVersion.split('.');
const major = versions[0];
const minor = versions[1];
if (major * 10 + minor * 1 < 65) {
  signale.error(`Node version must >= 6.5, but got ${major}.${minor}`);
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
