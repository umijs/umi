import buildDevOpts from './buildDevOpts';

process.env.NODE_ENV = 'development';

export default function(opts = {}) {
  return require('umi-build-dev/lib/dev').default(buildDevOpts(opts));
}

export { fork } from 'umi-build-dev/lib/dev';
