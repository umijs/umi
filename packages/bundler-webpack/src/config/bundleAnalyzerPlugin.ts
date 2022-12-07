import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
// @ts-ignore
import { BundleAnalyzerPlugin } from '@umijs/bundler-webpack/compiled/webpack-bundle-analyzer';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function addBundleAnalyzerPlugin(opts: IOpts) {
  const { config } = opts;
  config.plugin('webpack-bundle-analyzer').use(BundleAnalyzerPlugin, [
    // https://github.com/webpack-contrib/webpack-bundle-analyzer
    {
      analyzerMode: 'server',
      analyzerPort: process.env.ANALYZE_PORT || 8888,
      openAnalyzer: false,
      logLevel: 'info',
      defaultSizes: 'parsed',
      ...opts.userConfig.analyze,
    },
  ]);
}
