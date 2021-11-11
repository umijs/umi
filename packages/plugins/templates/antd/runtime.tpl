import React from 'react';
import { ConfigProvider, Modal, message, notification } from 'antd';
import { ApplyPluginsType } from 'umi';

export function rootContainer(container) {
  const finalConfig = {...{{{ config }}}}

  if (finalConfig.prefixCls) {
    Modal.config({
      rootPrefixCls: finalConfig.prefixCls,
    });
    message.config({
      prefixCls: `${finalConfig.prefixCls}-message`,
    });
    notification.config({
      prefixCls: `${finalConfig.prefixCls}-notification`,
    });
  }
  return React.createElement(ConfigProvider, finalConfig, container);
}
