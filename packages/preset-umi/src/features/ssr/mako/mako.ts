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
  const options = {
    cwd: api.cwd,
    entry: {
      'umi.server': entry,
    },
    config: {
      ...api.config,
      hash: useHash,
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
      memo.target = 'node';
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
