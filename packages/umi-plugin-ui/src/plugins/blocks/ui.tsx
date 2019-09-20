import React from 'react';
import { IUiApi } from 'umi-types';

import BlocksViewer from './ui/index';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

export default (api: IUiApi) => {
  window.addEventListener('message', e => {
    console.log(`[Block] Received message`, e.data);
    const { action, payload } = JSON.parse(e.data);
    if (action === 'umi.ui.block.addBlock') {
      // TODO:
      // 1. show mini
      // 2. center mini iframe
      // 3. add block with payload.filename and payload.index
    }
  });

  api.addLocales({
    'zh-CN': zhCN,
    'en-US': enUS,
  });

  api.addPanel({
    title: 'org.umi.ui.blocks.content.title',
    path: '/blocks',
    icon: 'environment',
    component: () => <BlocksViewer api={api} />,
  });
};
