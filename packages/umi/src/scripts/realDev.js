import yParser from 'yargs-parser';
import buildDevOpts from '../buildDevOpts';

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

const args = yParser(process.argv.slice(2));
const opts = buildDevOpts(args);
process.env.NODE_ENV = 'development';

// Service 的引入不能用 import，因为有些要依赖 development 这个 NODE_ENV
const Service = require('umi-build-dev/lib/Service').default;
new Service(opts).run('dev', args);
