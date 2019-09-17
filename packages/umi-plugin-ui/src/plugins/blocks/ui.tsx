import React from 'react';
import { IUiApi } from 'umi-types';

import BlocksViewer from './ui/index';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

export default (api: IUiApi) => {
  api.addLocales({
    'zh-CN': zhCN,
    'en-US': enUS,
  });

  console.log('api.addPanel');

  api.addPanel({
    title: 'org.umi.ui.blocks.content.title',
    path: '/blocks',
    icon: 'environment',
    component: () => <BlocksViewer api={api} />,
  });
};
