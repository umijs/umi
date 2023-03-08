import React from 'react';
import { ConfigProvider, Modal, message, notification } from 'antd';
import { ApplyPluginsType } from 'umi';
import { getPluginManager } from '../core/plugin';

export function rootContainer(container) {
  const finalConfig = getPluginManager().applyPlugins({
    key: 'antd',
    type: ApplyPluginsType.modify,
    initialValue: {...{{{ config }}}},
  });
  if (finalConfig.prefixCls) {
    Modal.config({
      rootPrefixCls: finalConfig.prefixCls
    });
    message.config({
      prefixCls: `${finalConfig.prefixCls}-message`
    });
    notification.config({
      prefixCls: `${finalConfig.prefixCls}-notification`
    });
  }
  if (finalConfig.iconPrefixCls) {
    // Icons in message need to set iconPrefixCls via ConfigProvider.config()
    ConfigProvider.config({
      iconPrefixCls: finalConfig.iconPrefixCls,
    });
  }
  return <ConfigProvider {...finalConfig}>{container}</ConfigProvider>;
}
