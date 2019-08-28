import React from 'react';
import { IUiApi } from 'umi-types';
import Dashboard from './ui/index';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

export default (api: IUiApi) => {
  api.addLocales({
    'zh-CN': zhCN,
    'en-US': enUS,
  });

  api.addPanel({
    title: 'org.umi.ui.dashboard.panel',
    path: '/dashboard',
    icon: {
      type: 'dashboard',
      theme: 'filled',
    },
    component: () => <Dashboard api={api} />,
  });
};
