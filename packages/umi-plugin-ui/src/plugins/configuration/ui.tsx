import React from 'react';
import { IUiApi } from 'umi-types';
import { IPanelAction } from 'umi-types/ui';
import ConfigManager from './ui/index';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

export default (api: IUiApi) => {
  const openConfigAction: IPanelAction = {
    title: 'org.umi.ui.configuration.actions.open.config',
    type: 'default',
    action: {
      type: '@@actions/openConfigFile',
      payload: {
        projectPath: api.currentProject.path,
      },
    },
  };

  api.addLocales({
    'zh-CN': zhCN,
    'en-US': enUS,
  });
  api.addPanel({
    title: 'org.umi.ui.configuration.panel',
    actions: [openConfigAction],
    path: '/configuration',
    icon: {
      type: 'control',
      theme: 'filled',
    },
    component: () => <ConfigManager api={api} openConfigAction={openConfigAction} />,
  });
};
