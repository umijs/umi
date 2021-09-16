import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import { existsSync } from 'fs';
import { join } from 'path';
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
      ? userConfig.copy.map((item) => {
          if (typeof item === 'string') {
            return {
              from: join(cwd, item),
              to: item,
            };
          }
          return {
            // 相对于 process.cwd，所以这里需要使用绝对路径
            from: join(cwd, item.from),
            to: item.to,
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
