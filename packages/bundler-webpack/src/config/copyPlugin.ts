import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { existsSync } from 'fs';
import { join, resolve } from 'path';
import { Env, IConfig } from '../types';

interface IOpts {
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function addCopyPlugin(opts: IOpts) {
  const { config, userConfig, cwd } = opts;
  const copyPatterns = [
    existsSync(join(cwd, 'public')) && {
      from: join(cwd, 'public'),
    },
    ...(userConfig.copy
      ? userConfig.copy?.map((pattern) => {
          if (typeof pattern === 'string') {
            return pattern;
          }
          return {
            from: resolve(cwd, pattern.from),
            to: resolve(cwd, pattern.to),
          };
        })
      : []),
  ].filter(Boolean);
  if (copyPatterns.length) {
    config
      .plugin('copy')
      .use(require('@umijs/bundler-webpack/compiled/copy-webpack-plugin'), [
        {
          patterns: copyPatterns,
        },
      ]);
  }
}
