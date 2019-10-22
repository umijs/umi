import React from 'react';
import { IUiApi } from 'umi-types';

import Context from './client/UIApiContext';
import BlocksViewer from './client/index';
import Icon from './client/icon';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';
import model, { initApiToGlobal, namespace } from './client/model';

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

  api.addPanel({
    title: 'org.umi.ui.blocks.content.title',
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
