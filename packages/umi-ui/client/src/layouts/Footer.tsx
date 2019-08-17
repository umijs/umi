import * as React from 'react';
import { Drawer } from 'antd';
import { Folder, Profile, Bug } from '@ant-design/icons';
import cls from 'classnames';
import Terminal from '@/components/Terminal';
import Logs from '@/components/Logs';
import { getHistory, listenMessage } from '@/services/logs';

import styles from './Footer.less';

const { useState, useEffect, useReducer } = React;

const Footer: React.SFC<{}> = props => {
  const [logVisible, setLogVisible] = useState<boolean>(false);
  const [logs, dispatch] = useReducer((state, action) => {
    if (action.type === 'add') {
      return [...state, action.payload];
    }
    if (action.type === 'setHistory') {
      return action.payload;
    }
  }, []);

  const showLogPanel = () => {
    setLogVisible(true);
  };

  const hideLogPanel = () => {
    setLogVisible(false);
  };

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

    if (window.g_uiEventEmitter) {
      window.g_uiEventEmitter.on('SHOW_LOG', () => {
        setLogVisible(true);
      });
      window.g_uiEventEmitter.on('HIDE_LOG', () => {
        setLogVisible(false);
      });
    }
    return () => {
      if (window.g_uiEventEmitter) {
        window.g_uiEventEmitter.removeListener('SHOW_LOG', () => {});
        window.g_uiEventEmitter.removeListener('HIDE_LOG', () => {});
      }
    };
  }, []);

  return (
    <div className={styles.footer}>
      <div className={styles.statusBar}>
        <div className={styles.section}>
          <Folder /> 当前位置
        </div>
        <div
          onClick={() => (logVisible ? hideLogPanel() : showLogPanel())}
          className={`${styles.section} ${styles.action} ${styles.log}`}
        >
          <Profile /> 日志
        </div>
        <div className={styles.section}>
          <Bug /> bbb
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
