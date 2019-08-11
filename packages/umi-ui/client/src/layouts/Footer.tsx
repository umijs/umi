import * as React from 'react';
import { Drawer, Icon } from 'antd';
import cls from 'classnames';
import Terminal from '@/components/Terminal';
import Logs from '@/components/Logs';
import { getHistory, listenMessage } from '@/services/logs';

import styles from './Footer.less';

const { useState, useEffect, useReducer } = React;

interface LogsProps {
  logVisible: boolean;
  showLogPanel: () => void;
  hideLogPanel: () => void;
}

const Footer: React.SFC<LogsProps> = props => {
  const { logVisible, showLogPanel, hideLogPanel } = props;
  const [logs, dispatch] = useReducer((state, action) => {
    if (action.type === 'add') {
      return [...state, action.payload];
    }
    if (action.type === 'setHistory') {
      return action.payload;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { data: historyLogs } = await getHistory();
      dispatch({
        type: 'setHistory',
        payload: historyLogs,
      });
      listenMessage({
        onMessage(log) {
          dispatch({
            type: 'add',
            payload: log,
          });
        },
      });
    })();
  }, []);

  return (
    <div className={styles.footer}>
      <div className={styles.statusBar}>
        <div className={styles.section}>
          <Icon type="folder" /> 当前位置
        </div>
        <div
          onClick={() => (logVisible ? hideLogPanel() : showLogPanel())}
          className={`${styles.section} ${styles.action} ${styles.log}`}
        >
          <Icon type="profile" /> 日志
        </div>
        <div className={styles.section}>
          <Icon type="bug" /> bbb
        </div>
      </div>
      <Drawer
        title="日志"
        visible={logVisible}
        placement="bottom"
        mask={false}
        className={styles.logs}
        height={300}
        onClose={() => hideLogPanel()}
      >
        <Logs
          logs={logs}
          style={{
            height: 225,
          }}
        />
      </Drawer>
    </div>
  );
};

export default Footer;
