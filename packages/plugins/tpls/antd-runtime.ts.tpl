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
import { getPluginManager } from '../core/plugin';

export function rootContainer(rawContainer) {
  const {
    configProvider: finalConfigProvider = {},
    appConfig: finalAppConfig = {},
  } = getPluginManager().applyPlugins({
    key: 'antd',
    type: ApplyPluginsType.modify,
    initialValue: {
{{#configProvider}}
      configProvider: {{{configProvider}}},
{{/configProvider}}
{{#appConfig}}
      appConfig: {{{appConfig}}},
{{/appConfig}}
    },
  });

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

  let container = rawContainer;

{{#configProvider}}
  if (finalConfigProvider.iconPrefixCls) {
    // Icons in message need to set iconPrefixCls via ConfigProvider.config()
    ConfigProvider.config({
      iconPrefixCls: finalConfigProvider.iconPrefixCls,
    });
  };
  container = <ConfigProvider {...finalConfigProvider}>{container}</ConfigProvider>;
{{/configProvider}}

{{#appConfig}}
  container = <App {...finalAppConfig}>{container}</App>;
{{/appConfig}}

  return container
}
