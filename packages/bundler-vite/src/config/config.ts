import react from '@vitejs/plugin-react';
import { logger } from '@umijs/utils';

import type { InlineConfig as ViteInlineConfig } from 'vite';
import type { Env, IConfig } from '../types';

interface IOpts {
  cwd: string;
  env: Env;
  entry: Record<string, string>;
  userConfig: IConfig;
}

export async function getConfig(opts: IOpts): Promise<ViteInlineConfig> {
  logger.info(opts.env);

  // TODO:
  // umi config transform
  // css pre-processor config
  // babel config
  // code minify config

  return {
    plugins: [react()],
  };
}
