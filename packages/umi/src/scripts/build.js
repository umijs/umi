import buildDevOpts from '../buildDevOpts';

process.env.NODE_ENV = 'production';

const args = process.argv.slice(2);
const Service = require('umi-build-dev/lib/Service').default;
new Service(buildDevOpts(args)).run('build', args);
