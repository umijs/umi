import React from 'react';
import {
  ConfigProvider,
{{#appConfig}}
  App,
{{/appConfig}}
{{^disableInternalStatic}}
  Modal,
  message,
  notification,
{{/disableInternalStatic}}
{{#enableV5ThemeAlgorithm}}
  theme,
{{/enableV5ThemeAlgorithm}}
} from 'antd';
import { ApplyPluginsType } from 'umi';
{{#styleProvider}}
import {
  StyleProvider,
  {{#styleProvider.legacyTransformer}}
  legacyLogicalPropertiesTransformer
  {{/styleProvider.legacyTransformer}}
} from '{{{styleProvider.cssinjs}}}';
{{/styleProvider}}
import { getPluginManager } from '../core/plugin';

{{#enableV5ThemeAlgorithm}}
import { AntdContext, AntdContextSetter } from './context';
{{/enableV5ThemeAlgorithm}}

const AntdProvider = ({ container }) => {
{{^configProvider}}
{{^enableV5ThemeAlgorithm}}
  // 三个条件都不成立的时候，直接返回 
  return container
{{^styleProvider}}
{{/styleProvider}}
{{/enableV5ThemeAlgorithm}}
{{/configProvider}}
  
  const {
    appConfig,
    ...finalConfigProvider
  } = getAntdConfig();

{{#enableV5ThemeAlgorithm}}
  // Add token algorithm for antd5 only
  finalConfigProvider.theme ??= {};
  finalConfigProvider.theme.algorithm = [
    {{#enableV5ThemeAlgorithm.compact}}
    theme.compactAlgorithm,
    {{/enableV5ThemeAlgorithm.compact}}
    {{#enableV5ThemeAlgorithm.dark}}
    theme.darkAlgorithm,
    {{/enableV5ThemeAlgorithm.dark}}
  ];
  const [antdConfig, setConfig] = React.useState(finalConfigProvider);
  const setAntdConfig = (data) => {
    const mergeConfig = {
      ...antdConfig,
      ...data,
      theme: {
        ...(antdConfig?.theme || {}),
        ...(data?.theme || {}),
      },
    };
    setConfig(mergeConfig);
  };
{{/enableV5ThemeAlgorithm}}

{{^enableV5ThemeAlgorithm}}
const antdConfig = finalConfigProvider;
{{/enableV5ThemeAlgorithm}}
  {{#configProvider}}
  {{^disableInternalStatic}}
  if (antdConfig.prefixCls) {
    Modal.config({
      rootPrefixCls: antdConfig.prefixCls
    });
    message.config({
      prefixCls: `${antdConfig.prefixCls}-message`
    });
    notification.config({
      prefixCls: `${antdConfig.prefixCls}-notification`
    });
  }
  {{/disableInternalStatic}}

  {{#disableInternalStatic}}
  if (antdConfig.prefixCls) {
    ConfigProvider.config({
      prefixCls: antdConfig.prefixCls,
    });
  };
  {{/disableInternalStatic}}

  if (antdConfig.iconPrefixCls) {
    // Icons in message need to set iconPrefixCls via ConfigProvider.config()
    ConfigProvider.config({
      iconPrefixCls: antdConfig.iconPrefixCls,
    });
  };

  if (antdConfig.theme) {
    // Pass config theme to static method
    ConfigProvider.config({
      theme: antdConfig.theme,
    });
  }

{{/configProvider}}

  return (
{{#enableV5ThemeAlgorithm}}
    <AntdContextSetter.Provider value={setAntdConfig}>
      <AntdContext.Provider value={antdConfig}>
{{/enableV5ThemeAlgorithm}}
{{#styleProvider}}
    <StyleProvider
      {{#styleProvider.hashPriority}}
      hashPriority="{{{styleProvider.hashPriority}}}"
      {{/styleProvider.hashPriority}}
      {{#styleProvider.legacyTransformer}}
      transformers={[legacyLogicalPropertiesTransformer]}
      {{/styleProvider.legacyTransformer}}
    >
{{/styleProvider}}
        <ConfigProvider {...antdConfig}>{container}</ConfigProvider>
{{#styleProvider}}
        </StyleProvider>
{{/styleProvider}}
{{#enableV5ThemeAlgorithm}}
      </AntdContext.Provider>
    </AntdContextSetter.Provider>
{{/enableV5ThemeAlgorithm}}
  );
}

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
      },
    });
  }
  return cacheAntdConfig;
}

export function rootContainer(rawContainer) {
  const container = (<AntdProvider container={rawContainer}/>)
  return container;
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
