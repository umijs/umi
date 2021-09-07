import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import ProgressPlugin from '../plugins/ProgressPlugin';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function applyProgressPlugin(opts: IOpts) {
  const { config, userConfig, cwd, env } = opts;
  config;
  userConfig;
  cwd;
  env;
  config.plugin('progress-plugin').use(ProgressPlugin, [{}]);
}
