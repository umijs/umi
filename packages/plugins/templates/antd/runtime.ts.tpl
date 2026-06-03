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
{{#enableModernThemeAlgorithm}}
  theme,
{{/enableModernThemeAlgorithm}}
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

const getAntdConfig = ({{#isUtooWin}}runtimePluginManager?: any{{/isUtooWin}}) => {
  if(!cacheAntdConfig){
    cacheAntdConfig = {{#isUtooWin}}(runtimePluginManager || getPluginManager()){{/isUtooWin}}{{^isUtooWin}}getPluginManager(){{/isUtooWin}}.applyPlugins({
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

function AntdProvider({ children{{#isUtooWin}}, pluginManager{{/isUtooWin}} }) {
  let container = children;

  const [antdConfig, _setAntdConfig] = React.useState(() => {
    const {
      appConfig: _,
      ...finalConfigProvider
    } = getAntdConfig({{#isUtooWin}}pluginManager{{/isUtooWin}});
    {{#enableModernThemeAlgorithm}}
      finalConfigProvider.theme ??= {};
      finalConfigProvider.theme.algorithm ??= [];
      if (!Array.isArray(finalConfigProvider.theme.algorithm)) {
        finalConfigProvider.theme.algorithm = [finalConfigProvider.theme.algorithm];
      }
      const algorithm = finalConfigProvider.theme.algorithm;
      {{#enableModernThemeAlgorithm.compact}}
      if (!algorithm.includes(theme.compactAlgorithm)) {
        algorithm.push(theme.compactAlgorithm);
      }
      {{/enableModernThemeAlgorithm.compact}}
      {{#enableModernThemeAlgorithm.dark}}
      if (!algorithm.includes(theme.darkAlgorithm)) {
        algorithm.push(theme.darkAlgorithm);
      }
      {{/enableModernThemeAlgorithm.dark}}
    {{/enableModernThemeAlgorithm}}
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

export function rootContainer(children{{#isUtooWin}}, opts{{/isUtooWin}}) {
  return (
    <AntdProvider{{#isUtooWin}} pluginManager={opts?.plugin}{{/isUtooWin}}>
      {children}
    </AntdProvider>
  );
}

{{#appConfig}}
// The App component should be under ConfigProvider
// plugin-locale has other ConfigProvider
export function innerProvider(container: any{{#isUtooWin}}, opts: any{{/isUtooWin}}) {
  const {
    appConfig: finalAppConfig = {},
  } = getAntdConfig({{#isUtooWin}}opts?.plugin{{/isUtooWin}});
  return <App {...finalAppConfig}>{container}</App>;
}
{{/appConfig}}
