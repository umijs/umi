import React from 'react';
import { Button } from 'antd';
import { IUiApi } from 'umi-types';
import Dashboard from './ui/index';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

export default (api: IUiApi) => {
  const { intl } = api;
  const { FormattedMessage } = intl;
  const ConfigAction = () => (
    <Button
      onClick={() => {
        api.launchEditor({
          type: 'project',
        });
      }}
      type="default"
    >
      <FormattedMessage id="org.umi.ui.dashboard.launch.editor" />
    </Button>
  );

  api.addLocales({
    'zh-CN': zhCN,
    'en-US': enUS,
  });
  api.addPanel({
    title: 'org.umi.ui.dashboard.panel',
    path: '/dashboard',
    actions: api.mini ? [] : [ConfigAction],
    icon: {
      type: 'dashboard',
      theme: 'filled',
    },
    component: () => <Dashboard api={api} />,
  });
};
