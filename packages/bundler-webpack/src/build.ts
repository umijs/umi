import { rimraf } from '@umijs/utils';
import webpack from '../compiled/webpack';
import { getConfig } from './config/config';
import { Env, IConfig } from './types';

interface IOpts {
  cwd: string;
  entry: Record<string, string>;
  config: IConfig;
  onBuildComplete?: Function;
  clean?: boolean;
}

export async function build(opts: IOpts): Promise<void> {
  const webpackConfig = await getConfig({
    cwd: opts.cwd,
    env: Env.production,
    entry: opts.entry,
    userConfig: opts.config,
  });
  return new Promise((resolve, reject) => {
    rimraf.sync(webpackConfig.output!.path!);
    const compiler = webpack(webpackConfig);
    compiler.run((err, stats) => {
      opts.onBuildComplete?.(err, stats);
      if (err || stats?.hasErrors()) {
        if (err) {
          // console.error(err);
          reject(err);
        }
        if (stats) {
          const errorMsg = stats.toString('errors-only');
          // console.error(errorMsg);
          reject(new Error(errorMsg));
        }
      } else {
        resolve();
      }
      compiler.close(() => {});
    });
  });
}
