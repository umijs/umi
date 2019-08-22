import * as React from 'react';
import { Drawer, Dropdown, Menu } from 'antd';
import { Folder, Profile, Swap, Home, QuestionCircle, Message } from '@ant-design/icons';
import cls from 'classnames';
import history from '@tmp/history';
import omit from 'lodash/omit';
import { LOCALES, LOCALES_ICON, ILocale } from '@/enums';
import Terminal from '@/components/Terminal';
import Logs from '@/components/Logs';
import { getHistory, listenMessage } from '@/services/logs';

import styles from './Footer.less';

const { useState, useEffect, useReducer } = React;

export interface IFooterProps {
  type: 'list' | 'detail' | 'loading';
  setLocale: (locale: ILocale) => void;
  locale: ILocale;
}

const FOOTER_RIGHT = [
  { title: '反馈', icon: <Message />, href: 'https://umijs.org' },
  { title: '帮助', icon: <QuestionCircle />, href: 'https://umijs.org' },
];

const Footer: React.SFC<IFooterProps> = props => {
  const { type, locale, setLocale } = props;
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

  const LocaleText = ({ locale: textLocale }) => (
    <span>
      {LOCALES_ICON[textLocale]} {LOCALES[textLocale]}
    </span>
  );

  const menu = (
    <Menu
      theme="dark"
      onClick={({ key }) => {
        setLocale(key);
      }}
    >
      {Object.keys(omit(LOCALES, locale)).map((lang: any) => (
        <Menu.Item key={lang}>
          <LocaleText locale={lang} />
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className={styles.footer}>
      <div className={styles.statusBar}>
        {type === 'loading' && (
          <div
            onClick={() => {
              redirect('/project/select');
              window.location.reload();
            }}
            className={actionCls}
          >
            <Home style={{ marginRight: 4 }} /> 返回列表
          </div>
        )}
        {type === 'detail' && path && name && (
          <>
            <div onClick={() => redirect('/project/select')} className={actionCls}>
              <Home style={{ marginRight: 4 }} />
            </div>
            <div className={styles.section}>
              <Folder style={{ marginRight: 4 }} /> {path}
            </div>
          </>
        )}
        <div onClick={() => (logVisible ? hideLogPanel() : showLogPanel())} className={logCls}>
          <Profile /> 日志
        </div>
        {FOOTER_RIGHT.map((item, i) => (
          <div className={styles.section} key={i.toString()}>
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {item.icon} {item.title}
            </a>
          </div>
        ))}
        <div className={styles.section} style={{ cursor: 'pointer' }}>
          <Dropdown overlay={menu} placement="topRight">
            <p>
              <LocaleText locale={locale} />
              <span style={{ marginLeft: 8 }}>
                <Swap />
              </span>
            </p>
          </Dropdown>
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
