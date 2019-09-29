import React, { useContext } from 'react';
import { Result, Button } from 'antd';
import Context from '../UIApiContext';

export default ({ name, url, onFinish }: { name: string; url: string; onFinish: () => void }) => {
  const { api } = useContext(Context);
  const isMini = api.isMini();
  return (
    <Result
      status="success"
      title={`${name} 安装成功！`}
      subTitle="代码已插入页面。编译完成后页面将会自动刷新。"
      extra={
        isMini
          ? [
              <Button type="primary" key="preview" onClick={() => onFinish()}>
                完成
              </Button>,
            ]
          : [
              <Button
                type="primary"
                key="preview"
                onClick={() => {
                  window.open(url);
                  onFinish();
                }}
              >
                预览
              </Button>,
            ]
      }
    />
  );
};
