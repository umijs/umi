import React, { useState, useEffect, useContext } from 'react';
import { LoadingOutlined } from '@ant-design/icons';
import { Terminal as XTerminal } from 'xterm';
import Context from '../UIApiContext';

interface LogPanelProps {
  loading?: boolean;
}

const LogPanel: React.FC<LogPanelProps> = ({ loading }) => {
  const { api } = useContext(Context);
  const [logs, setLogs] = useState<string[]>([]);
  const [terminalRef, setTerminalRef] = useState<XTerminal>(null);
  const { Terminal } = api;

  useEffect(
    () => {
      if (!terminalRef) {
        return;
      }
      /**
       * 获取上次安装的日志
       * 安装完成会清空
       */
      api
        .callRemote({
          type: 'org.umi.block.get-adding-blocks-log',
        })
        .then(({ data }) => {
          if (terminalRef) {
            terminalRef.write(data.replace(/\n/g, '\r\n'));
          }
        });

      const tempLogs = [];
      /**
       *监听日志，每次会 push 一条
       */
      api.listenRemote({
        type: 'org.umi.block.add-blocks-log',
        onMessage: ({ data }) => {
          tempLogs.push(data);
          if (terminalRef) {
            terminalRef.write(data.replace(/\n/g, '\r\n'));
          }
          setLogs([...tempLogs]);
        },
      });
    },
    [terminalRef],
  );

  if (!Terminal) {
    return null;
  }
  return (
    <Terminal
      title={loading ? <LoadingOutlined /> : ' '}
      defaultValue={logs.join('')}
      onInit={terminal => {
        setTerminalRef(terminal);
      }}
      config={api.isMini() ? { fontSize: 12 } : {}}
    />
  );
};

export default LogPanel;
