import Config from '../../compiled/webpack-5-chain';
import ProgressPlugin from '../plugins/ProgressPlugin';
import { Env, IConfig } from '../types';

interface IOpts {
  name?: string;
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function addProgressPlugin(opts: IOpts) {
  const { config, name } = opts;
  config.plugin('progress-plugin').use(ProgressPlugin, [
    {
      name,
    },
  ]);
}
