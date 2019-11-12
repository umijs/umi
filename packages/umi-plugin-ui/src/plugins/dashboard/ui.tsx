import React from 'react';
import { IUiApi } from 'umi-types';
import Dashboard from './ui/index';
import ConfigAction from './ui/action';
import Layout from './ui/layout';
import DailyReportTitle from './ui/plugins/dailyReportTitle';
import DailyReport from './ui/plugins/dailyReport';
import DailyReportHeader from './ui/plugins/dailyReportHeader';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

export default (api: IUiApi) => {
  api.addLocales({
    'zh-CN': zhCN,
    'en-US': enUS,
  });

  const { FormattedMessage } = api.intl;

  api.addDashboard({
    key: 'org.umi.dashboard.card.zaobao',
    title: <DailyReportTitle />,
    description: '这是一段本地启动的描述信息',
    icon: 'https://avatars1.githubusercontent.com/u/35128?v=4',
    right: <DailyReportHeader />,
    span: {
      xl: 12,
    },
    content: <DailyReport />,
  });

  api.addPanel({
    title: 'org.umi.ui.dashboard.panel',
    path: '/dashboard',
    actions: [
      <Layout api={api}>
        <ConfigAction />
      </Layout>,
    ],
    icon: {
      type: 'dashboard',
      theme: 'filled',
    },
    component: () => (
      <Layout api={api}>
        <Dashboard />
      </Layout>
    ),
  });
};
