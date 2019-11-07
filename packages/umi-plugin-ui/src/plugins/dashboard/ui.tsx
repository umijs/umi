import React from 'react';
import { IUiApi } from 'umi-types';
import { Setting } from '@ant-design/icons';
import Dashboard from './ui/index';
import ConfigAction from './ui/action';
import Context from './ui/context';
import DailyReport from './ui/plugins/dailyReport';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

export default (api: IUiApi) => {
  api.addLocales({
    'zh-CN': zhCN,
    'en-US': enUS,
  });
  const contextValue = {
    api,
  };

  api.addDashboard([
    {
      title: '任务',
      description: '这是一段构建的描述信息',
      icon: <Setting />,
      enable: true,
      content: [
        <a onClick={() => api.redirect('/tasks')}>启动</a>,
        <a href="/tasks">创建</a>,
        <a href="/tasks">检查</a>,
      ],
    },
    {
      title: '云谦早报',
      description: '这是一段本地启动的描述信息',
      icon: 'https://avatars1.githubusercontent.com/u/35128?v=4',
      enable: true,
      span: {
        xl: 12,
      },
      content: <DailyReport />,
    },
    {
      title: '配置',
      description: '这是一段构建的描述信息',
      icon: 'https://gw.alipayobjects.com/zos/antfincdn/IkJdCIioc7/bigfish.svg',
      enable: true,
      content: [<a href="/tasks">启动</a>, <a href="/tasks">检查</a>],
    },
  ]);

  api.addPanel({
    title: 'org.umi.ui.dashboard.panel',
    path: '/dashboard',
    actions: [
      <Context.Provider value={contextValue}>
        <ConfigAction />
      </Context.Provider>,
    ],
    icon: {
      type: 'dashboard',
      theme: 'filled',
    },
    component: () => (
      <Context.Provider value={contextValue}>
        <Dashboard />
      </Context.Provider>
    ),
  });
};
