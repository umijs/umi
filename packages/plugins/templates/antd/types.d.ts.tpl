{{#withConfigProvider}}
import type { ConfigProviderProps } from 'antd/es/config-provider';
{{/withConfigProvider}}
{{#withAppConfig}}
import type { AppConfig } from 'antd/es/app/context';
{{/withAppConfig}}

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

type AntdConfig = Prettify<{}
{{#withConfigProvider}}  & ConfigProviderProps{{/withConfigProvider}}
{{#withAppConfig}}  & { appConfig: AppConfig }{{/withAppConfig}}
>;

export type RuntimeAntdConfig = (memo: AntdConfig) => AntdConfig;
