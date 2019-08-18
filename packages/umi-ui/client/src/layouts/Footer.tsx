import * as React from 'react';
import { Drawer } from 'antd';
import { Folder, Profile, Bug, Home } from '@ant-design/icons';
import cls from 'classnames';
import history from '@tmp/history';
import Terminal from '@/components/Terminal';
import Logs from '@/components/Logs';
import { getHistory, listenMessage } from '@/services/logs';

import styles from './Footer.less';

const { useState, useEffect, useReducer } = React;

export interface IFooterProps {
  type: 'list' | 'detail';
}

const Footer: React.SFC<IFooterProps> = props => {
  const { type } = props;
  const { path, name } = window.g_uiCurrentProject || {};
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

  const redirect = (url: string) => {
    history.replace(url);
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

  const actionCls = cls(styles.section, styles.action);
  const logCls = cls(actionCls, styles.log);

  return (
    <div className={styles.footer}>
      <div className={styles.statusBar}>
        {type === 'detail' && path && name && (
          <>
            <div onClick={() => redirect('/project/select')} className={actionCls}>
              <Home style={{ marginRight: 4 }} /> {name}
            </div>
            <div className={styles.section}>
              <Folder style={{ marginRight: 4 }} /> {path}
            </div>
          </>
        )}
        <div onClick={() => (logVisible ? hideLogPanel() : showLogPanel())} className={logCls}>
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
