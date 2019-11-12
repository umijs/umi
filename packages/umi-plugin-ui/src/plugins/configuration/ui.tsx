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

  api.addDashboard({
    key: 'org.umi.dashboard.card.config',
    title: api.intl({ id: 'org.umi.ui.configuration.panel' }),
    description: '这是一段构建的描述信息',
    icon: <ControlFilled />,
    content: [<a onClick={() => api.redirect('/configuration')}>项目配置</a>],
  });

  api.addPanel({
    title: 'org.umi.ui.configuration.panel',
    actions: [<ConfigAction api={api} />],
    path: '/configuration',
    icon: <ControlFilled />,
    component: () => <ConfigManager api={api} />,
  });
};
