import React, { useContext, useEffect, useState } from 'react';
import { Result, Button } from 'antd';
import Context from '../UIApiContext';
import styles from './ResultPanel.module.less';

export default ({ name, url, onFinish }: { name: string; url: string; onFinish: () => void }) => {
  const { api } = useContext(Context);
  const [alive, setAlive] = useState<boolean>(false);
  const isMini = api.isMini();
  useEffect(() => {
    (async () => {
      const msg = (await api.callRemote({
        type: 'tasks/is_dev_server_alive',
      })) as {
        alive: boolean;
      };
      setAlive(msg.alive);
    })();
  }, []);
  return (
    <div className={styles.result}>
      <Result
        status="success"
        title={`${name} 安装成功！`}
        subTitle="代码已插入页面。编译完成后页面将会自动刷新。"
        extra={
          isMini || !alive
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
    </div>
  );
};
