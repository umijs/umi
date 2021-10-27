import { viteBuild } from './build/build';
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
  const userConfig = opts.config;
  const viteConfig = await getConfig({
    cwd: opts.cwd,
    env: Env.production,
    entry: opts.entry,
    userConfig,
  });
  await viteBuild({
    viteConfig,
    userConfig,
    cwd: opts.cwd,
    clean: opts.clean,
    onBuildComplete: opts.onBuildComplete,
  });
}
