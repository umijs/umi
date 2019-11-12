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
    title: '资产',
    description: '这是一段构建的描述信息',
    icon: <Icon />,
    content: [
      <a onClick={() => api.redirect('/blocks?type=block')}>区块</a>,
      <a onClick={() => api.redirect('/blocks?type=template')}>模板</a>,
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
