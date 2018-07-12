import Service from 'umi-build-dev/lib/Service';
import buildDevOpts from './buildDevOpts';

process.env.NODE_ENV = 'production';

export default function(opts = {}) {
  new Service(null, buildDevOpts(opts)).run('build');
}
