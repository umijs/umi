import React, { useState, useEffect, useContext } from 'react';
import { Loading } from '@ant-design/icons';
import { Terminal as XTerminal } from 'xterm';

import styles from './index.module.less';
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
      const tempLogs = [];
      /**
       *监听日志，每次会 push 一条
       */
      api.listenRemote({
        type: 'org.umi.block.add-blocks-log',
        onMessage: ({ data }) => {
          tempLogs.push(data);
          if (terminalRef) {
            terminalRef.writeln(data);
          }
          setLogs([...tempLogs]);
        },
      });
    },
    [terminalRef],
  );

  useEffect(() => {
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
  if (!Terminal) {
    return null;
  }
  return (
    <div className={styles.terminal}>
      <Terminal
        title={loading ? <Loading /> : ' '}
        defaultValue={logs.join('\n')}
        onInit={terminal => setTerminalRef(terminal)}
        config={api.isMini() ? { fontSize: 12 } : {}}
      />
    </div>
  );
};

export default LogPanel;
