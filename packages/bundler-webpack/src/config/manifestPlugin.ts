import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
// @ts-ignore
import { WebpackManifestPlugin } from '@umijs/bundler-webpack/compiled/webpack-manifest-plugin';
import type { Env, IConfig } from '../types';

interface IOpts {
  name?: string;
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function addManifestPlugin(opts: IOpts) {
  const { config, userConfig } = opts;
  if (userConfig.manifest) {
    config.plugin('manifest-plugin').use(WebpackManifestPlugin, [
      {
        fileName: 'asset-manifest.json',
        ...userConfig.manifest,
      },
    ]);
  }
}
