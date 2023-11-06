import { App, Button, Space, theme, version } from 'antd';
import React, { useState } from 'react';
import { getLocale, setLocale, useIntl } from 'umi';

export default function Page() {
  const [isZh, setIsZh] = useState(true);
  // 若要使用 useApp hook，须先在 antd 插件中配置 appConfig
  const { message, modal } = App.useApp();
  const locale = getLocale();
  const { token } = theme.useToken();

  const showModal = () => {
    modal.confirm({
      title: 'Hai',
      content: '注意 Modal 内的按钮样式应该和页面中的按钮样一致',
      maskClosable: true,
    });
  };
  const intl = useIntl();
  const msg = intl.formatMessage({
    id: 'HELLO',
  });
  const sayHai = () => {
    // .umirc.ts 中配置了 appConfig.message.maxCount = 3
    // app.txt 中配置了 appConfig.message.duration = 5
    message.info('Hai');
  };

  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
        height: '100vh',
      }}
    >
      <h1>with antd@{version}</h1>
      <Space>
        <Button onClick={sayHai}>Say Hai</Button>
        <Button type="primary" onClick={showModal}>
          Open Modal
        </Button>
        locale:{locale}
        <Button
          onClick={() => {
            setIsZh(!isZh);
            setLocale(isZh ? 'en-US' : 'zh-CN', false);
          }}
        >
          {msg}
        </Button>
      </Space>
    </div>
  );
}
