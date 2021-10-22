// @ts-ignore
import FastRefreshPlugin from '@pmmmwh/react-refresh-webpack-plugin/lib';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
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
  const { fastRefresh } = userConfig;
  const isDev = opts.env === Env.development;
  const isMfsu = name === MFSU_NAME;
  if (fastRefresh === false) return;
  // TODO: Should only run in react csr
  if (isDev && !isMfsu) {
    config
      .plugin('fastRefresh')
      .after('hmr')
      .use(FastRefreshPlugin, [{ overlay: false }]);
  }
}
