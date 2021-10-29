import type { InlineConfig as ViteInlineConfig } from 'vite';
import { mergeConfig } from 'vite';
import configPlugins from '../plugins';
import type { Env, IConfig } from '../types';
import configTransformer from './transformer';

interface IOpts {
  cwd: string;
  env: Env;
  entry: Record<string, string>;
  userConfig: IConfig;
}

export async function getConfig(opts: IOpts): Promise<ViteInlineConfig> {
  const vitePluginsConfig = configPlugins(opts.userConfig);
  const viteConfigFromUserConfig = configTransformer(opts.userConfig);

  return mergeConfig(vitePluginsConfig, viteConfigFromUserConfig);
}
