import * as React from 'react';
import { Popover, Drawer, Dropdown, Menu, Divider, Popconfirm, message, Tooltip } from 'antd';
import { Check as CheckIcon } from '@ant-design/icons';
import copy from 'copy-to-clipboard';
import get from 'lodash/get';
import {
  FolderFilled,
  ProfileFilled,
  HomeFilled,
  Tag as TagIcon,
  QuestionCircle,
  Message,
  Close,
  Enter,
  Delete,
} from '@ant-design/icons';
import { formatMessage } from 'umi-plugin-react/locale';
import cls from 'classnames';
import history from '@tmp/history';
import { LOCALES, LOCALES_ICON } from '@/enums';
import intl from '@/utils/intl';
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
    title: 'org.umi.ui.global.help',
    icon: <QuestionCircle style={{ marginRight: 4 }} />,
    href:
      // TODO: refactor
      window.g_bigfish
        ? 'https://bigfish.antfin-inc.com/doc/nt1c4v'
        : window.g_lang === 'zh-CN'
        ? 'https://umijs.org/zh/guide/umi-ui.html'
        : 'https://umijs.org/guide/umi-ui.html',
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

  const showLogPanel = () => {
    setLogVisible(true);
  };

  const hideLogPanel = () => {
    setLogVisible(false);
  };

  const redirect = (url: string) => {
    history.push(url);
  };

  const getLogs = async () => {
    const { data: historyLogs } = await getHistory();
    dispatch({
      type: 'setHistory',
      payload: historyLogs,
    });
  };

  // debounce will lead alert in Firefox
  const handleCopyPath = (p: string) => {
    if (p) {
      try {
        copy(p || '');
        message.success(intl({ id: 'org.umi.ui.global.copy.success' }));
      } catch (e) {
        message.error(intl({ id: 'org.umi.ui.global.copy.failure' }));
      }
    }
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

  const LocaleText = ({ locale: textLocale, checked, style }) => (
    <span style={style}>
      {typeof checked !== 'undefined' && (
        <CheckIcon style={{ marginRight: 8, opacity: checked ? 1 : 0 }} />
      )}
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
      {Object.keys(LOCALES).map((lang: any) => (
        <Menu.Item key={lang}>
          <LocaleText locale={lang} checked={locale === lang} />
        </Menu.Item>
      ))}
    </Menu>
  );

  const handleClearLog = async () => {
    try {
      await clearLog();
    } catch (e) {
      message.error(intl({ id: 'org.umi.ui.global.log.clear.error' }));
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
        <div
          onClick={() => {
            handleBack(type === 'loading');
          }}
          className={actionCls}
        >
          <Tooltip title={intl({ id: 'org.umi.ui.global.home' })}>
            <HomeFilled style={{ marginRight: 4 }} />
          </Tooltip>
        </div>
        {type !== 'list' && path && name && (
          <>
            <div className={actionCls} onClick={() => handleCopyPath(path)}>
              <FolderFilled style={{ marginRight: 4 }} /> {path}
            </div>
          </>
        )}
        <div onClick={() => (logVisible ? hideLogPanel() : showLogPanel())} className={logCls}>
          <ProfileFilled style={{ marginRight: 4 }} /> {intl({ id: 'org.umi.ui.global.log' })}
        </div>

        <div className={styles.section}>
          {/* TODO: register with framework, bigfish use office network */}
          <Popover
            title={null}
            placement="top"
            overlayClassName={styles.help}
            content={
              <div className={styles.feedback}>
                <img
                  width={window.g_bigfish ? 150 : 230}
                  height={window.g_bigfish ? 200 : 150}
                  src={
                    window.g_bigfish
                      ? '//gw-office.alipayobjects.com/basement_prod/bd018d14-7cfd-4410-97dc-84bfd7bb6a8c.jpg'
                      : '//img.alicdn.com/tfs/TB1n__6eFP7gK0jSZFjXXc5aXXa-737-479.png'
                  }
                />
              </div>
            }
          >
            <a>
              <Message style={{ marginRight: 4 }} />{' '}
              {type === 'loading'
                ? intl({ id: 'org.umi.ui.global.feedback' })
                : intl({ id: 'org.umi.ui.global.feedback' })}
            </a>
          </Popover>
        </div>

        {FOOTER_RIGHT.map((item, i) => (
          <div className={styles.section} key={i.toString()}>
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              {item.icon} {intl({ id: item.title })}
            </a>
          </div>
        ))}
        <div className={styles.section} style={{ cursor: 'pointer' }}>
          <Dropdown overlay={menu} placement="topCenter">
            <p>
              <LocaleText locale={locale} />
              {/* <span style={{ marginLeft: 8 }}>
                <Swap />
              </span> */}
            </p>
          </Dropdown>
        </div>
        <div className={styles.version}>
          <span>
            <TagIcon style={{ marginRight: 4 }} />
            {window.g_bigfish ? get(window, 'g_bigfish.version') : get(window, 'g_umi.version')}
          </span>
        </div>
      </div>
      <Drawer
        title={
          <div className={styles['section-drawer-title']}>
            <h1>{intl({ id: 'org.umi.ui.global.log.upperCase' })}</h1>
            <div className={styles['section-drawer-title-action']}>
              <Popconfirm
                title={intl({ id: 'org.umi.ui.global.log.clear.confirm' })}
                onConfirm={handleClearLog}
                okText={intl({ id: 'org.umi.ui.global.okText' })}
                cancelText={intl({ id: 'org.umi.ui.global.cancelText' })}
              >
                <Tooltip title={intl({ id: 'org.umi.ui.global.log.clear.tooltip' })}>
                  <Delete />
                </Tooltip>
              </Popconfirm>
              <Tooltip title={intl({ id: 'org.umi.ui.global.log.enter.tooltip' })}>
                <Enter onClick={handleScorllBottom} />
              </Tooltip>
              <Divider type="vertical" />
              <Close onClick={hideLogPanel} />
            </div>
          </div>
        }
        closable={false}
        visible={logVisible}
        placement="bottom"
        mask={false}
        className={styles['section-drawer']}
        height={300}
      >
        <Logs
          logs={logs}
          type={type}
          className={styles['section-drawer-logs']}
          style={{
            height: 225,
          }}
        />
      </Drawer>
    </div>
  );
};

export default Footer;
