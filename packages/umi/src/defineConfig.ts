// @ts-ignore
import { IConfigFromPlugins } from '@@/core/pluginConfig';
import type { IConfig } from '@umijs/preset-umi';

type ConfigType = IConfigFromPlugins & IConfig;

export function defineConfig(config: ConfigType): ConfigType {
  return config;
}
