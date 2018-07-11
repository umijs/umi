import Service from 'umi-build-dev/lib/Service';
import buildDevOpts from './buildDevOpts';

process.env.NODE_ENV = 'development';

export default function(opts = {}) {
  new Service(null, buildDevOpts(opts)).run('dev');
  // return require('umi-build-dev/lib/Service').default(buildDevOpts(opts));
}
