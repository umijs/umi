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
  staticPathPrefix: string;
}

export async function addMiniCSSExtractPlugin(opts: IOpts) {
  const { config, userConfig, useHash, staticPathPrefix } = opts;
  const hash = useHash ? '.[contenthash:8]' : '';
  if (!userConfig.styleLoader) {
    config.plugin('mini-css-extract-plugin').use(MiniCSSExtractPlugin, [
      {
        filename: `${staticPathPrefix}[name]${hash}.css`,
        chunkFilename: opts.userConfig.ssr
          ? // TODO: FIXME
            `${staticPathPrefix}umi${hash}.css`
          : `${staticPathPrefix}[name]${hash}.chunk.css`,
        ignoreOrder: true,
      },
    ]);
  }
}
