import React from 'react';
import { IUiApi } from 'umi-types';
import { Button, message } from 'antd';
import { Delete } from '@ant-design/icons';

import Context from './ui/context';
import BlocksViewer from './ui/index';
import GlobalSearch from './ui/search';
import zhCN from './locales/zh-CN';
import enUS from './locales/en-US';

const clearCache = async (api: IUiApi) => {
  try {
    const { data } = (await api.callRemote({
      type: 'org.umi.block.clear',
    })) as {
      data: string;
    };
    message.success(data);
  } catch (e) {
    message.error(e.message);
  }
};

export default (api: IUiApi) => {
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

  api.addPanel({
    title: 'org.umi.ui.blocks.content.title',
    path: '/blocks',
    icon: 'block',
    actions: [
      () => <GlobalSearch api={api} />,
      () => (
        <Button onClick={() => clearCache(api)}>
          <Delete />
        </Button>
      ),
      {
        title: 'org.umi.ui.blocks.actions.clear',
        type: 'default',
        action: {
          type: 'org.umi.block.clear',
        },
      },
    ],
    component: () => (
      <Context.Provider
        value={{
          api,
        }}
      >
        <BlocksViewer />
      </Context.Provider>
    ),
  });
};
