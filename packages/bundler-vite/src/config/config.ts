import type { InlineConfig as ViteInlineConfig } from 'vite';
import { mergeConfig } from 'vite';
import configPlugins from '../plugins';
import configTransformer from './transformer';
import { Env, IConfig, IBabelPlugin } from '../types';

interface IOpts {
  cwd: string;
  env: Env;
  entry: Record<string, string>;
  userConfig: IConfig;
  extraBabelPlugins?: IBabelPlugin[];
  extraBabelPresets?: IBabelPlugin[];
}

export async function getConfig(opts: IOpts): Promise<ViteInlineConfig> {
  const applyOpts = {
    ...opts.userConfig,
    extraBabelPlugins: [
      ...(opts.extraBabelPlugins || []),
      ...(opts.userConfig.extraBabelPlugins || []),
    ],
    extraBabelPresets: [
      ...(opts.extraBabelPresets || []),
      ...(opts.userConfig.extraBabelPresets || []),
    ],
  };

  const vitePluginsConfig = configPlugins(applyOpts);
  const viteConfigFromUserConfig = configTransformer(applyOpts);

  return mergeConfig(vitePluginsConfig, viteConfigFromUserConfig);
}
