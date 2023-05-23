import React from 'react';
import {
  Modal,
{{#configProvider}}
  ConfigProvider,
{{/configProvider}}
{{#appConfig}}
  App,
{{/appConfig}}
  message,
  notification,
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
  const {
    appConfig,
    ...finalConfigProvider
  } = getAntdConfig();
  let container = rawContainer;
{{#configProvider}}
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

  if (finalConfigProvider.iconPrefixCls) {
    // Icons in message need to set iconPrefixCls via ConfigProvider.config()
    ConfigProvider.config({
      iconPrefixCls: finalConfigProvider.iconPrefixCls,
    });
  };

  if (finalConfigProvider.theme) {
    // Pass config theme to static method
    ConfigProvider.config({
      theme: finalConfigProvider.theme,
    });
  }

  container = <ConfigProvider {...finalConfigProvider}>{container}</ConfigProvider>;
{{/configProvider}}

{{#styleProvider}}
  container = (
    <StyleProvider
      {{#styleProvider.hashPriority}}
      hashPriority="{{{styleProviderConfig.hashPriority}}}"
      {{/styleProvider.hashPriority}}
      {{#styleProvider.legacyTransformer}}
      transformers={[legacyLogicalPropertiesTransformer]}
      {{/styleProvider.legacyTransformer}}
    >
      {container}
    </StyleProvider>
  );
{{/styleProvider}}

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
