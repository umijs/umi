import React from 'react';
import { IUiApi } from 'umi-types';
import { Setting } from '@ant-design/icons';
import Dashboard from './ui/index';
import ConfigAction from './ui/action';
import Layout from './ui/layout';
import DailyReport from './ui/plugins/dailyReport';
import DailyReportHeader from './ui/plugins/dailyReportHeader';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

export default (api: IUiApi) => {
  api.addLocales({
    'zh-CN': zhCN,
    'en-US': enUS,
  });

  api.addDashboard([
    {
      // 唯一标识，org.umi.dashboard.card.task
      key: 'org.umi.dashboard.card.task',
      title: '任务',
      description: '这是一段构建的描述信息',
      icon: <Setting />,
      content: [
        <a onClick={() => api.redirect('/tasks')}>启动</a>,
        <a href="/tasks">创建</a>,
        <a href="/tasks">检查</a>,
      ],
    },
    {
      key: 'org.umi.dashboard.card.zaobao',
      title: '云谦早报',
      description: '这是一段本地启动的描述信息',
      icon: 'https://avatars1.githubusercontent.com/u/35128?v=4',
      right: <DailyReportHeader />,
      span: {
        xl: 12,
      },
      content: <DailyReport />,
    },
    {
      key: 'org.umi.dashboard.card.config',
      title: '配置',
      description: '这是一段构建的描述信息',
      icon: 'https://gw.alipayobjects.com/zos/antfincdn/IkJdCIioc7/bigfish.svg',
      content: [<a href="/tasks">启动</a>, <a href="/tasks">检查</a>],
    },
  ]);

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
