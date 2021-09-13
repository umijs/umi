// @ts-ignore
import MiniCSSExtractPlugin from '@umijs/bundler-webpack/compiled/mini-css-extract-plugin';
import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function addMiniCSSExtractPlugin(opts: IOpts) {
  const { config, userConfig, env } = opts;

  const hash =
    env !== Env.development && userConfig.hash ? '.[contenthash:8]' : '';
  if (!userConfig.styleLoader) {
    config.plugin('mini-css-extract-plugin').use(MiniCSSExtractPlugin, [
      {
        filename: `[name]${hash}.css`,
        chunkFilename: `[name]${hash}.chunk.css`,
        ignoreOrder: true,
      },
    ]);
  }
}
