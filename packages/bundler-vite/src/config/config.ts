import type { InlineConfig as ViteInlineConfig } from 'vite';
import { mergeConfig } from 'vite';
import configPlugins from '../plugins';
import { Env, IBabelPlugin, IConfig } from '../types';
import configTransformer from './transformer';

interface IOpts {
  cwd: string;
  env: Env;
  entry: Record<string, string>;
  userConfig: IConfig;
  modifyViteConfig?: Function;
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

  let viteConfig = mergeConfig(vitePluginsConfig, viteConfigFromUserConfig);
  if (opts.modifyViteConfig) {
    viteConfig = await opts.modifyViteConfig(viteConfig, {
      env: opts.env,
    });
  }
  return viteConfig;
}
