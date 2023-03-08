import { App, Button, version } from 'antd';
import React from 'react';

export default function Page() {
  // 若要使用 useApp hook，须先在 antd 插件中配置 appConfig
  const { message } = App.useApp();

  const sayHai = () => {
    message.success(
      <>
        <h3>Hi, I'm a message</h3>
        <sub>Observe the bottom button and home button style</sub>
        <br />
        <Button type="primary">noop</Button>
      </>,
    );
  };

  return (
    <div>
      <h1>with antd@{version}</h1>
      <Button type="primary" onClick={sayHai}>
        Button
      </Button>
    </div>
  );
}
