import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function applyPurgeCSSWebpackPlugin(opts: IOpts) {
  const { config, userConfig, cwd, env } = opts;
  config;
  userConfig;
  cwd;
  env;

  if (userConfig.purgeCSS && env === Env.production) {
    config
      .plugin('purgecss-webpack-plugin')
      .use(require('@umijs/bundler-webpack/compiled/purgecss-webpack-plugin'), [
        {
          paths: [],
        },
      ]);
  }
}
