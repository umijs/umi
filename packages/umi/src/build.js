import { resolve } from 'path';

export default function(opts) {
  return require('umi-buildAndDev/lib/build').default({
    babel: resolve(__dirname, '../babel'),
    enableCSSModules: true,
    extraResolveModules: [resolve(__dirname, '../../node_modules')],
    hash: true,
    ...opts,
  });
}
