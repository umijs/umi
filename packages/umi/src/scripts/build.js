import yParser from 'yargs-parser';
import buildDevOpts from '../buildDevOpts';

process.env.NODE_ENV = 'production';
process.env.UMI_UI = 'none';

const args = yParser(process.argv.slice(2));
const Service = require('umi-build-dev/lib/Service').default;
new Service(buildDevOpts(args)).run('build', args);
