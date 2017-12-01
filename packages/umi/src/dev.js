import { resolve } from 'path';

export default function(opts) {
  return require('umi-buildAndDev/lib/dev').default({
    babel: resolve(__dirname, '../babel'),
    enableCSSModules: true,
    extraResolveModules: [resolve(__dirname, '../../node_modules')],
    ...opts,
  });
}

export { fork } from 'umi-buildAndDev/lib/dev';
