import { Env } from '@umijs/bundler-webpack/dist/types';
import { fsExtra, logger } from '@umijs/utils';
import { existsSync, writeFileSync } from 'fs';
import path, { dirname, join } from 'path';

import { IApi } from 'umi';
import { absServerBuildPath } from '../utils';

export const build = async (api: IApi, opts: any) => {
  logger.wait('[SSR] Compiling by mako...');
  const now = new Date().getTime();
  const absOutputFile = absServerBuildPath(api);

  // @ts-ignore
  const { build } = require(process.env.OKAM);

  require('@umijs/bundler-webpack/dist/requireHook');
  const useHash = api.config.hash && api.env === Env.production;

  const entry = path.resolve(api.paths.absTmpPath, 'umi.server.ts');
  const oChainWebpack = opts.chainWebpack;
  const options = {
    cwd: api.cwd,
    entry: {
      'umi.server': entry,
    },
    config: {
      ...api.config,
      hash: true,
      outputPath: path.dirname(absOutputFile),
      manifest: {
        fileName: 'build-manifest.json',
      },
      devtool: false,
      cjs: true,
      dynamicImportToRequire: true,
      platform: 'node',
    },
    chainWebpack: async (memo: any) => {
      const absOutputFile = absServerBuildPath(api);

      await oChainWebpack(memo, { ...opts, ssr: true });
      memo.entryPoints.clear();
      memo
        .entry('umi')
        .add(path.resolve(api.paths.absTmpPath, 'umi.server.ts'));
      memo.target('node');
      memo.name('umi');
      memo.devtool(false);

      memo.output
        .path(path.dirname(absOutputFile))
        // 避免多 chunk 时的命名冲突，虽然 ssr 在项目里禁用了 import() 语法，但 node_modules 下可能存在的 import() 没有被 babel 插件覆盖到
        .filename(
          useHash ? '[name].[contenthash:8].server.js' : '[name].server.js',
        )
        .chunkFilename(
          useHash ? '[name].[contenthash:8].server.js' : '[name].server.js',
        )
        .libraryTarget('commonjs2');

      // remove useless progress plugin
      memo.plugins.delete('progress-plugin');

      // do not minify
      memo.optimization.minimize(false);

      return memo;
    },
    onBuildComplete: () => {
      const finalJsonObj: any = {};
      const jsonFilePath = join(dirname(absOutputFile), 'build-manifest.json');
      const json = existsSync(jsonFilePath)
        ? fsExtra.readJSONSync(jsonFilePath)
        : {};
      finalJsonObj.assets = {
        ...json,
        'umi.js': json['umi.server.js'],
        'umi.css': json['umi.server.css'],
      };
      writeFileSync(jsonFilePath, JSON.stringify(finalJsonObj, null, 2), {
        flag: 'w',
      });
    },
  };
  await build(options);

  const diff = new Date().getTime() - now;
  logger.info(`[SSR] Compiled in ${diff}ms`);
};
