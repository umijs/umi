import React from 'react';
import { IUiApi } from 'umi-types';
import Dev from './components/Dev';
import Build from './components/Build';
import Lint from './components/Lint';
import Test from './components/Test';
import Install from './components/Install';
import { initApiToGloal, getTerminalIns, getNoticeMessage } from './util';
import { TaskType, TaskState } from '@/src/core/enums';
import styles from './ui.module.less';
import enUS from '../locales/en-US';
import zhCN from '../locales/zh-CN';

export default (api: IUiApi) => {
  initApiToGloal(api);
  const { intl } = api;
  const { TwoColumnPanel, callRemote } = api;
  const imgProperty = {
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
          src="https://gw.alipayobjects.com/zos/basement_prod/6000d285-334d-4513-a405-2d9f890f56e9.svg"
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
          src="https://gw.alipayobjects.com/zos/basement_prod/6000d285-334d-4513-a405-2d9f890f56e9.svg"
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
          src="https://gw.alipayobjects.com/zos/basement_prod/fb3b6fab-253e-41fc-981a-8bfc5dc4fede.svg"
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
          src="https://gw.alipayobjects.com/zos/basement_prod/f0d64a31-1767-4ab7-a7f9-eea044d92ce3.svg"
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
          src="https://gw.alipayobjects.com/zos/basement_prod/d9fbc2fa-5bb6-46f4-bd15-385a94bc6d1c.svg"
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
      const { title, message, ...rest } = getNoticeMessage(type, state);
      api.notify({
        title: `${api.currentProject.name} ${intl({ id: title })}`,
        message: intl({ id: message }),
        ...rest,
      });
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
          component: () => (
            <div className={styles.section}>
              <Component api={api} />
            </div>
          ),
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
