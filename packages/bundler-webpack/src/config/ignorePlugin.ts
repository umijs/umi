import { IgnorePlugin } from '../../compiled/webpack';
import Config from '../../compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function addIgnorePlugin(opts: IOpts) {
  const { config, userConfig } = opts;
  if (userConfig.ignoreMomentLocale) {
    config.plugin('ignore-moment-locale').use(IgnorePlugin, [
      {
        resourceRegExp: /^\.\/locale$/,
        contextRegExp: /moment$/,
      },
    ]);
  }
}
