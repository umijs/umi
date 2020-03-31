import { IConfig } from '@umijs/types';
// @ts-ignore
import { IConfigFromPlugins } from '@@/core/pluginConfig';

export function defineConfig(config: IConfig | IConfigFromPlugins) {
  return config;
}
