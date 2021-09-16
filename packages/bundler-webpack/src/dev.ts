import { MFSU } from '@umijs/mfsu';
import webpack from '../compiled/webpack';
import { getConfig } from './config/config';
import { createServer } from './server/server';
import { Env, IConfig } from './types';

interface IOpts {
  cwd: string;
  config: IConfig;
  entry: Record<string, string>;
}

export async function dev(opts: IOpts) {
  const mfsu = new MFSU({
    implementor: webpack,
  });
  const webpackConfig = await getConfig({
    cwd: opts.cwd,
    env: Env.development,
    entry: opts.entry,
    userConfig: opts.config,
    extraBabelPlugins: mfsu.getBabelPlugins(),
  });
  const depConfig = await getConfig({
    cwd: opts.cwd,
    env: Env.development,
    entry: opts.entry,
    userConfig: opts.config,
  });
  mfsu.setWebpackConfig({ config: webpackConfig, depConfig });
  await createServer({
    webpackConfig,
    userConfig: opts.config,
    cwd: opts.cwd,
    beforeMiddlewares: [...mfsu.getMiddlewares()],
  });
}
