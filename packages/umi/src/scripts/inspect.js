import yParser from 'yargs-parser';
import buildDevOpts from '../buildDevOpts';

const args = yParser(process.argv.slice(2));

if (args.mode === 'production') {
  process.env.NODE_ENV = 'production';
} else {
  process.env.NODE_ENV = 'development';
}

const Service = require('umi-build-dev/lib/Service').default;
new Service(buildDevOpts(args)).run('inspect', args);
