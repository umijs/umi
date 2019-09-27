import React from 'react';
import { IUiApi } from 'umi-types';
import { Button } from 'antd';
import ConfigManager from './ui/index';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

export default (api: IUiApi) => {
  const { FormattedMessage } = api;
  const ConfigAction = () => (
    <Button
      onClick={() => {
        api.launchEditor({
          type: 'config',
        });
      }}
      type="default"
    >
      <FormattedMessage id="org.umi.ui.configuration.actions.open.config" />
    </Button>
  );

  api.addLocales({
    'zh-CN': zhCN,
    'en-US': enUS,
  });
  api.addPanel({
    title: 'org.umi.ui.configuration.panel',
    actions: [ConfigAction],
    path: '/configuration',
    icon: {
      type: 'control',
      theme: 'filled',
    },
    component: () => <ConfigManager api={api} />,
  });
};
