import yParser from 'yargs-parser';
import { dirname } from 'path';
import buildDevOpts from '../buildDevOpts';

process.env.UMI_DIR = dirname(require.resolve('../../package'));
process.env.NODE_ENV = 'production';

const argv = yParser(process.argv.slice(2));
const opts = {
  ...argv,
  plugins: argv.plugins ? argv.plugins.split(',') : [],
};
const Service = require('umi-build-dev/lib/Service').default;
new Service(buildDevOpts(opts)).run('build', opts);
