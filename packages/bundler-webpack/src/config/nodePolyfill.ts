import { ProvidePlugin } from '@umijs/bundler-webpack/compiled/webpack';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function addNodePolyfill(opts: IOpts) {
  const { config } = opts;

  config.plugin('node-polyfill-provider').use(ProvidePlugin, [
    {
      Buffer: ['buffer', 'Buffer'],
    },
  ]);

  const nodeLibs = require('node-libs-browser');
  config.resolve.fallback.merge({
    ...Object.keys(nodeLibs).reduce<Record<string, boolean>>((memo, key) => {
      if (nodeLibs[key]) {
        memo[key] = nodeLibs[key];
      } else {
        memo[key] = false;
      }
      return memo;
    }, {}),
    http: false,
    https: false,
  });
}
