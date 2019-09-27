import React from 'react';
import { IUiApi } from 'umi-types';

import Context from './ui/UIApiContext';
import BlocksViewer from './ui/index';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';
import model, { initApiToGloal } from './ui/model';

export default (api: IUiApi) => {
  initApiToGloal(api);

  if (api.isMini()) {
    window.addEventListener('message', e => {
      // try {
      //   const { action, payload } = JSON.parse(e.data);
      //   if (action === 'umi.ui.block.addBlock') {
      //     // TODO:
      //     // 1. show mini
      //     // 2. center mini iframe
      //     // 3. add block with payload.filename and payload.index
      //   }
      // } catch (e) {}
    });
  }

  api.addLocales({
    'zh-CN': zhCN,
    'en-US': enUS,
  });

  const ConnectedBlockViewer = api.connect((state: any) => ({
    block: state[model.namespace],
    loading: state.loading.models[model.namespace],
  }))(BlocksViewer);

  api.addPanel({
    title: 'org.umi.ui.blocks.content.title',
    path: '/blocks',
    icon: 'block',
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
