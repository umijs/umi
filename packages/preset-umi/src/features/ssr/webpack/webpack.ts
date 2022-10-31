import { lodash, logger } from '@umijs/utils';
import * as bundlerWebpack from '@umijs/bundler-webpack';
import type WebpackChain from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { IApi } from '../../../types';
import { absServerBuildPath } from '../utils';
import { dirname, resolve } from 'path';

export const build = async (api: IApi, opts: any) => {
  logger.wait('[SSR] Compiling...');
  const now = new Date().getTime();
  const bundlerOpts: any = lodash.cloneDeep(opts);
  const oChainWebpack = bundlerOpts.chainWebpack;

  // disable deadCode check
  delete bundlerOpts.config.deadCode;

  // use inline styles via style-loader
  bundlerOpts.config.styleLoader ??= {};

  // disable async chunk
  bundlerOpts.extraBabelPlugins.push([
    require.resolve('babel-plugin-dynamic-import-node'),
    {},
    'umi-server-dynamic-import-node',
  ]);

  // strip onBuildComplete hook
  delete bundlerOpts.onBuildComplete;

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
      .filename('umi.server.js')
      .chunkFilename('[name].server.js')
      .libraryTarget('commonjs2');

    // use isomorphic-style-loader
    ['css', 'less', 'sass'].forEach((name) => {
      Object.values(memo.module.rule(name).oneOfs.entries()).forEach((rule) => {
        rule
          .use('style-loader')
          .loader(require.resolve('isomorphic-style-loader'));
      });
    });

    // remove useless progress plugin
    memo.plugins.delete('progress-plugin');

    // do not minify
    memo.optimization.minimize(false);

    // enable watch mode in dev
    if (api.env === 'development') {
      memo.watch(true);
    }

    return memo;
  };

  await bundlerWebpack.build(bundlerOpts);

  const diff = new Date().getTime() - now;
  logger.info(`[SSR] Compiled in ${diff}ms`);
};
