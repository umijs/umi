import React from 'react';
import { IUiApi } from 'umi-types';
import { ControlFilled } from '@ant-design/icons';
import { Button } from 'antd';
import ConfigManager from './ui/index';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

const ConfigAction = ({ api }: { api: IUiApi }) => {
  const { intl } = api;
  const { FormattedMessage } = intl;
  return (
    <Button
      onClick={() => {
        api.launchEditor({
          type: 'config',
        });
      }}
      size={api.mini ? 'small' : 'default'}
      type="default"
    >
      <FormattedMessage id="org.umi.ui.configuration.actions.open.config" />
    </Button>
  );
};

export default (api: IUiApi) => {
  api.addLocales({
    'zh-CN': zhCN,
    'en-US': enUS,
  });

  const { FormattedMessage } = api.intl;

  api.addDashboard({
    key: 'org.umi.dashboard.card.config',
    // default enable
    enable: false,
    title: <FormattedMessage id="org.umi.ui.configuration.panel" />,
    description: <FormattedMessage id="org.umi.ui.configuration.panel.description" />,
    icon: <ControlFilled />,
    content: [
      <a onClick={() => api.redirect('/configuration')}>
        <FormattedMessage id="org.umi.ui.configuration.project.config.title" />
      </a>,
    ],
  });

  api.addPanel({
    title: 'org.umi.ui.configuration.panel',
    actions: [<ConfigAction api={api} />],
    path: '/configuration',
    icon: <ControlFilled />,
    component: () => <ConfigManager api={api} />,
  });
};
