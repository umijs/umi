import React, { useState } from 'react';
import { IUiApi } from 'umi-types';

import Context from './UIApiContext';
import BlocksViewer from './BlocksViewer';
import TitleTab from './TitleTab';
import Icon from './icon';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';
import model, { initApiToGlobal, namespace } from './model';
import Container from './Container';

export default (api: IUiApi) => {
  initApiToGlobal(api);
  const { FormattedMessage } = api.intl;

  api.addLocales({
    'zh-CN': zhCN,
    'en-US': enUS,
  });

  const ConnectedBlockViewer = api.connect((state: any) => ({
    block: state[namespace],
    loading: state.loading.models[namespace],
  }))(BlocksViewer);

  api.addDashboard({
    // 唯一标识，org.umi.dashboard.card.${key}
    key: 'org.umi.dashboard.card.block',
    title: <FormattedMessage id="org.umi.ui.blocks.content.title" />,
    description: <FormattedMessage id="org.umi.ui.blocks.content.description" />,
    icon: <Icon />,
    content: [
      <a onClick={() => api.redirect('/blocks?type=block')}>
        <FormattedMessage id="org.umi.ui.blocks.tabs.blocks" />
      </a>,
      <a onClick={() => api.redirect('/blocks?type=template')}>
        <FormattedMessage id="org.umi.ui.blocks.tabs.templates" />
      </a>,
    ],
  });

  api.addPanel({
    title: 'org.umi.ui.blocks.content.title',
    titleComponent: () => <TitleTab />,
    provider: ({ children, ...restProps }) => (
      <Container.Provider initialState={{ api }} {...restProps}>
        {children}
      </Container.Provider>
    ),
    path: '/blocks',
    icon: <Icon />,
    actions: [],
    component: () => (
      <Context.Provider
        value={{
          api,
        }}
      >
        <ConnectedBlockViewer />
      </Context.Provider>
    ),
  });

  // 注册 model
  api.registerModel(model);
};
