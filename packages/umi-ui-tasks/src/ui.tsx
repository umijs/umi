import React from 'react';
import { IUiApi } from 'umi-types';
import Dev from './ui/components/Dev';
import Build from './ui/components/Build';
import Lint from './ui/components/Lint';
import Test from './ui/components/Test';
import Install from './ui/components/Install';
import { initApiToGloal, getTerminalIns, getNoticeMessage } from './ui/util';
import { TaskType, TaskState } from './server/core/enums';

export default (api: IUiApi) => {
  initApiToGloal(api);

  const { TwoColumnPanel, callRemote } = api;

  const SCRIPTS = {
    [TaskType.DEV]: {
      title: '本地开发',
      icon: (
        <img
          width="32"
          height="32"
          src="https://gw.alipayobjects.com/zos/basement_prod/14f00c22-7720-41c9-82cc-acf9c47c2c56.svg"
        />
      ),
      description: '启动本地服务器',
      Component: Dev,
    },
    [TaskType.BUILD]: {
      title: '构建',
      icon: (
        <img
          width="32"
          height="32"
          src="https://gw.alipayobjects.com/zos/basement_prod/14f00c22-7720-41c9-82cc-acf9c47c2c56.svg"
        />
      ),
      description: '项目构建',
      Component: Build,
    },
    [TaskType.LINT]: {
      title: '代码风格检查',
      icon: (
        <img
          width="32"
          height="32"
          src="https://gw.alipayobjects.com/zos/basement_prod/45bdf48e-3063-4a81-b2c3-49bfe67141c1.svg"
        />
      ),
      description: '代码风格校验',
      Component: Lint,
    },
    [TaskType.TEST]: {
      title: '测试',
      icon: (
        <img
          width="32"
          height="32"
          src="https://gw.alipayobjects.com/zos/basement_prod/bc817f9d-5b67-4b04-b568-3f6fe8792e90.svg"
        />
      ),
      description: '项目测试',
      Component: Test,
    },
    [TaskType.INSTALL]: {
      title: '重装依赖',
      icon: (
        <img
          width="32"
          height="32"
          src="https://gw.alipayobjects.com/mdn/rms_38b4e4/afts/img/A*o7rAS63dOUEAAAAAAAAAAABkARQnAQ"
        />
      ),
      description: '重新安装依赖',
      Component: Install,
    },
  };

  // 插件初始化
  callRemote({
    type: 'plugin/init',
  });

  api.listenRemote({
    type: 'org.umi.task.log',
    onMessage: ({ data = '', taskType }: { data: string; taskType: TaskType }) => {
      if (!data) {
        return;
      }
      const terminal = getTerminalIns(taskType);
      data.split('\n').forEach((msg: string) => {
        if (!msg) {
          return;
        }
        terminal.writeln(msg);
      });
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
        const { title, icon, description, Component } = SCRIPTS[taskType];
        return {
          title,
          icon,
          description,
          component: () => <Component api={api} />,
        };
      })}
    />
  );

  api.addPanel({
    title: '任务管理',
    path: '/tasks',
    icon: {
      type: 'project',
      theme: 'filled',
    },
    component: TasksView,
  });
};
