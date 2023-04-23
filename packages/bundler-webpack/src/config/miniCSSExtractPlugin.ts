// @ts-ignore
import MiniCSSExtractPlugin from '@umijs/bundler-webpack/compiled/mini-css-extract-plugin';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
  useHash: boolean;
}

export async function addMiniCSSExtractPlugin(opts: IOpts) {
  const { config, userConfig, useHash } = opts;
  const hash = useHash ? '.[contenthash:8]' : '';
  if (!userConfig.styleLoader) {
    config.plugin('mini-css-extract-plugin').use(MiniCSSExtractPlugin, [
      {
        filename: `[name]${hash}.css`,
        chunkFilename: opts.userConfig.ssr
          ? // TODO: FIXME
            `umi${hash}.css`
          : `[name]${hash}.chunk.css`,
        ignoreOrder: true,
      },
    ]);
  }
}
