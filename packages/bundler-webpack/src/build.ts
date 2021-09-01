import { chalk } from '@umijs/utils';
import webpack from '../compiled/webpack';
import { getConfig } from './config/getConfig';
import { Env, IConfig } from './types';

interface IOpts {
  cwd: string;
  entry: Record<string, string>;
  config: IConfig;
  onBuildComplete?: Function;
}

export async function build(opts: IOpts) {
  const config = await getConfig({
    cwd: opts.cwd,
    env: Env.production,
    entry: opts.entry,
    userConfig: opts.config,
  });
  const compiler = webpack(config);
  compiler.run((err, stats) => {
    opts.onBuildComplete?.(err, stats);
    if (err || stats?.hasErrors()) {
      if (err) console.error(err);
      if (stats) console.error(stats.toString('errors-only'));
    } else {
      console.log(chalk.green(`Build success.`));
    }
    compiler.close(() => {});
  });
}
