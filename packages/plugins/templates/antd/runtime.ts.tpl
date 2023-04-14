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
  const finalConfigProvider = getPluginManager().applyPlugins({
    key: 'antd',
    type: ApplyPluginsType.modify,
    initialValue: {
{{#configProvider}}
      ...{{{configProvider}}},
{{/configProvider}}
    },
  });

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
  container = <ConfigProvider {...finalConfigProvider}>{container}</ConfigProvider>;
{{/configProvider}}

  return container;
}

{{#appConfig}}
// The App component should be under ConfigProvider
// plugin-locale has other ConfigProvider
export function innerProvider(container: any) {
  const {
    appConfig: finalAppConfig = {},
  } = getPluginManager().applyPlugins({
    key: 'antd',
    type: ApplyPluginsType.modify,
    initialValue: {
{{#appConfig}}
      appConfig: {{{appConfig}}},
{{/appConfig}}
    },
  });
  return <App {...finalAppConfig}>{container}</App>;
}
{{/appConfig}}