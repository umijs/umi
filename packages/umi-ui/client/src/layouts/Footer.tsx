import * as React from 'react';
import { message, Drawer, Dropdown, Menu, Divider, Popconfirm } from 'antd';
import {
  FolderFilled,
  ProfileFilled,
  Swap,
  HomeFilled,
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
import zhCN from '@/locales/zh-CN';
import enUS from '@/locales/en-US';
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
  const message = locale === 'en-US' ? enUS : zhCN;
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
        setLocale(key, type === 'loading');
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

  const handleScorllBottom = () => {
    const container = document.getElementById('ui-footer-logs');
    if (container) {
      container.scrollIntoView({ block: 'end' });
    }
  };

  return (
    <div className={styles.footer}>
      <div className={styles.statusBar}>
        <div onClick={() => handleBack(type === 'loading')} className={actionCls}>
          <HomeFilled style={{ marginRight: 4 }} />
        </div>
        {type === 'detail' && path && name && (
          <>
            <div className={styles.section}>
              <FolderFilled style={{ marginRight: 4 }} /> {path}
            </div>
          </>
        )}
        <div onClick={() => (logVisible ? hideLogPanel() : showLogPanel())} className={logCls}>
          <ProfileFilled />{' '}
          {type === 'loading'
            ? message['org.umi.ui.global.log']
            : formatMessage({ id: 'org.umi.ui.global.log' })}
        </div>
        {FOOTER_RIGHT.map((item, i) => (
          <div className={styles.section} key={i.toString()}>
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {item.icon}{' '}
              {type === 'loading' ? message[item.title] : formatMessage({ id: item.title })}
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
            <h1>
              {type === 'loading'
                ? message['org.umi.ui.global.log.upperCase']
                : formatMessage({ id: 'org.umi.ui.global.log.upperCase' })}
            </h1>
            <div className={styles['section-drawer-title-action']}>
              <Popconfirm
                title={formatMessage({ id: 'org.umi.ui.global.log.clear.confirm' })}
                onConfirm={handleClearLog}
                okText={formatMessage({ id: 'org.umi.ui.global.okText' })}
                cancelText={formatMessage({ id: 'org.umi.ui.global.cancelText' })}
              >
                <Delete />
              </Popconfirm>
              <Enter onClick={handleScorllBottom} />
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
          type={type}
          style={{
            height: 225,
          }}
        />
      </Drawer>
    </div>
  );
};

export default Footer;
