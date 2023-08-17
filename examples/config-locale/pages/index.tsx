import { Button, QRCode, Space, version } from 'antd';
import React, { useState } from 'react';
import { addLocale, getLocale, setLocale, useIntl } from 'umi';

export default function Page() {
  const [isZh, setIsZh] = useState(true);
  const locale = getLocale();
  const addWelComeMessage = () => {
    addLocale('zh-CN', {
      welcome: '欢迎！',
    });
  };
  const intl = useIntl();
  const msg = intl.formatMessage({
    id: 'HELLO',
  });
  const welcome = intl.formatMessage({
    id: 'welcome',
  });
  return (
    <>
      <h1>with antd@{version}</h1>
      <QRCode
        value="https://ant.design/"
        status="expired"
        onRefresh={() => console.log('refresh')}
      />
      <Space>
        <Button type="primary" onClick={addWelComeMessage}>
          追加中文 locale
        </Button>
      </Space>
      locale:{locale}
      <Button
        onClick={() => {
          setIsZh(!isZh);
          setLocale(isZh ? 'en-US' : 'zh-CN', false);
        }}
      >
        {msg}
      </Button>
      {welcome}
    </>
  );
}
