import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { existsSync, readdirSync } from 'fs';
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
  const publicDir = join(cwd, 'public');
  const copyPatterns = [
    existsSync(publicDir) &&
      readdirSync(publicDir).length && {
        from: publicDir,
        // ref: https://github.com/webpack-contrib/copy-webpack-plugin#info
        // Set minimized so terser will not do minimize
        info: { minimized: true },
      },
    ...(userConfig.copy
      ? userConfig.copy?.map((pattern) => {
          if (typeof pattern === 'string') {
            return {
              from: resolve(cwd, pattern),
              info: { minimized: true },
            };
          }
          return {
            from: resolve(cwd, pattern.from),
            to: resolve(cwd, pattern.to),
            info: { minimized: true },
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
