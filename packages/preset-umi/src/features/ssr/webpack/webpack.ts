import * as bundlerWebpack from '@umijs/bundler-webpack';
import type WebpackChain from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { lodash, logger } from '@umijs/utils';
import { dirname, resolve } from 'path';
import { IApi } from '../../../types';
import { absServerBuildPath } from '../utils';
import { Env } from "@umijs/bundler-webpack/dist/types";

export const build = async (api: IApi, opts: any) => {
  logger.wait('[SSR] Compiling...');
  const now = new Date().getTime();
  const bundlerOpts: any = lodash.cloneDeep(opts);
  const oChainWebpack = bundlerOpts.chainWebpack;
  const useHash = api.config.hash && api.env === Env.production;
  // disable deadCode check
  delete bundlerOpts.config.deadCode;

  // enable exportOnlyLocals for ssr
  // ref: https://webpack.js.org/loaders/css-loader/#exportonlylocals
  // FIXME: compile failed when enable exportOnlyLocals
  // bundlerOpts.config.cssLoaderModules = Object.assign({}, bundlerOpts.config.cssLoaderModules, { exportOnlyLocals: true });

  // disable async chunk
  bundlerOpts.extraBabelPlugins.push([
    require.resolve('babel-plugin-dynamic-import-node'),
    {},
    'umi-server-dynamic-import-node',
  ]);

  // strip onBuildComplete hook
  delete bundlerOpts.onBuildComplete;

  // enable watch mode in dev
  bundlerOpts.watch = api.env === 'development';

  // override chainWebpack
  bundlerOpts.chainWebpack = async (memo: WebpackChain) => {
    const absOutputFile = absServerBuildPath(api);

    await oChainWebpack(memo);
    memo.entryPoints.clear();
    memo.entry('umi').add(resolve(api.paths.absTmpPath, 'umi.server.ts'));
    memo.target('node');
    memo.name('umi');
    memo.devtool(false);

    memo.output
      .path(dirname(absOutputFile))
      .filename(useHash ? 'umi.[contenthash:8].server.js' : 'umi.server.js')
      .chunkFilename(
        useHash ? 'umi.[contenthash:8].server.js' : 'umi.server.js',
      )
      .libraryTarget('commonjs2');

    // remove useless progress plugin
    memo.plugins.delete('progress-plugin');

    // do not minify
    memo.optimization.minimize(false);

    return memo;
  };

  await bundlerWebpack.build(bundlerOpts);

  const diff = new Date().getTime() - now;
  logger.info(`[SSR] Compiled in ${diff}ms`);
};
