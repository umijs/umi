import React, { useState, useEffect } from 'react';
import { IUiApi } from 'umi-types';

interface LogPanelProps {
  api: IUiApi;
}

const LogPanel: React.FC<LogPanelProps> = ({ api }) => {
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
    <div>
      {logs.map(log => (
        <div>{log}</div>
      ))}
    </div>
  );
};

export default LogPanel;
