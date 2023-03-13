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
    appConfig: finalAppConfig = {},
    ...finalConfigProvider
  } = getPluginManager().applyPlugins({
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

  let container = rawContainer;

{{#appConfig}}
  // The App component should be under ConfigProvider
  container = <App {...finalAppConfig}>{container}</App>;
{{/appConfig}}

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
  container = <ConfigProvider {...finalConfigProvider}>{container}</ConfigProvider>;
{{/configProvider}}

  return container;
}
