import * as React from 'react';
import { message, Drawer, Dropdown, Menu, Divider, Popconfirm } from 'antd';
import {
  Folder,
  Profile,
  Swap,
  Home,
  QuestionCircle,
  Message,
  Close,
  Enter,
  Delete,
} from '@ant-design/icons';
import { formatMessage } from 'umi-plugin-react/locale';
import cls from 'classnames';
import history from '@tmp/history';
import omit from 'lodash/omit';
import { LOCALES, LOCALES_ICON } from '@/enums';
import Context from '@/layouts/Context';
import Logs from '@/components/Logs';
import { handleBack } from '@/utils';
import { getHistory, listenMessage, clearLog } from '@/services/logs';

import styles from './Footer.less';

const { useState, useEffect, useReducer, useContext } = React;

export interface IFooterProps {
  type: 'list' | 'detail' | 'loading';
}

const FOOTER_RIGHT = [
  {
    title: 'org.umi.ui.global.feedback',
    icon: <Message />,
    href: 'https://github.com/umijs/umi/issues/new/choose',
  },
  {
    title: 'org.umi.ui.global.help',
    icon: <QuestionCircle />,
    href: 'https://umijs.org',
  },
];

const Footer: React.SFC<IFooterProps> = props => {
  const { type } = props;
  const { locale, setLocale, currentProject } = useContext(Context);
  const { path, name } = currentProject || {};
  const [logVisible, setLogVisible] = useState<boolean>(false);
  const [logs, dispatch] = useReducer((state, action) => {
    if (action.type === 'add') {
      return [...state, action.payload];
    }
    if (action.type === 'setHistory') {
      return action.payload;
    }
  }, []);

  console.log('logslogslogs', logs);

  const showLogPanel = () => {
    setLogVisible(true);
  };

  const hideLogPanel = () => {
    setLogVisible(false);
  };

  const redirect = (url: string) => {
    history.replace(url);
  };

  const getLogs = async () => {
    const { data: historyLogs } = await getHistory();
    console.log('historyLogshistoryLogs', historyLogs);
    dispatch({
      type: 'setHistory',
      payload: historyLogs,
    });
  };

  useEffect(() => {
    (async () => {
      await getLogs();
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
        setLocale(key, false);
      }}
    >
      {Object.keys(omit(LOCALES, locale)).map((lang: any) => (
        <Menu.Item key={lang}>
          <LocaleText locale={lang} />
        </Menu.Item>
      ))}
    </Menu>
  );

  const handleClearLog = async () => {
    try {
      await clearLog();
    } catch (e) {
      message.error(formatMessage({ id: 'org.umi.ui.global.log.clear.error' }));
    } finally {
      await getLogs();
    }
  };

  return (
    <div className={styles.footer}>
      <div className={styles.statusBar}>
        {type === 'loading' && (
          <div onClick={() => handleBack()} className={actionCls}>
            <Home style={{ marginRight: 4 }} /> {formatMessage({ id: 'org.umi.ui.global.home' })}
          </div>
        )}
        {type === 'detail' && path && name && (
          <>
            <div onClick={() => handleBack(false)} className={actionCls}>
              <Home style={{ marginRight: 4 }} />
            </div>
            <div className={styles.section}>
              <Folder style={{ marginRight: 4 }} /> {path}
            </div>
          </>
        )}
        <div onClick={() => (logVisible ? hideLogPanel() : showLogPanel())} className={logCls}>
          <Profile /> {formatMessage({ id: 'org.umi.ui.global.log' })}
        </div>
        {FOOTER_RIGHT.map((item, i) => (
          <div className={styles.section} key={i.toString()}>
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {item.icon} {formatMessage({ id: item.title })}
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
        title={
          <div className={styles['section-drawer-title']}>
            <h1>{formatMessage({ id: 'org.umi.ui.global.log.upperCase' })}</h1>
            <div className={styles['section-drawer-title-action']}>
              <Popconfirm
                title={formatMessage({ id: 'org.umi.ui.global.log.clear.confirm' })}
                onConfirm={handleClearLog}
                okText={formatMessage({ id: 'org.umi.ui.global.okText' })}
                cancelText={formatMessage({ id: 'org.umi.ui.global.cancelText' })}
              >
                <Delete />
              </Popconfirm>
              <Enter />
              <Divider type="vertical" />
              <Close onClick={hideLogPanel} />
            </div>
          </div>
        }
        closable={false}
        visible={logVisible}
        placement="bottom"
        mask={false}
        className={styles.logs}
        height={300}
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
