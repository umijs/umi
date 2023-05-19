import React from 'react';
import {
{{#configProvider}}
  ConfigProvider,
{{/configProvider}}
{{#appConfig}}
  App,
{{/appConfig}}
{{^isAntd5}}
  Modal,
  message,
  notification,
{{/isAntd5}}
{{#isAntd5}}
  theme
{{/isAntd5}}
} from 'antd';
import { ApplyPluginsType } from 'umi';
import { getPluginManager } from '../core/plugin';
{{#isAntd5}}
import { AntdContext, AntdContextSetter } from './context';

const { darkAlgorithm, compactAlgorithm, defaultAlgorithm } = theme;

const AntdProvider = ({ container, config }) => {
  const [antdConfig, setConfig] = React.useState(config);
  const setAntdConfig = (data) => {
    const mergeConfig = {
      ...antdConfig,
      ...data,
      theme: {
        ...(antdConfig?.theme || {}),
        ...(data?.theme || {}),
      },
    };
    // set theme model
    if ('dark' in data || 'compact' in data) {
      mergeConfig.theme.algorithm = [
        mergeConfig?.dark ? darkAlgorithm : defaultAlgorithm,
        mergeConfig?.compact && compactAlgorithm,
      ].filter(Boolean);
    }
    setConfig(mergeConfig);
  };
  if (antdConfig.iconPrefixCls) {
    // Icons in message need to set iconPrefixCls via ConfigProvider.config()
    ConfigProvider.config({
      iconPrefixCls: antdConfig.iconPrefixCls,
    });
  }
  return (
    <AntdContextSetter.Provider value={setAntdConfig}>
      <AntdContext.Provider value={antdConfig}>
        <ConfigProvider {...antdConfig}>{container}</ConfigProvider>
      </AntdContext.Provider>
    </AntdContextSetter.Provider>
  );
};
{{/isAntd5}}

let cacheAntdConfig = null;

const getAntdConfig = () => {
  if(!cacheAntdConfig){
    cacheAntdConfig = getPluginManager().applyPlugins({
      key: 'antd',
      type: ApplyPluginsType.modify,
      initialValue: {
  {{#configProvider}}
        ...{{{configProvider}}},
  {{/configProvider}}
  {{#appConfig}}
        appConfig: {{{appConfig}}},
  {{/appConfig}}
{{#isAntd5}}
        dark: {{dark}},
        compact: {{compact}},
{{/isAntd5}}
      },
    });
  }
  return cacheAntdConfig;
}

export function rootContainer(rawContainer) {
{{#configProvider}}
const {
  appConfig,
  ...finalConfigProvider
} = getAntdConfig();
if (finalConfigProvider.iconPrefixCls) {
  // Icons in message need to set iconPrefixCls via ConfigProvider.config()
  ConfigProvider.config({
    iconPrefixCls: finalConfigProvider.iconPrefixCls,
  });
};

{{#isAntd5}}
  // init algorithm
  finalConfigProvider.theme ??= {};
  finalConfigProvider.theme.algorithm = [
    finalConfigProvider?.dark ? darkAlgorithm : defaultAlgorithm,
    finalConfigProvider?.compact && compactAlgorithm,
  ].filter(Boolean);
  return <AntdProvider config={finalConfigProvider} container={rawContainer} />;;
{{/isAntd5}}

{{^isAntd5}}
  // It is only necessary in Ant Design version 4.x
  if (finalConfigProvider.prefixCls) {
    Modal.config({
      rootPrefixCls: finalConfigProvider.prefixCls
    });
    message.config({
      prefixCls: `${finalConfigProvider.prefixCls}-message`
    });
    notification.config({
      prefixCls: `${finalConfigProvider.prefixCls}-notification`
    });
  }
  return <ConfigProvider {...finalConfigProvider}>{rawContainer}</ConfigProvider>;
{{/isAntd5}}
{{/configProvider}}

  return rawContainer;
}

{{#appConfig}}
// The App component should be under ConfigProvider
// plugin-locale has other ConfigProvider
export function innerProvider(container: any) {
  const {
    appConfig: finalAppConfig = {},
  } = getAntdConfig();
  return <App {...finalAppConfig}>{container}</App>;
}
{{/appConfig}}
