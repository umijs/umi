import buildDevOpts from './buildDevOpts';

process.env.NODE_ENV = 'production';

export default function(opts = {}) {
  return require('umi-build-dev/lib/build').default(
    buildDevOpts({
      ...opts,
      hash: true,
    }),
  );
}
