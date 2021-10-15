import { mergeConfig } from 'vite';
import react from '@vitejs/plugin-react';
import configTransformer from './transformer';

import type { InlineConfig as ViteInlineConfig } from 'vite';
import type { Env, IConfig } from '../types';

interface IOpts {
  cwd: string;
  env: Env;
  entry: Record<string, string>;
  userConfig: IConfig;
}

export async function getConfig(opts: IOpts): Promise<ViteInlineConfig> {
  const viteConfigFromUserConfig = configTransformer(opts.userConfig);

  // TODO:
  // babel config
  // code minify config

  return mergeConfig(
    viteConfigFromUserConfig,
    {
      plugins: [react()],
    },
  );
}
