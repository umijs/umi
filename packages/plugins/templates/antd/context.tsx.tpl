import * as React from 'react';
import type { AntdConfig } from './types.d';
import { theme, ConfigProvider as OriginAntdCP } from 'antd';

const { darkAlgorithm, compactAlgorithm, defaultAlgorithm } = theme;

/**
 * 这里 api 逐步放开。欢迎提交 Feature Request！ @Wxh16144
 */
type UmiPluginAntdConfig = {
  dark?: boolean;
  compact?: boolean;
}

type MergedAntdConfig = AntdConfig & UmiPluginAntdConfig;

const AntdPluginContext = React.createContext<MergedAntdConfig>({});
const AntdPluginContextSetter = React.createContext<(data: UmiPluginAntdConfig) => void>(
  () =>
    console.error('To use this feature, please enable one of the three configurations: antd.dark, antd.compact, antd.configProvider,or antd.appConfig.')
);

function mergeThemeAlgorithm<T extends MergedAntdConfig>(source: T, target?: T): T {
  const mergeConfig: T = {
    ...(target || {} as T),
    ...source,
    theme: {
      ...(target?.theme || {}),
      ...(source?.theme || {}),
    },
  };

  if ('dark' in source || 'compact' in source) {
    mergeConfig.theme!.algorithm = [
      mergeConfig.dark ? darkAlgorithm : defaultAlgorithm,
      mergeConfig.compact && compactAlgorithm,
    ].filter(Boolean) as Array<typeof defaultAlgorithm>
  }

  return mergeConfig;
}

/** @internal Internal Usage. Not use in your production. */
const _UmiPluginAntdContextProvider = (props: React.PropsWithChildren<{ config: MergedAntdConfig }>) => {
  const [config, setConfig] = React.useState<MergedAntdConfig>(() => mergeThemeAlgorithm(props.config));

  const setAntdConfig = React.useCallback((data: MergedAntdConfig) => {
    setConfig((prevConfig) =>
      mergeThemeAlgorithm(data, prevConfig)
    );
  }, [config]);

  if (config.iconPrefixCls) {
    // Icons in message need to set iconPrefixCls via ConfigProvider.config()
    OriginAntdCP.config({
      iconPrefixCls: config.iconPrefixCls,
    });
  }

  const configProviderProps = React.useMemo<AntdConfig>(() => {
    /**
     * 需要过滤掉 dark 和 compact 等非 antd CP 的配置
     * 如果不过滤，继续透传给 ConfigProvider，会导致后面不可控的问题
     */
    const {
      dark, // omit
      compact, // omit
      ...rest
    } = config;
    return rest;
  }, [config]);

  return (
    <AntdPluginContextSetter.Provider value={setAntdConfig}>
      <AntdPluginContext.Provider value={config}>
        <OriginAntdCP {...configProviderProps}>{props.children}</OriginAntdCP>
      </AntdPluginContext.Provider>
    </AntdPluginContextSetter.Provider>
  )
}

function useAntdConfig() {
  const config = React.useContext(AntdPluginContext);
  const setConfig = React.useContext(AntdPluginContextSetter);
  return [config, setConfig] as const;
};

export default _UmiPluginAntdContextProvider;
// ================== Safe Export ==================
export { useAntdConfig };
