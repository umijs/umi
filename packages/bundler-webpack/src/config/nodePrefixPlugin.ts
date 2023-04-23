import { NormalModuleReplacementPlugin } from '@umijs/bundler-webpack/compiled/webpack';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  name?: string;
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function addNodePrefixPlugin(opts: IOpts) {
  const { config } = opts;
  config.plugin('node-prefix-plugin').use(NormalModuleReplacementPlugin, [
    /^node:/,
    (resource) => {
      resource.request = resource.request.replace(/^node:/, '');
    },
  ]);
}
