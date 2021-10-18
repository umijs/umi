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

  return viteConfigFromUserConfig;
}
