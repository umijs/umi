import { build } from 'vite';
import { mergeConfig } from 'vite';

import { Env, IConfig } from '../types';
import type { InlineConfig as ViteInlineConfig } from 'vite';

interface IOpts {
  cwd: string;
  userConfig: IConfig;
  viteConfig: ViteInlineConfig;
  onBuildComplete?: Function;
  clean?: boolean;
}

export async function viteBuild(opts: IOpts) {
  const { viteConfig } = opts;

  const buildConfig = mergeConfig(
    {
      root: opts.cwd,
      mode: Env.production,
    },
    viteConfig,
  );
  const startTms = +new Date();
  const result: {
    isFirstCompile: boolean;
    stats?: any;
    time: number;
    err?: Error;
  } = {
    isFirstCompile: true,
    time: 0,
  };

  try {
    result.stats = await build(buildConfig);
    result.time = +new Date() - startTms;
  } catch (err: any) {
    result.err = err;
  }

  opts.onBuildComplete && opts.onBuildComplete(result);
}
