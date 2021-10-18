import { build } from 'vite';
import { mergeConfig } from 'vite';

import { Env, IConfig } from '../types';
import type { InlineConfig as ViteInlineConfig } from 'vite';

interface IOpts {
  cwd: string;
  userConfig: IConfig,
  viteConfig: ViteInlineConfig;
  onBuildComplete?: Function;
  clean?: boolean;
}

export async function viteBuild(opts: IOpts) {
  const { viteConfig } = opts;

  const buildConfig = mergeConfig({
    root: opts.cwd,
    mode: Env.production,
  }, viteConfig);
  const result = await build(buildConfig);

  opts.onBuildComplete && opts.onBuildComplete(result, buildConfig);
}
