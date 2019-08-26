import React from 'react';
import { IUiApi } from 'umi-types';
import Dev from './ui/components/Dev';
import Build from './ui/components/Build';
import Lint from './ui/components/Lint';
import Test from './ui/components/Test';
import Install from './ui/components/Install';
import { initApiToGloal, getTerminalIns, getNoticeMessage } from './ui/util';
import { TaskType, TaskState } from './server/core/enums';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

export default (api: IUiApi) => {
  initApiToGloal(api);
  const { TwoColumnPanel, callRemote } = api;
  const imgProperty = {
    style: {
      backgroundColor: '#fff',
    },
    width: '32',
    height: '32',
  };

  const SCRIPTS = {
    [TaskType.DEV]: {
      key: 'dev',
      title: 'org.umi.ui.tasks.dev',
      icon: (
        <img
          {...imgProperty}
          src="https://gw.alipayobjects.com/zos/basement_prod/14f00c22-7720-41c9-82cc-acf9c47c2c56.svg"
        />
      ),
      description: 'org.umi.ui.tasks.dev.desc',
      Component: Dev,
    },
    [TaskType.BUILD]: {
      key: 'build',
      title: 'org.umi.ui.tasks.build',
      icon: (
        <img
          {...imgProperty}
          src="https://gw.alipayobjects.com/zos/basement_prod/14f00c22-7720-41c9-82cc-acf9c47c2c56.svg"
        />
      ),
      description: 'org.umi.ui.tasks.build.desc',
      Component: Build,
    },
    [TaskType.LINT]: {
      key: 'lint',
      title: 'org.umi.ui.tasks.lint',
      icon: (
        <img
          {...imgProperty}
          src="https://gw.alipayobjects.com/zos/basement_prod/45bdf48e-3063-4a81-b2c3-49bfe67141c1.svg"
        />
      ),
      description: 'org.umi.ui.tasks.lint.desc',
      Component: Lint,
    },
    [TaskType.TEST]: {
      key: 'test',
      title: 'org.umi.ui.tasks.test',
      icon: (
        <img
          {...imgProperty}
          src="https://gw.alipayobjects.com/zos/basement_prod/b6825efe-9e51-4ed8-a624-97676bf2daf3.svg"
        />
      ),
      description: 'org.umi.ui.tasks.test.desc',
      Component: Test,
    },
    [TaskType.INSTALL]: {
      key: 'install',
      title: 'org.umi.ui.tasks.install',
      icon: (
        <img
          {...imgProperty}
          src="https://gw.alipayobjects.com/mdn/rms_38b4e4/afts/img/A*o7rAS63dOUEAAAAAAAAAAABkARQnAQ"
        />
      ),
      description: 'org.umi.ui.tasks.install.desc',
      Component: Install,
    },
  };

  // 插件初始化
  callRemote({
    type: 'plugin/init',
  });

  api.listenRemote({
    type: 'org.umi.task.log',
    onMessage: ({ log = '', taskType }: { log: string; taskType: TaskType }) => {
      if (!log) {
        return;
      }
      getTerminalIns(taskType).write(log.replace(/\n/g, '\r\n'));
    },
  });

  // 全局通知
  api.listenRemote({
    type: 'org.umi.task.state',
    onMessage: ({ detail: result, taskType: type }) => {
      const { state } = result;
      if ([TaskState.INIT, TaskState.ING].indexOf(state) > -1) {
        return;
      }
      api.notify(getNoticeMessage(type, state));
    },
  });

  // 全局通知
  api.listenRemote({
    type: 'org.umi.task.state',
    onMessage: ({ detail: result, taskType: type }) => {
      const { state } = result;
      if ([TaskState.INIT, TaskState.ING].indexOf(state) > -1) {
        return;
      }
      api.notify(getNoticeMessage(type, state));
    },
  });

  const TasksView = () => (
    <TwoColumnPanel
      sections={Object.keys(SCRIPTS).map((taskType: string) => {
        const { key, title, icon, description, Component } = SCRIPTS[taskType];
        return {
          key,
          title,
          icon,
          description,
          component: () => <Component api={api} />,
        };
      })}
    />
  );

  api.addLocales({
    'zh-CN': zhCN,
    'en-US': enUS,
  });

  api.addPanel({
    title: 'org.umi.ui.tasks.title',
    path: '/tasks',
    icon: {
      type: 'project',
      theme: 'filled',
    },
    component: TasksView,
  });
};
