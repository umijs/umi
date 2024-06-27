import { Env } from '@umijs/bundler-webpack/dist/types';
import { fsExtra, logger } from '@umijs/utils';
import { forEach } from '@umijs/utils/compiled/lodash';
import { existsSync, writeFileSync } from 'fs';
import path, { dirname, join } from 'path';

import { IApi } from 'umi';
import { absServerBuildPath } from '../utils';

export const build = async (api: IApi) => {
  logger.wait('[SSR] Compiling by mako...');
  const now = new Date().getTime();
  const absOutputFile = absServerBuildPath(api);
  require('@umijs/bundler-webpack/dist/requireHook');

  // @ts-ignore
  const { build } = require(process.env.OKAM);

  const useHash = api.config.hash && api.env === Env.production;
  const publicPath = api.userConfig.publicPath || '/';

  const entry = path.resolve(api.paths.absTmpPath, 'umi.server.ts');
  const options = {
    cwd: api.cwd,
    entry: {
      'umi.server': entry,
    },
    config: {
      makoPlugins: api.config.mako.plugins,
      ...api.config,
      jsMinifier: 'none',
      hash: useHash,
      outputPath: path.dirname(absOutputFile),
      manifest: {
        fileName: 'build-manifest.json',
      },
      devtool: false,
      cjs: true,
      dynamicImportToRequire: false,
    },
    chainWebpack: async (memo: any) => {
      memo.target('node');
      return memo;
    },
    onBuildComplete: () => {
      const finalJsonObj: any = {};
      const jsonFilePath = join(dirname(absOutputFile), 'build-manifest.json');
      const json = existsSync(jsonFilePath)
        ? fsExtra.readJSONSync(jsonFilePath)
        : {};
      forEach(json, (path, key) => {
        json[key] = `${publicPath}${path}`;
      });

      finalJsonObj.assets = {
        ...json,
        'umi.js': json['umi.server.js'],
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
