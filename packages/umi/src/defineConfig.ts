import { IConfig } from '@umijs/types';
// @ts-ignore
import { IConfigFromPlugins } from '@@/core/pluginConfig';

// IConfig types is prior to IConfigFromPlugins in the same key.
export function defineConfig(
  config: IConfigFromPlugins | IConfig,
): IConfigFromPlugins | IConfig {
  return config;
}
