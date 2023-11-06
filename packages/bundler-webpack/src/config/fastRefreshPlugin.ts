import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
// @ts-ignore
import FastRefreshPlugin from '@umijs/react-refresh-webpack-plugin/lib';
import { MFSU_NAME } from '../constants';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
  browsers: any;
  name?: string;
}

export async function addFastRefreshPlugin(opts: IOpts) {
  const { config, userConfig, name } = opts;
  const isDev = opts.env === Env.development;
  const useFastRefresh =
    isDev && userConfig.fastRefresh !== false && name !== MFSU_NAME;
  // TODO: Should only run in react csr
  if (useFastRefresh) {
    config
      .plugin('fastRefresh')
      .after('hmr')
      .use(FastRefreshPlugin, [{ overlay: false }]);
  }
}
