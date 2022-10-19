// @ts-ignore
import { IConfigFromPlugins } from '@@/core/pluginConfig';
import type { IConfig } from '@umijs/preset-umi';

type ConfigType = IConfigFromPlugins & IConfig;
/**
 * 通过方法的方式配置umi，能带来更好的 typescript 体验
 * @param  {ConfigType} config
 * @returns ConfigType
 */
export function defineConfig(config: ConfigType): ConfigType {
  return config;
}
