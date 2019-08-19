import React from 'react';
import { IUiApi } from 'umi-types';
import Dev from './ui/components/Dev';
import Build from './ui/components/Build';
import Lint from './ui/components/Lint';
import Test from './ui/components/Test';
import { initApiToGloal, getTerminalIns, getNoticeMessage } from './ui/util';
import { TaskType, TaskState } from './server/core/enums';

const { useState, useRef, useEffect } = React;

export default (api: IUiApi) => {
  initApiToGloal(api);

  const { TwoColumnPanel, callRemote } = api;

  const SCRIPTS = {
    [TaskType.BUILD]: {
      title: '构建',
      icon: 'plus-circle',
      description: '项目构建',
      Component: Build,
    },
    [TaskType.DEV]: {
      title: '本地开发',
      icon: 'plus-circle',
      description: '启动本地服务器',
      Component: Dev,
    },
    [TaskType.LINT]: {
      title: 'Lint',
      icon: 'plus-circle',
      description: '代码风格校验',
      Component: Lint,
    },
    [TaskType.TEST]: {
      title: '测试',
      icon: 'plus-circle',
      description: '项目测试',
      Component: Test,
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
      if (data.startsWith('\n')) {
        data = data.substr(1);
      }
      if (data.endsWith('\n')) {
        data = data.substr(0, data.length - 1);
      }
      data.split('\n').forEach((msg: string) => {
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
