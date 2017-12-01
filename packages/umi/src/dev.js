import { resolve } from 'path';

export default function(opts) {
  return require('umi-build-dev/lib/dev').default({
    babel: resolve(__dirname, '../babel'),
    enableCSSModules: true,
    extraResolveModules: [resolve(__dirname, '../../node_modules')],
    ...opts,
  });
}

export { fork } from 'umi-build-dev/lib/dev';
