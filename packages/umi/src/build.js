import { resolve } from 'path';

export default function(opts) {
  return require('umi-build-dev/lib/build')({
    babel: resolve(__dirname, './babel'),
    enableCSSModules: true,
    extraResolveModules: [resolve(__dirname, '../../node_modules')],
    hash: true,
    ...opts,
  });
}
