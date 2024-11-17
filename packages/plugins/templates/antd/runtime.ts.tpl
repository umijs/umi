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
{{#antdConfigSetter}}
import { AntdConfigContext, AntdConfigContextSetter } from './context';
import merge from '{{{lodashPath.merge}}}'
{{/antdConfigSetter}}

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
    {{#modelPluginCompat}}
    if (!cacheAntdConfig.theme) {
      cacheAntdConfig.theme = {};
    }
    {{/modelPluginCompat}}
  }
  return cacheAntdConfig;
}

function AntdProvider({ children }) {
  let container = children;

  const [antdConfig, _setAntdConfig] = React.useState(() => {
    const {
      appConfig: _,
      ...finalConfigProvider
    } = getAntdConfig();
    {{#enableV5ThemeAlgorithm}}
      finalConfigProvider.theme ??= {};
      finalConfigProvider.theme.algorithm ??= [];
      if (!Array.isArray(finalConfigProvider.theme.algorithm)) {
        finalConfigProvider.theme.algorithm = [finalConfigProvider.theme.algorithm];
      }
      const algorithm = finalConfigProvider.theme.algorithm;
      {{#enableV5ThemeAlgorithm.compact}}
      if (!algorithm.includes(theme.compactAlgorithm)) {
        algorithm.push(theme.compactAlgorithm);
      }
      {{/enableV5ThemeAlgorithm.compact}}
      {{#enableV5ThemeAlgorithm.dark}}
      if (!algorithm.includes(theme.darkAlgorithm)) {
        algorithm.push(theme.darkAlgorithm);
      }
      {{/enableV5ThemeAlgorithm.dark}}
    {{/enableV5ThemeAlgorithm}}
    return finalConfigProvider
  });
  const setAntdConfig: typeof _setAntdConfig = (newConfig) => {
    _setAntdConfig(prev => {
      return merge({}, prev, typeof newConfig === 'function' ? newConfig(prev) : newConfig)
    })
  }

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

  container = <ConfigProvider {...antdConfig}>{container}</ConfigProvider>;
{{/configProvider}}

{{#styleProvider}}
  container = (
    <StyleProvider
      {{#styleProvider.hashPriority}}
      hashPriority="{{{styleProvider.hashPriority}}}"
      {{/styleProvider.hashPriority}}
      {{#styleProvider.legacyTransformer}}
      transformers={[legacyLogicalPropertiesTransformer]}
      {{/styleProvider.legacyTransformer}}
    >
      {container}
    </StyleProvider>
  );
{{/styleProvider}}

{{#antdConfigSetter}}
  container = (
    <AntdConfigContextSetter.Provider value={setAntdConfig}>
      <AntdConfigContext.Provider value={antdConfig}>
        {container}
      </AntdConfigContext.Provider>
    </AntdConfigContextSetter.Provider>
  )
{{/antdConfigSetter}}

  return container;
}

export function rootContainer(children) {
  return (
    <AntdProvider>
      {children}
    </AntdProvider>
  );
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
