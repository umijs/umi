import React, { useState, useEffect } from 'react';
import { IUiApi } from 'umi-types';
import { Loading } from '@ant-design/icons';
import styles from './index.module.less';

interface LogPanelProps {
  api: IUiApi;
  loading?: boolean;
}

const LogPanel: React.FC<LogPanelProps> = ({ api, loading }) => {
  const [logs, setLogs] = useState<string[]>([]);
  useEffect(() => {
    const tempLogs = [];
    /**
     *监听日志，每次会 push 一条
     */
    api.listenRemote({
      type: 'org.umi.block.add-blocks-log',
      onMessage: ({ data }) => {
        tempLogs.push(data);
        setLogs([...tempLogs]);
      },
    });

    /**
     * 获取上次安装的日志
     * 安装完成会清空
     */
    api
      .callRemote({
        type: 'org.umi.block.get-pre-blocks-log',
      })
      .then(({ data }) => {
        setLogs([...data]);
      });
    return () => {
      // 组件结束挂载之后，清空
      setLogs([]);
    };
  }, []);
  return (
    <div className={styles.terminal}>
      <pre>{logs.join('\n')}</pre>
      {loading && <Loading />}
    </div>
  );
};

export default LogPanel;
