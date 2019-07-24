import yParser from 'yargs-parser';
import { join } from 'path';
import { coverageReport } from 'umi-test';
import buildDevOpts from '../buildDevOpts';

coverageReport({
  targetDir: join(__dirname, '../../../../node_modules'),
  fileName: 'realDev',
});

let closed = false;

// kill(2) Ctrl-C
process.once('SIGINT', () => onSignal('SIGINT'));
// kill(3) Ctrl-\
process.once('SIGQUIT', () => onSignal('SIGQUIT'));
// kill(15) default
process.once('SIGTERM', () => onSignal('SIGTERM'));

function onSignal() {
  if (closed) return;
  closed = true;
  process.exit(0);
}

process.env.NODE_ENV = 'development';

const args = yParser(process.argv.slice(2));
const Service = require('umi-build-dev/lib/Service').default;
new Service(buildDevOpts(args)).run('dev', args);
