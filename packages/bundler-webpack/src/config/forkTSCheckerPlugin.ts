import Config from '@umijs/bundler-webpack/compiled/webpack-5-chain';
import ForkTSCheckerPlugin from 'fork-ts-checker-webpack-plugin';
import { Env, IConfig } from '../types';

interface IOpts {
  name?: string;
  config: Config;
  userConfig: IConfig;
  cwd: string;
  env: Env;
}

export async function addForkTSCheckerPlugin(opts: IOpts) {
  const { config, userConfig } = opts;
  if (userConfig.forkTSChecker) {
    // use user's typescript
    if (userConfig.forkTSChecker.typescript?.enable) {
      userConfig.forkTSChecker.typescript.typescriptPath =
        require.resolve('typescript');
    }
    config
      .plugin('fork-ts-checker-plugin')
      .use(ForkTSCheckerPlugin, [userConfig.forkTSChecker]);
  }
}
