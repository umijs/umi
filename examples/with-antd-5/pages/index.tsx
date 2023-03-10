import { App, Button, Space, version } from 'antd';
import React from 'react';

export default function Page() {
  // 若要使用 useApp hook，须先在 antd 插件中配置 appConfig
  const { message, modal } = App.useApp();

  const showModal = () => {
    modal.confirm({
      title: 'Hai',
      content: '注意 Modal 内的按钮样式应该和页面中的按钮样一致',
      maskClosable: true,
    });
  };

  const sayHai = () => {
    // .umirc.ts 中配置了 appConfig.message.maxCount = 3
    // app.txt 中配置了 appConfig.message.duration = 5
    message.info('Hai');
  };

  return (
    <>
      <h1>with antd@{version}</h1>
      <Space>
        <Button onClick={sayHai}>Say Hai</Button>
        <Button type="primary" onClick={showModal}>
          Open Modal
        </Button>
      </Space>
    </>
  );
}
