import { resolve } from 'path';

const debug = require('debug')('umi:build');
process.env.NODE_ENV = 'production';

export default function(opts = {}) {
  const { extraResolveModules } = opts;
  debug(`opts: ${JSON.stringify(opts)}`);
  delete opts.extraResolveModules;

  return require('umi-build-dev/lib/build').default({
    cwd: process.env.APP_ROOT,
    // eslint-disable-line
    babel: resolve(__dirname, './babel'),
    extraResolveModules: [
      ...(extraResolveModules || []),
      resolve(__dirname, '../../node_modules'),
    ],
    hash: true,
    ...opts,
  });
}
