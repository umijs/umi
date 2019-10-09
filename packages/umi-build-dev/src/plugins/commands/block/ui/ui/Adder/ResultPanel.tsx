import React, { useContext, useEffect, useState } from 'react';
import { Result, Button } from 'antd';
import Context from '../UIApiContext';
import styles from './ResultPanel.module.less';

export default ({ name, url, onFinish }: { name: string; url: string; onFinish: () => void }) => {
  const { api } = useContext(Context);
  const { intl } = api;
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
        title={`${name} ${intl({ id: 'org.umi.ui.blocks.adder.result.success' })}`}
        subTitle={intl({ id: 'org.umi.ui.blocks.adder.result.subTitle' })}
        extra={
          isMini || !alive
            ? [
                <Button type="primary" key="preview" onClick={() => onFinish()}>
                  {intl({ id: 'org.umi.ui.blocks.adder.result.done' })}
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
                  {intl({ id: 'org.umi.ui.blocks.adder.result.preview' })}
                </Button>,
              ]
        }
      />
    </div>
  );
};
